
import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#0B1A2A', padding: 20, paddingBottom: 24 }}>
          {/* Drag bar */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#fff', opacity: 0.2 }} />
          </View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 16 }}>Event location</Text>
          {/* Search bar removed for debugging */}
          {/* RSVP checkbox */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
            onPress={() => setLocation(loc => ({ ...loc, rsvpFirst: !location.rsvpFirst }))}
            activeOpacity={0.7}
          >
            <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#888', backgroundColor: location.rsvpFirst ? '#7A5CFA' : 'transparent', marginRight: 8, justifyContent: 'center', alignItems: 'center' }}>
              {location.rsvpFirst && <View style={{ width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 }} />}
            </View>
            <Text style={{ color: '#B0B8C1', fontSize: 14 }}>Guests must RSVP first to see location</Text>
          </TouchableOpacity>
          {/* Location list */}
          <View style={{ marginBottom: 16 }}>
            {safeLocations.map((loc, idx) => (
              <TouchableOpacity
                key={idx}
                style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, opacity: location.selected === loc.address ? 1 : 0.7 }}
                onPress={() => setLocation(loca => ({ ...loca, selected: loc.address, search: loc.address }))}
                activeOpacity={0.7}
              >
                <LocationIcon width={16} height={16} style={{ marginTop: 2, marginRight: 6 }} />
                <View>
                  <Text style={{ color: 'white', fontSize: 16 }}>{loc.address}</Text>
                  <Text style={{ color: '#B0B8C1', fontSize: 13 }}>{loc.city}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {/* Display name */}
          <View style={{ marginBottom: 10 }}>
            <TextInput
              style={{ backgroundColor: '#16263A', borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 4 }}
              placeholder="eg. Jonny's apartment"
              placeholderTextColor="#FFFFFF99"
              value={location.name}
              onChangeText={text => setLocation(loc => ({ ...loc, name: text }))}
            />
          </View>
          {/* Apt / Suite / Floor */}
          <View style={{ marginBottom: 10 }}>
            <TextInput
              style={{ backgroundColor: '#16263A', borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 4 }}
              placeholder="eg. Room 12E"
              placeholderTextColor="#FFFFFF99"
              value={location.aptSuite}
              onChangeText={text => setLocation(loc => ({ ...loc, aptSuite: text }))}
            />
          </View>
          {/* Further notes */}
          <View style={{ marginBottom: 18 }}>
            <TextInput
              style={{ backgroundColor: '#16263A', borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 }}
              placeholder="eg. take the second elevator, not the first one"
              placeholderTextColor="#FFFFFF99"
              value={location.notes}
              onChangeText={text => setLocation(loc => ({ ...loc, notes: text }))}
            />
          </View>
          {/* Save and Cancel buttons */}
          <TouchableOpacity
            style={{ backgroundColor: '#7A5CFA', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginBottom: 10 }}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#1A2636', borderRadius: 999, paddingVertical: 12, alignItems: 'center' }}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#B0B8C1', fontWeight: 'bold', fontSize: 17 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
export default LocationModal;
