
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  locations?: { address: string; city: string }[];
}

function LocationModal({ visible, onClose, location, setLocation, locations }: LocationModalProps) {
  const safeLocations = Array.isArray(locations) ? locations : [];
  // Animation logic (slide up/down)
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Tap outside to close */}
        <TouchableOpacity
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%' }}
        >
          <Animated.View
            style={[tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            { backgroundColor: '#080B32', marginBottom: 0, paddingHorizontal: 0, paddingBottom: 0 },
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400],
                  }),
                },
              ],
            },
            ]}
          >
            {/* Drag bar */}
            <Text style={[tw`text-white text-[15px] mb-4`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Set event location</Text>
            {/* Set location box with search icon */}
            <View style={tw`mb-2.5 mx-3 bg-white/10 rounded-xl px-3 pt-0.5`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="search" size={16} color="#9ca3af" style={tw`mr-2`} />
                <TextInput
                  style={[tw`w-full text-white text-[14px]`, { fontFamily: 'Nunito-Medium' }]}
                  placeholder="Set your location"
                  placeholderTextColor="#9ca3af"
                  value={location.search}
                  onChangeText={text => setLocation(loc => ({ ...loc, search: text }))}
                />
              </View>
            </View>
            {/* RSVP checkbox */}
            <TouchableOpacity
              style={tw`flex-row items-center mx-3`}
              onPress={() => setLocation(loc => ({ ...loc, rsvpFirst: !location.rsvpFirst }))}
              activeOpacity={0.7}
            >
              <View style={[
                tw`w-[0.9rem] h-[0.9rem] rounded border border-gray-400 items-center justify-center mr-2`,
                location.rsvpFirst ? tw`bg-[#7A5CFA]` : tw`bg-white/10`
              ]}>
                {/* Unchecked: no checkmark */}
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
            {/* Location list */}
            <View style={tw`mb-4 mx-3`}>
              {safeLocations.map((loc, idx) => (
                <TouchableOpacity
                  key={idx}
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
            {/* Display name */}
            {location.selected &&
              <View style={tw`mb-2 mx-3`}>
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
            {/* Save and Cancel buttons */}
            <View style={tw`px-3 pb-4`}>
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
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
export default LocationModal;
