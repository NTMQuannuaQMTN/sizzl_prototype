
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../store/userStore';

import Back from '../../assets/icons/back.svg';
import Camera from '../../assets/icons/camera_icon.svg';
import Host from '../../assets/icons/host.svg';
import Location from '../../assets/icons/location.svg';
import PfpDefault from '../../assets/icons/pfpdefault.svg';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import RSVP from '../../assets/icons/time.svg';

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [publicEvent, setPublic] = useState(true);
  const { user } = useUserStore();
  const [bio, setBio] = useState('');
  const [special, setSpecial] = useState({
    cash: '',
    food: '',
    merch: '',
    coolPrize: '',
  });
  const [specialBox, setSpecialBox] = useState({
    cash: false,
    food: false,
    merch: false,
    coolPrize: false,
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState({
    search: '',
    selected: '',
    rsvpFirst: false,
    name: '',
    aptSuite: '',
    notes: '',
  });

  // Dummy locations for demonstration
  const locations = [
    {
      address: '1234 A Rd',
      city: 'East Lansing, MI, 48825',
    },
    {
      address: '1234 A Rd',
      city: 'East Lansing, MI, 48825',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#100000', paddingTop: 40, paddingBottom: 20 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        {/* Top bar */}
        <View style={tw`flex-row items-center justify-between px-4 mt-2 mb-1`}>
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity onPress={() => router.navigate('/(home)/home/explore')}><Back></Back></TouchableOpacity>
            <Text style={[tw`text-white text-base font-bold`, { fontFamily: 'Nunito-ExtraBold' }]}>New event</Text>
          </View>
          <View style={tw`bg-[#7b61ff] rounded-full px-4 py-1`}>
            <Text style={tw`text-white font-bold`}>Done</Text>
          </View>
        </View>

        {/* Title input */}
        <View style={tw`px-4 mb-2`}>
          <TextInput style={tw`text-white text-2xl font-extrabold`}
            value={title}
            onChangeText={setTitle}
            placeholder='add a title'
            placeholderTextColor={'#FFFFFFAA'}></TextInput>
        </View>

        <View style={tw`flex-row items-center mx-3 mb-2`}>
          <TouchableOpacity style={tw`flex-row items-center gap-2 justify-center bg-[#064B55] ${publicEvent ? '' : 'opacity-30'} rounded-full px-2 py-0.5 mr-1`}
            onPress={() => { setPublic(true) }}>
            <Public></Public>
            <Text style={tw`text-md text-white`}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-row items-center gap-2 justify-center bg-[#04192E] ${publicEvent ? 'opacity-30' : ''} rounded-full px-2 py-0.5`}
            onPress={() => { setPublic(false) }}>
            <Private></Private>
            <Text style={tw`text-md text-gray-400`}>Private</Text>
          </TouchableOpacity>
        </View>

        {/* Image picker */}
        <View style={tw`px-4 mb-3`}>
          <View style={tw`rounded-2xl overflow-hidden w-full h-36 bg-[#f5e2c6] items-center justify-center relative`}>
            {/* Placeholder for event image */}
            <View style={tw`flex-row gap-1 absolute top-2 right-2 bg-white/80 rounded px-2 py-1`}>
              <Camera></Camera>
              <Text style={tw`text-xs text-black font-bold`}>Choose</Text>
            </View>
            {/* Example illustration */}
            <View style={tw`flex-row items-center justify-center`}>
              <View style={tw`mr-2`}>
                <View style={tw`w-16 h-16 bg-[#e94e3c] rounded-lg`} />
              </View>
              <View>
                <View style={tw`w-20 h-16 bg-[#e94e3c] rounded-lg mb-1`} />
                <View style={tw`w-10 h-6 bg-[#fff] rounded-lg`} />
              </View>
            </View>
            <Text style={tw`absolute bottom-2 left-2 text-xs text-[#e94e3c] font-bold`}>FOR SOME MOVIE AND SNACKS ALRIGHT</Text>
          </View>
        </View>

        {/* Set date and time */}
        <View style={tw`px-4 mb-3`}>
          {/* Placeholder for date/time picker */}
          <TouchableOpacity style={tw`bg-white/10 rounded-xl px-4 py-3 flex-row items-center mb-1`}>
            <Text style={tw`text-white/70 text-base`}>Set date and time</Text>
          </TouchableOpacity>
        </View>

        {/* Hosted by */}
        <View style={tw`px-4 mb-3`}>
          <View style={tw`bg-white/10 rounded-xl px-4 py-3`}>
            <View style={tw`flex-row gap-2`}>
              <Host></Host>
              <Text style={tw`text-white/70 text-xs mb-2`}>Hosted by</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              {/* Host avatar */}
              <View style={[tw`rounded-full border border-white items-center justify-center bg-white/10`, { width: 30, height: 30, overflow: 'hidden' }]}>
                {user?.profile_image ? (
                  <Image
                    source={{ uri: user.profile_image }}
                    style={{ width: 30, height: 30, borderRadius: 60 }}
                    defaultSource={require('../../assets/icons/pfpdefault.svg')}
                    onError={() => { }}
                  />
                ) : (
                  <PfpDefault width={30} height={30} />
                )}
              </View>
              <Text
                style={tw`text-white ml-auto text-xs bg-transparent px-2 py-1`}
              >Add cohosts (optional)</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={tw`px-4 mb-3`}>
          <TouchableOpacity
            style={tw`bg-white/10 flex-row items-center gap-1 rounded-xl px-4 py-3`}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.7}
          >
            <Location width={15} height={15}></Location>
            <Text style={tw`text-white/70 text-md`}>Location</Text>
          </TouchableOpacity>
        </View>

        {/* RSVP deadline */}
        <View style={tw`px-4 mb-3`}>
          <View style={tw`bg-white/10 flex-row items-center gap-1 rounded-xl px-4 py-3`}>
            <RSVP width={15} height={15}></RSVP>
            <Text style={tw`text-white/70 text-md`}>RSVP deadline</Text>
          </View>
        </View>

        {/* About this event */}
        <View style={tw`px-4 mb-3`}>
          <View style={tw`bg-white/10 rounded-xl px-4 pb-3 pt-2`}>
            <TextInput
              style={tw`text-white text-base bg-transparent px-0 py-0`}
              placeholder="About this event"
              placeholderTextColor="#FFFFFFAA"
              multiline
              value={bio}
              onChangeText={setBio}
            />
          </View>
        </View>

        {/* What's special? */}
        <View style={tw`px-4 mb-1`}>
          <Text style={tw`text-white text-base font-extrabold mb-2`}>What's special?</Text>
          {/* Special event perks selection UI */}
          <View style={tw`gap-2`}>
            {/* Selected: Cash prize */}
            <TouchableOpacity style={tw`flex-row items-center`}
              onPress={() => setSpecialBox((sp) => ({ ...sp, cash: !specialBox.cash }))}>
              <View style={[tw`w-4 h-4 rounded border border-gray-400 mr-2 items-center justify-center ${specialBox.cash ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                {/* Unchecked: no checkmark */}
              </View>
              <View style={tw`flex-row items-center bg-yellow-200/90 px-3 py-1 rounded-full`}>
                <Text style={tw`text-green-700 text-base mr-1`}>💸</Text>
                <Text style={tw`text-gray-900 text-base font-bold`}>Cash prize</Text>
              </View>
            </TouchableOpacity>
            {/* Custom text input for "What's special?" */}
            {specialBox.cash && <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-white bg-white/10 rounded px-3 pt-2 pb-3 text-base`}
                placeholder="Add details (optional)"
                placeholderTextColor="#FFFFFFAA"
                value={special.cash}
                onChangeText={text => setSpecial(sp => ({ ...sp, cash: text }))}
              />
            </View>}
            {/* Other options */}
            <TouchableOpacity style={tw`flex-row items-center`}
              onPress={() => setSpecialBox((sp) => ({ ...sp, food: !specialBox.food }))}>
              <View style={[tw`w-4 h-4 rounded border border-gray-400 mr-2 items-center justify-center ${specialBox.food ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                {/* Unchecked: no checkmark */}
              </View>
              <View style={tw`flex-row items-center bg-sky-200/90 px-3 py-1 rounded-full`}>
                <Text style={tw`text-gray-700 text-base mr-1`}>🧋</Text>
                <Text style={tw`text-gray-900 text-base font-bold`}>Free food</Text>
              </View>
            </TouchableOpacity>
            {/* Custom text input for "What's special?" */}
            {specialBox.food && <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-white bg-white/10 rounded px-3 pt-2 pb-3 text-base`}
                placeholder="Add details (optional)"
                placeholderTextColor="#FFFFFFAA"
                value={special.food}
                onChangeText={text => setSpecial(sp => ({ ...sp, food: text }))}
              />
            </View>}
            <TouchableOpacity style={tw`flex-row items-center`}
              onPress={() => setSpecialBox((sp) => ({ ...sp, merch: !specialBox.merch }))}>
              <View style={[tw`w-4 h-4 rounded border border-gray-400 mr-2 items-center justify-center ${specialBox.merch ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                {/* Unchecked: no checkmark */}
              </View>
              <View style={tw`flex-row items-center bg-pink-200/90 px-3 py-1 rounded-full`}>
                <Text style={tw`text-gray-700 text-base mr-1`}>👕</Text>
                <Text style={tw`text-gray-900 text-base font-bold`}>Free merch</Text>
              </View>
            </TouchableOpacity>
            {/* Custom text input for "What's special?" */}
            {specialBox.merch && <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-white bg-white/10 rounded px-3 pt-2 pb-3 text-base`}
                placeholder="Add details (optional)"
                placeholderTextColor="#FFFFFFAA"
                value={special.merch}
                onChangeText={text => setSpecial(sp => ({ ...sp, merch: text }))}
              />
            </View>}
            <TouchableOpacity style={tw`flex-row items-center`}
              onPress={() => setSpecialBox((sp) => ({ ...sp, coolPrize: !specialBox.coolPrize }))}>
              <View style={[tw`w-4 h-4 rounded border border-gray-400 mr-2 items-center justify-center ${specialBox.coolPrize ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                {/* Unchecked: no checkmark */}
              </View>
              <View style={tw`flex-row items-center bg-green-200/90 px-3 py-1 rounded-full`}>
                <Text style={tw`text-gray-700 text-base mr-1`}>🎟️</Text>
                <Text style={tw`text-gray-900 text-base font-bold`}>Cool prizes</Text>
              </View>
            </TouchableOpacity>
            {/* Custom text input for "What's special?" */}
            {specialBox.coolPrize && <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-white bg-white/10 rounded px-3 pt-2 pb-3 text-base`}
                placeholder="Add details (optional)"
                placeholderTextColor="#FFFFFFAA"
                value={special.coolPrize}
                onChangeText={text => setSpecial(sp => ({ ...sp, coolPrize: text }))}
              />
            </View>}
          </View>
        </View>
      </ScrollView>
      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <View style={{ width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#0B1A2A', padding: 20, paddingBottom: 32 }}>
            {/* Drag bar */}
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#fff', opacity: 0.2 }} />
            </View>
            <Text style={[tw`text-white text-lg font-bold`, { textAlign: 'center', marginBottom: 16 }]}>Event location</Text>
            {/* Search bar */}
            <View style={{ marginBottom: 10 }}>
              <TextInput
                style={{ backgroundColor: '#16263A', borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 }}
                placeholder="Set your location..."
                placeholderTextColor="#FFFFFF55"
                value={location.search}
                onChangeText={text => setLocation(loc => ({...loc, search: text}))}
              />
            </View>
            {/* RSVP checkbox */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
              onPress={() => setLocation(loc => ({...loc, rsvpFirst: !location.rsvpFirst}))}
              activeOpacity={0.7}
            >
              <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#888', backgroundColor: location.rsvpFirst ? '#7A5CFA' : 'transparent', marginRight: 8, justifyContent: 'center', alignItems: 'center' }}>
                {location.rsvpFirst && <View style={{ width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 }} />}
              </View>
              <Text style={{ color: '#B0B8C1', fontSize: 14 }}>Guests must RSVP first to see location</Text>
            </TouchableOpacity>
            {/* Location list */}
            <View style={{ marginBottom: 10 }}>
              {locations.map((loc, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, opacity: location.selected === loc.address ? 1 : 0.7 }}
                  onPress={() => setLocation(loca => ({...loca, selected: loc.address}))}
                  activeOpacity={0.7}
                >
                  <Location width={16} height={16} style={{ marginTop: 2, marginRight: 6 }} />
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
                placeholderTextColor="#FFFFFF55"
                value={location.name}
                onChangeText={text => setLocation(loc => ({...loc, name: text}))}
              />
            </View>
            {/* Apt/Suite/Floor */}
            <View style={{ marginBottom: 10 }}>
              <TextInput
                style={{ backgroundColor: '#16263A', borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 4 }}
                placeholder="eg. Room 12E"
                placeholderTextColor="#FFFFFF55"
                value={location.aptSuite}
                onChangeText={text => setLocation(loc => ({...loc, aptSuite: text}))}
              />
            </View>
            {/* Further notes */}
            <View style={{ marginBottom: 18 }}>
              <TextInput
                style={{ backgroundColor: '#16263A', borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 }}
                placeholder="eg. take the second elevator, not the first one"
                placeholderTextColor="#FFFFFF55"
                value={location.notes}
                onChangeText={text => setLocation(loc => ({...loc, notes: text}))}
              />
            </View>
            {/* Save and Cancel buttons */}
            <TouchableOpacity
              style={{ backgroundColor: '#7A5CFA', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginBottom: 10 }}
              onPress={() => setShowLocationModal(false)}
              activeOpacity={0.8}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#1A2636', borderRadius: 999, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setShowLocationModal(false)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#B0B8C1', fontWeight: 'bold', fontSize: 17 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
