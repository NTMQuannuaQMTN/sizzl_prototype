import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Keyboard, Modal, PanResponder, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import tw from 'twrnc';
import LocationIcon from '../../assets/icons/location.svg';

interface LocationType {
  search: string;
  selected: string;
  rsvpFirst: boolean;
  name: string;
  aptSuite: string;
  notes: string;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  location: LocationType;
  setLocation: (loc: LocationType | ((prev: LocationType) => LocationType)) => void;
  locations?: { address: string; city: string }[]; // This might become initial suggestions or predefined options
}

// Interface for Nominatim fetched suggestions
interface NominatimLocationSuggestion {
  address: string; // display_name from Nominatim
  city: string;    // derived from Nominatim's address object
  // You might add more fields like lat, lon, place_id etc. if needed
}

function LocationModal({ visible, onClose, location, setLocation, locations }: LocationModalProps) {
  const safeLocations = Array.isArray(locations) ? locations : [];

  // --- Draggable Modal Logic (from cohost.tsx) ---
  const MODAL_HEIGHT = 760; // Adjust as needed for content height
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const [isModalMounted, setIsModalMounted] = useState(false);

  // --- State for Nominatim suggestions ---
  const [nominatimSuggestions, setNominatimSuggestions] = useState<NominatimLocationSuggestion[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
      },
      onPanResponderGrant: (evt, gestureState) => {
        slideAnim.stopAnimation();
        pan.setOffset({ x: 0, y: (slideAnim as any).__getValue() });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        const clampedDy = Math.max(0, gestureState.dy);
        pan.setValue({ x: 0, y: clampedDy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        const currentPosition = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0;
        const slideDownThreshold = MODAL_HEIGHT * 0.3;
        const velocityThreshold = 0.5;
        if (currentPosition > slideDownThreshold || gestureState.vy > velocityThreshold) {
          Animated.timing(slideAnim, {
            toValue: MODAL_HEIGHT,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 10,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
          });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setIsModalMounted(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsModalMounted(false);
        pan.setValue({ x: 0, y: 0 });
        setNominatimSuggestions([]); // Clear suggestions when modal closes
      });
    }
  }, [visible]);

  // --- Debounced API call for location search using Nominatim ---
  const fetchNominatimSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { // Only search if query is at least 3 characters long
      setNominatimSuggestions([]);
      return;
    }

    // Nominatim API endpoint
    const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`; // limit to 5 results

    try {
      const response = await fetch(endpoint, {
        headers: {
          // IMPORTANT: Nominatim requires a User-Agent header.
          // Replace 'YourAppName/1.0 (your-email@example.com)' with something specific to your app.
          'User-Agent': 'YourEventApp/1.0 (contact@yourappdomain.com)',
        },
      });
      const data: any[] = await response.json(); // Nominatim returns an array

      const suggestions: NominatimLocationSuggestion[] = data.map((item: any) => ({
        address: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village || item.address?.county || '', // Try to get the most specific city/town
      }));
      setNominatimSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching Nominatim suggestions:", error);
      setNominatimSuggestions([]);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (location.search) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchNominatimSuggestions(location.search);
      }, 500); // Debounce for 500ms
    } else {
      setNominatimSuggestions([]); // Clear suggestions if search input is empty
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [location.search, fetchNominatimSuggestions]);

  if (!isModalMounted) return null;

  const combinedTranslateY = Animated.add(slideAnim, pan.y);

  return (
    <Modal
      visible={visible || isModalMounted}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={tw`flex-1 justify-end items-center`}>
        {/* Backdrop for closing the modal by tapping outside */}
        <TouchableOpacity
          style={tw`absolute inset-0 bg-black/50`}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            {
              backgroundColor: '#080B32',
              height: MODAL_HEIGHT,
            },
            {
              transform: [{ translateY: combinedTranslateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {/* Using ScrollView here to ensure content is scrollable if it exceeds modal height */}
            <View style={{ flexGrow: 1 }}>
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                <View>
                  {/* Gray drag handle */}
                  <View style={tw`w-12 h-1.5 bg-gray-500 rounded-full self-center mb-3`} />
                  <Text style={[tw`text-white text-[15px] mb-4`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Set event location</Text>
                  {/* Set location box with search icon */}
                  <View style={tw`mb-2.5 mx-3 bg-white/10 rounded-xl px-3 py-4`}>
                    <View style={tw`flex-row items-center`}>
                      <Ionicons name="search" size={16} color="#9ca3af" style={tw`mr-2`} />
                      <TextInput
                        style={[tw`flex-1 text-white text-[14px]`, { fontFamily: 'Nunito-Medium' }]}
                        placeholder="Set your location"
                        placeholderTextColor="#9ca3af"
                        value={location.search}
                        onChangeText={text => {
                          setLocation(loc => ({ ...loc, search: text }));
                          // Clear selected if user starts typing again or if current search doesn't match selected
                          if (location.selected && text !== location.selected) {
                            setLocation(loc => ({ ...loc, selected: '' }));
                          }
                        }}
                      />
                    </View>
                  </View>

                  {/* --- Display Nominatim Suggestions as FlatList --- */}
                  {nominatimSuggestions.length > 0 && (
                    <View style={tw`mx-3 mb-3 bg-white/10 rounded-xl max-h-48`}>
                      <FlatList
                        data={nominatimSuggestions}
                        keyExtractor={(item, idx) => item.address + idx}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={tw`flex-row items-start px-3 py-2 border-b border-white/5`}
                            onPress={() => {
                              setLocation(loca => ({
                                ...loca,
                                selected: item.address,
                                search: item.address,
                                name: item.address,
                              }));
                              setNominatimSuggestions([]);
                              Keyboard.dismiss();
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="location-outline" size={16} color="#9ca3af" style={tw`mr-3`} />
                            <View style={tw`flex-1`}>
                              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-Medium' }]}>{item.address}</Text>
                              {!!item.city && (
                                <Text style={[tw`text-gray-400 text-[12px]`, { fontFamily: 'Nunito-Regular' }]}>{item.city}</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}

                  {/* Existing Location list (if you want to keep predefined locations, these would typically be hidden if search results are showing) */}
                  {safeLocations.length > 0 && nominatimSuggestions.length === 0 && ( // Only show predefined if no search results
                    <View style={tw`mb-4 mx-3`}>
                      {safeLocations.map((loc, idx) => (
                        <TouchableOpacity
                          key={`predefined-${idx}`}
                          style={[tw`flex-row items-start mb-2`, { opacity: location.selected === loc.address ? 1 : 0.7 }]}
                          onPress={() => setLocation(loca => ({ ...loca, selected: loc.address, search: loc.address }))}
                          activeOpacity={0.7}
                        >
                          <LocationIcon width={16} height={16} style={{ marginTop: 2, marginRight: 6 }} />
                          <View>
                            <Text style={[tw`text-white text-[16px]`, { fontFamily: 'Nunito-Bold' }]}>{loc.address}</Text>
                            <Text style={[tw`text-[#B0B8C1] text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>{loc.city}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* RSVP checkbox */}
                  <TouchableOpacity
                    style={tw`flex-row items-center mx-3.5`}
                    onPress={() => setLocation(loc => ({ ...loc, rsvpFirst: !location.rsvpFirst }))}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      tw`w-[0.9rem] h-[0.9rem] rounded border border-gray-400 items-center justify-center mr-2`,
                      location.rsvpFirst ? tw`bg-[#7A5CFA]` : tw`bg-white/10`
                    ]}>
                      {location.rsvpFirst && (
                        <View style={tw`w-2 h-2`} />
                      )}
                    </View>
                    <Text style={[
                      tw`${location.rsvpFirst ? 'text-white' : 'text-gray-400'} text-[13px]`,
                      { fontFamily: 'Nunito-Medium' }
                    ]}>
                      Guests must RSVP first to see location
                    </Text>
                  </TouchableOpacity>
                  {/* Display name */}
                  {location.selected &&
                    <View style={tw`mb-2 mx-3 mt-4`}>
                      <Text style={[tw`text-white text-[13px] mb-1`, { fontFamily: 'Nunito-Bold' }]}>Display name</Text>
                      <View style={tw`bg-white/10 rounded-xl px-3 pt-0.5`}>
                        <TextInput
                          style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Medium' }]}
                          placeholder="eg. Jonny's apartment"
                          placeholderTextColor="#9ca3af"
                          value={location.name}
                          onChangeText={text => setLocation(loc => ({ ...loc, name: text }))}
                        />
                      </View>
                    </View>
                  }
                  {/* Apt / Suite / Floor */}
                  {location.selected &&
                    <View style={tw`mb-2 mx-3`}>
                      <Text style={[tw`text-white text-[13px] mb-1`, { fontFamily: 'Nunito-Bold' }]}>Apt / Suite / Floor</Text>
                      <View style={tw`bg-white/10 rounded-xl px-3 pt-0.5`}>
                        <TextInput
                          style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Medium' }]}
                          placeholder="eg. Room 12E"
                          placeholderTextColor="#9ca3af"
                          value={location.aptSuite}
                          onChangeText={text => setLocation(loc => ({ ...loc, aptSuite: text }))}
                        />
                      </View>
                    </View>
                  }
                  {/* Further notes */}
                  {location.selected &&
                    <View style={tw`mb-4 mx-3`}>
                      <Text style={[tw`text-white text-[13px] mb-1`, { fontFamily: 'Nunito-Bold' }]}>Further notes</Text>
                      <View style={tw`bg-white/10 rounded-xl px-3 pt-0.5`}>
                        <TextInput
                          style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Medium' }]}
                          placeholder="eg. take the second elevator, not the first one"
                          placeholderTextColor="#9ca3af"
                          value={location.notes}
                          onChangeText={text => setLocation(loc => ({ ...loc, notes: text }))}
                        />
                      </View>
                    </View>
                  }
                </View>
                {/* Save and Cancel buttons always at the bottom */}
                <View style={tw`px-3 pb-8`}>
                  <TouchableOpacity
                    style={[tw`bg-[#7A5CFA] rounded-full py-3 items-center mb-2`, { opacity: 1 }]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[tw`bg-white/5 rounded-full py-3 items-center`, { opacity: 1 }]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
}
export default LocationModal;