
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../store/userStore';

import { supabase } from '@/utils/supabase';
import Back from '../../assets/icons/back.svg';
import Camera from '../../assets/icons/camera_icon.svg';
import Host from '../../assets/icons/host.svg';
import HostWhite from '../../assets/icons/hostwhite-icon.svg';
import Location from '../../assets/icons/location.svg';
import LocationWhite from '../../assets/icons/locationwhite-icon.svg';
import PfpDefault from '../../assets/icons/pfpdefault.svg';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import RSVP from '../../assets/icons/time.svg';
import CohostModal from './cohost';
import DateTimeModal from './dateTimeModal';
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

  // Dummy locations for demonstration
  // To get all locations from Google Maps, you typically need to use the Google Places API or Geocoding API.
  // Here is an example of how you might fetch places near a location using the Google Places API (requires an API key):

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
      style={{ flex: 1, backgroundColor: '#300000', paddingTop: 0, paddingBottom: 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        {/* Top bar */}
        <View style={tw`flex-row items-center justify-between px-4 mt-10 mb-1.5`}>
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity onPress={() => router.navigate('/(home)/home/explore')}><Back></Back></TouchableOpacity>
            <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Create event</Text>
          </View>
          <TouchableOpacity style={tw`bg-[#7b61ff] rounded-full px-4 py-1`}>
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Title input */}
        <View style={tw`px-4 mb-2 items-center`}>
          <TextInput style={[tw`text-white text-[22px]`, {fontFamily: 'Nunito-ExtraBold'}]}
            value={title}
            onChangeText={setTitle}
            placeholder='your event title'
            placeholderTextColor={'#9ca3af'}>
          </TextInput>
        </View>

        <View style={tw`flex-row items-center mx-4 mb-2.5`}>
          <TouchableOpacity style={tw`flex-row items-center gap-2 justify-center bg-[#064B55] ${publicEvent ? 'border border-white/10' : 'opacity-30'} rounded-full px-2 py-0.5 mr-1`}
            onPress={() => { setPublic(true) }}>
            <Public></Public>
            <Text style={[tw`text-[13px] text-white`, {fontFamily: 'Nunito-ExtraBold'}]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-row items-center gap-2 justify-center bg-[#080B32] ${publicEvent ? 'opacity-30' : 'border border-purple-900'} rounded-full px-2 py-0.5`}
            onPress={() => { setPublic(false) }}>
            <Private></Private>
            <Text style={[tw`text-[13px] text-white`, {fontFamily: 'Nunito-ExtraBold'}]}>Private</Text>
          </TouchableOpacity>
        </View>

        {/* Image picker */}
        <View style={tw`px-4 mb-3`}>
          <View
            style={[
              tw`rounded-xl overflow-hidden w-full bg-[#f5e2c6] items-center justify-center relative`,
              { aspectRatio: 410 / 279, height: undefined },
            ]}
          >
            {/* Placeholder for event image */}
            <View style={tw`flex-row items-center gap-1 absolute top-2.5 right-2.5 bg-white rounded-lg px-2 py-1 shadow-md`}>
              <Camera width={14} height={14} />
              <Text style={[tw`text-xs text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>Choose image</Text>
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
            <Text style={tw`absolute bottom-2 left-2 text-xs text-[#e94e3c] font-bold`}>
              FOR SOME MOVIE AND SNACKS ALRIGHT
            </Text>
          </View>
        </View>

        {/* Set date and time */}
        <View style={tw`px-4 mb-2`}>
          {/* Placeholder for date/time picker */}
          <TouchableOpacity style={tw`bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex-row items-center`}
            onPress={() => setShowDateTimeModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[tw`text-gray-400 text-[18px]`, {fontFamily: 'Nunito-ExtraBold'}]}>Set date and time</Text>
          </TouchableOpacity>
        </View>

        {/* Hosted by */}
        <View style={tw`px-4 mb-2`}>
          <TouchableOpacity
            style={tw`bg-white/10 border border-white/20 rounded-xl px-4 py-3`}
            onPress={() => setShowCohostModal(true)}
            activeOpacity={0.8}
          >
            <View style={tw`flex-row gap-2 items-start`}>
              {cohosts.length > 0 ? (
                <HostWhite width={14} height={14} style={tw`mt-0.5`} />
              ) : (
                <Host width={14} height={14} style={tw`mt-0.5`} />
              )}
              <Text
                style={[
                  tw`${cohosts.length > 0 ? 'text-white' : 'text-gray-400'} text-[13px] mb-2`,
                  { fontFamily: 'Nunito-ExtraBold', textAlignVertical: 'center' }
                ]}
              >
                Hosted by{' '}
                {cohosts.filter(c => typeof c === 'string').slice(0, 2).join(', ')}
                {cohosts.filter(c => typeof c === 'string').length > 2 &&
                  ` and ${cohosts.filter(c => typeof c === 'string').length - 2} more`}
              </Text>
            </View>
            <View style={tw`flex-row items-center gap-1.5`}>
              {/* Host avatar */}
              <View style={tw`flex-row items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-2 rounded-xl`}>
                <View style={[tw`rounded-full border border-white/20 items-center justify-center bg-white/10`, { width: 30, height: 30, overflow: 'hidden' }]}>
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
                <Text style={[tw`text-white`, {fontFamily: 'Nunito-Bold'}]}>{user.firstname}</Text>
              </View>

              {cohosts.filter(c => typeof c === 'object').slice(0, 2).map((cohost, idx) => {
                return (
                  <View key={cohost.id} style={tw`flex-row items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-2 rounded-xl`}>
                    <View style={[tw`rounded-full border border-white/20 items-center justify-center bg-white/10`, { width: 30, height: 30, overflow: 'hidden' }]}>
                      <Image
                        source={cohost.profile_image ? { uri: cohost.profile_image } : require('../../assets/icons/pfpdefault.svg')}
                        style={{ width: 30, height: 30, borderRadius: 60 }}
                        resizeMode="cover"
                        defaultSource={require('../../assets/icons/pfpdefault.svg')}
                      />
                    </View>
                    <Text style={[tw`text-white`, {fontFamily: 'Nunito-Bold'}]}>{cohost.firstname}</Text>
                  </View>
                );
              })}

              {cohosts.filter(c => typeof c === 'object').length > 2 &&
                <View style={tw`flex-row items-center bg-[#000000] rounded-full px-3 py-2 gap-1.5`}>
                  <Text style={tw`text-white`}>+{cohosts.filter(c => typeof c === 'object').length - 2}</Text>
                </View>}
            </View>
            <TouchableOpacity
              onPress={() => setShowCohostModal(true)}
              activeOpacity={0.8}
              style={tw`self-start`}
            >
              <Text style={[tw`rounded-lg text-white text-xs bg-white/10 border border-white/20 mt-2 -mb-1 py-1 px-2.5`, { fontFamily: 'Nunito-ExtraBold' }]}>
               Add cohosts (optional)
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={tw`px-4 mb-2`}>
          <TouchableOpacity
            style={tw`bg-white/10 border border-white/20 flex-row items-center gap-2 rounded-xl px-4 py-3`}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.7}
          >
            {location.selected
              ? <LocationWhite width={14} height={14} />
              : <Location width={14} height={14} />}
            <Text style={[tw`${location.selected ? 'text-white' : 'text-gray-400'} text-[13px]`, { fontFamily: 'Nunito-ExtraBold' }]}>
              {location.selected ? location.selected : 'Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RSVP deadline */}
        <TouchableOpacity style={tw`px-4 mb-2`}
          activeOpacity={0.7}
        >
          <View style={tw`bg-white/10 border border-white/20 flex-row items-center gap-2 rounded-xl px-4 py-3`}>
            <RSVP width={15} height={15}></RSVP>
            <Text style={[tw`text-gray-400 text-[13px]`, { fontFamily: 'Nunito-ExtraBold' }]}>RSVP deadline</Text>
          </View>
        </TouchableOpacity>

        {/* About this event */}
        <View style={tw`px-4 mb-3`}>
          <View style={tw`bg-white/10 border border-white/20 rounded-xl px-4 pt-3 pb-2`}>
            <TextInput
              style={[
                tw`text-white text-[13px] px-0 py-0 text-left leading-[1.25]`,
                { 
                  fontFamily: bio ? 'Nunito-Medium' : 'Nunito-ExtraBold', 
                  minHeight: 60, 
                  textAlignVertical: 'top' 
                }
              ]}
              placeholder="About this event..."
              placeholderTextColor="#9ca3af"
              multiline={true}
              value={bio}
              onChangeText={text => {
                if (text.length <= 200) setBio(text);
              }}
              blurOnSubmit={true}
              returnKeyType="done"
              maxLength={200}
            />
            <View style={tw`flex-row justify-end mt-0.5 -mr-1`}>
              <Text
                style={[
                  tw`text-[11px]`,
                  { fontFamily: 'Nunito-Medium' },
                  bio.length >= 200 ? tw`text-rose-600` : tw`text-gray-400`
                ]}
              >
                {bio.length}/200
              </Text>
            </View>
          </View>
        </View>

        {/* What's special? */}
        <View style={tw`px-4 mb-8`}>
          <Text style={[tw`text-white text-[15px] mb-2`, { fontFamily: 'Nunito-ExtraBold' }]}>What's special?</Text>
          {/* Special event perks selection UI */}
          <View style={tw`gap-2.5`}>
            {/* Selected: Cash prize */}
            <View style={tw`gap-1.5`}>
              <TouchableOpacity style={tw`flex-row items-center gap-2.5`}
                onPress={() => setSpecialBox((sp) => ({ ...sp, cash: !specialBox.cash }))}
                activeOpacity={0.7}
              >
                <View style={[tw`w-4 h-4 rounded border border-gray-400 items-center justify-center ${specialBox.cash ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                  {/* Unchecked: no checkmark */}
                </View>
                <View style={tw`flex-row items-center bg-yellow-200 px-3 py-1.5 rounded-full`}>
                  <Text style={tw`text-[14px] mr-1.5`}>💸</Text>
                  <Text style={[tw`text-black text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cash prize</Text>
                </View>
              </TouchableOpacity>

              {/* Custom text input for "What's special?" */}
              {specialBox.cash && (
                <View style={tw`pl-6.5 mb-0.5`}>
                  <TextInput
                    style={[
                      tw`items-center flex-1 text-white bg-white/10 border border-white/20 rounded-xl px-3 text-[13px]`,
                      { fontFamily: 'Nunito-Medium' }
                    ]}
                    placeholder="Add details (optional)"
                    placeholderTextColor="#9ca3af"
                    value={special.cash}
                    onChangeText={text => setSpecial(sp => ({ ...sp, cash: text }))}
                  />
                </View>
              )}
            </View>

            {/* Other options */}
            <View style={tw`gap-1.5`}>
              <TouchableOpacity style={tw`flex-row items-center gap-2.5`}
                onPress={() => setSpecialBox((sp) => ({ ...sp, food: !specialBox.food }))}
                activeOpacity={0.7}
              >
                <View style={[tw`w-4 h-4 rounded border border-gray-400 items-center justify-center ${specialBox.food ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                  {/* Unchecked: no checkmark */}
                </View>
                <View style={tw`flex-row items-center bg-sky-200 px-3 py-1.5 rounded-full`}>
                  <Text style={tw`text-[14px] mr-1.5`}>🍕</Text>
                  <Text style={[tw`text-gray-900 text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Free food</Text>
                </View>
              </TouchableOpacity>
              {/* Custom text input for "What's special?" */}
              {specialBox.food && (
                <View style={tw`pl-6.5 mb-0.5`}>
                  <TextInput
                    style={[
                      tw`items-center flex-1 text-white bg-white/10 border border-white/20 rounded-xl px-3 text-[13px]`,
                      { fontFamily: 'Nunito-Medium' }
                    ]}
                    placeholder="Add details (optional)"
                    placeholderTextColor="#9ca3af"
                    value={special.food}
                    onChangeText={text => setSpecial(sp => ({ ...sp, food: text }))}
                  />
                </View>
              )}
            </View>

            <View style={tw`gap-1.5`}>
              <TouchableOpacity style={tw`flex-row items-center gap-2.5`}
                onPress={() => setSpecialBox((sp) => ({ ...sp, merch: !specialBox.merch }))}
                activeOpacity={0.7}
              >
                <View style={[tw`w-4 h-4 rounded border border-gray-400 items-center justify-center ${specialBox.merch ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                  {/* Unchecked: no checkmark */}
                </View>
                <View style={tw`flex-row items-center bg-pink-200/90 px-3 py-1.5 rounded-full`}>
                  <Text style={tw`text-[14px] mr-1.5`}>👕</Text>
                  <Text style={[tw`text-gray-900 text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Free merch</Text>
                </View>
              </TouchableOpacity>
              {/* Custom text input for "What's special?" */}
              {specialBox.merch && (
                <View style={tw`pl-6.5 mb-0.5`}>
                  <TextInput
                    style={[
                      tw`items-center flex-1 text-white bg-white/10 border border-white/20 rounded-xl px-3 text-[13px]`,
                      { fontFamily: 'Nunito-Medium' }
                    ]}
                    placeholder="Add details (optional)"
                    placeholderTextColor="#9ca3af"
                    value={special.merch}
                    onChangeText={text => setSpecial(sp => ({ ...sp, merch: text }))}
                  />
                </View>
              )}
            </View>

            <View style={tw`gap-1.5`}>
              <TouchableOpacity style={tw`flex-row items-center gap-2.5`}
                onPress={() => setSpecialBox((sp) => ({ ...sp, coolPrize: !specialBox.coolPrize }))}
                activeOpacity={0.7}
              >
                <View style={[tw`w-4 h-4 rounded border border-gray-400 items-center justify-center ${specialBox.coolPrize ? 'bg-[#7A5CFA]' : 'bg-white/10'}`]}>
                  {/* Unchecked: no checkmark */}
                </View>
                <View style={tw`flex-row items-center bg-green-200/90 px-3 py-1.5 rounded-full`}>
                  <Text style={tw`text-[14px] mr-1.5`}>🎟️</Text>
                  <Text style={[tw`text-gray-900 text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cool prizes</Text>
                </View>
              </TouchableOpacity>
              {/* Custom text input for "What's special?" */}
              {specialBox.coolPrize && (
                <View style={tw`pl-6.5 mb-0.5`}>
                  <TextInput
                    style={[
                      tw`items-center flex-1 text-white bg-white/10 border border-white/20 rounded-xl px-3 text-[13px]`,
                      { fontFamily: 'Nunito-Medium' }
                    ]}
                    placeholder="Add details (optional)"
                    placeholderTextColor="#9ca3af"
                    value={special.coolPrize}
                    onChangeText={text => setSpecial(sp => ({ ...sp, coolPrize: text }))}
                  />
                </View>
              )}
            </View>
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
        onClose={() => { }}
        startDate={new Date()}
        endDate={new Date()}
        onSave={() => { }}
      />
    </KeyboardAvoidingView>
  );
}
