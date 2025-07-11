
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../store/userStore';

import { supabase } from '@/utils/supabase';
import Back from '../../assets/icons/back.svg';
import Camera from '../../assets/icons/camera_icon.svg';
import Host from '../../assets/icons/host.svg';
import Location from '../../assets/icons/location.svg';
import PfpDefault from '../../assets/icons/pfpdefault.svg';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import RSVP from '../../assets/icons/time.svg';
import CohostModal from './cohost';
import DateTimeModal from './dateTimeModal';
import ImageModal from './imageModal';
import LocationModal from './location';

interface Friend {
  id: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  profile_image?: string;
}

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [publicEvent, setPublic] = useState(true);
  const imageOptions = [
    require('../../assets/images/default_1.png'),
    require('../../assets/images/default_2.png'),
    require('../../assets/images/default_3.png'),
    require('../../assets/images/default_4.png'),
    require('../../assets/images/default_5.png'),
    require('../../assets/images/default_6.png'),
    require('../../assets/images/default_7.png'),
    require('../../assets/images/default_8.png'),
  ];
  const [image, setImage] = useState(imageOptions[Math.floor(Math.random() * 8)]);
  const { user } = useUserStore();
  const [cohosts, setCohosts] = useState([]);
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
  const [showCohostModal, setShowCohostModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [locations, setLocations] = useState<{ address: string; city: string }[]>([]);

  // useEffect(() => {
  //   async function fetchLocations() {
  //     const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key
  //     const lat = 42.7369792; // Example latitude
  //     const lng = -84.4838654; // Example longitude
  //     const radius = 1500; // in meters

  //     // Google Places Nearby Search API endpoint
  //     const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${apiKey}`;

  //     try {
  //       const response = await fetch(url);
  //       const data = await response.json();
  //       if (data.results) {
  //         const formatted = data.results.map((place: any) => ({
  //           address: place.vicinity || place.name,
  //           city: '', // You may need to use Geocoding API to get the city name
  //         }));
  //         setLocations(formatted);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching locations from Google Maps:', error);
  //     }
  //   }

  //   fetchLocations();
  // }, []);

  // Dummy friends data for cohost modal
  // Fetch friends from the "friends" table (replace with your actual data fetching logic)
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    // Example async fetch function, replace with your actual API/database call
    async function fetchFriends() {
      try {
        let idFriend: readonly any[] | undefined = [];
        const { data: idGet, error: idErr } = await supabase
          .from('friends')
          .select('friend').eq('user_id', user.id);
        idFriend = (idGet?.map(f => f.friend));

        const { data, error } = await supabase
          .from('users')
          .select('id, firstname, lastname, username, profile_image')
          .in('id', Array.isArray(idFriend) ? idFriend : []);
        if (!data) throw new Error('No data returned');
        setFriends(data);
      } catch (err) {
        console.error('Failed to fetch friends:', err);
      }
    }
    if (!showCohostModal) fetchFriends();
  }, [showCohostModal]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#100000', paddingTop: 40, paddingBottom: 20 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Image
        source={typeof image === 'string' ? { uri: image } : image}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: undefined,
          minHeight: '100%',
          resizeMode: 'cover',
          zIndex: 0,
        }}
        blurRadius={2}
      />
      <View style={[tw`w-full absolute top-0 bg-black bg-opacity-60`, {minHeight: '100%', height: undefined}]}/>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ zIndex: 1 }}
      >
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
          <TouchableOpacity style={tw`rounded-2xl overflow-hidden w-full h-36 bg-[#f5e2c6] items-center justify-center relative`}
            onPress={() => { setShowImageModal(true) }}>
            <Image
              source={typeof image === 'string' ? { uri: image } : image}
              style={tw`w-full h-36`}
              resizeMode="cover"
            />
            {/* Placeholder for event image */}
            <View style={tw`flex-row gap-1 absolute top-2 right-2 bg-white/80 rounded px-2 py-1`}>
              <Camera />
              <Text style={tw`text-xs text-black font-bold`}>Choose</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Set date and time */}
        <View style={tw`px-4 mb-3`}>
          {/* Placeholder for date/time picker */}
          <TouchableOpacity style={tw`bg-white/10 rounded-xl px-4 py-3 flex-row items-center mb-1`}
            onPress={() => setShowDateTimeModal(true)}>
            <Text style={tw`text-white/70 text-base`}>Set date and time</Text>
          </TouchableOpacity>
        </View>

        {/* Hosted by */}
        <View style={tw`px-4 mb-3`}>
          <TouchableOpacity
            style={tw`bg-white/10 rounded-xl px-4 py-3`}
            onPress={() => setShowCohostModal(true)}
            activeOpacity={0.8}
          >
            <View style={tw`flex-row gap-2`}>
              <Host />
              <Text style={tw`text-white/70 text-xs mb-2`}>Hosted by{' '}
                {cohosts.filter(c => typeof c === 'string').slice(0, 2).join(', ')}{cohosts.filter(c => typeof c === 'string').length > 2 && ` and ${cohosts.filter(c => typeof c === 'string').length - 2} more`}</Text>
            </View>
            <View style={tw`flex-row items-center gap-2`}>
              {/* Host avatar */}
              <View style={tw`flex-row items-center gap-2 bg-black px-3 py-2 rounded-full`}>
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
                <Text style={tw`text-white`}>{user.firstname}</Text>
              </View>

              {cohosts.filter(c => typeof c === 'object').slice(0, 2).map((cohost, idx) => {
                return (
                  <View key={cohost.id} style={tw`flex-row items-center gap-2 bg-black px-3 py-2 rounded-full`}>
                    <View style={[tw`rounded-full border border-white items-center justify-center bg-white/10`, { width: 30, height: 30, overflow: 'hidden' }]}>
                      <Image
                        source={cohost.profile_image ? { uri: cohost.profile_image } : require('../../assets/icons/pfpdefault.svg')}
                        style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#222' }}
                        resizeMode="cover"
                        defaultSource={require('../../assets/icons/pfpdefault.svg')}
                      />
                    </View>
                    <Text style={tw`text-white`}>{cohost.firstname}</Text>
                  </View>
                );
              })}

              {cohosts.filter(c => typeof c === 'object').length > 2 &&
                <View style={tw`flex-row items-center bg-[#000000] rounded-full px-3 py-2 gap-2`}>
                  <Text style={tw`text-white`}>+{cohosts.filter(c => typeof c === 'object').length - 2}</Text>
                </View>}
            </View>
            <Text style={tw`text-white text-xs bg-transparent mt-2 -mb-1 py-1`}>Add cohosts (optional)</Text>
          </TouchableOpacity>
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

      {/* Cohost Modal */}
      <CohostModal
        visible={showCohostModal}
        onClose={() => setShowCohostModal(false)}
        friends={friends}
        cohosts={cohosts}
        onSave={setCohosts}
      />
      {/* Location Modal */}
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        location={location}
        setLocation={setLocation}
        locations={locations}
      />
      <DateTimeModal
        visible={showDateTimeModal}
        onClose={() => { setShowDateTimeModal(false) }}
        startDate={new Date()}
        endDate={new Date()}
        onSave={() => { }}
      />
      <ImageModal
        visible={showImageModal}
        onClose={() => { setShowImageModal(false) }}
        imageOptions={imageOptions}
        onSelect={(img) => {setImage(img)}}
      />
    </KeyboardAvoidingView>
  );
}
