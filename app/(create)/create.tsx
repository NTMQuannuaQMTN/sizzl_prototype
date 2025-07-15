// Helper to format RSVP deadline as 'wed, jul 16, 2025'
function formatRSVPDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  const dayNum = String(Number(day));
  return `${weekday}, ${month} ${dayNum}, ${year}`;
}
// Helper to format date as 'Tuesday, Jul 15, 2025'
function formatFullDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  // Remove any leading zero from day
  const dayNum = String(Number(day));
  return `${weekday}, ${month} ${dayNum}, ${year}`;
}
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import tw from 'twrnc';
import { useUserStore } from '../store/userStore';

import { supabase } from '@/utils/supabase';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import Back from '../../assets/icons/back.svg';
import Camera from '../../assets/icons/camera_icon.svg';
import Host from '../../assets/icons/host.svg';
import HostWhite from '../../assets/icons/hostwhite-icon.svg';
import Location from '../../assets/icons/location.svg';
import LocationWhite from '../../assets/icons/locationwhite-icon.svg';
import PfpDefault from '../../assets/icons/pfpdefault.svg';
import RSVP from '../../assets/icons/time.svg';
import RSVPWhite from '../../assets/icons/timewhite.svg';
import CohostModal from './cohost';
import DateTimeModal from './dateTimeModal';
import defaultImages from './defaultimage';
import ImageModal from './imageModal';
import MoreSettingsModal from './moreSettingsModal';
import RSVPDeadlineModal from './rsvpDeadlineModal';
// Define Friend and Cohost types locally
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
  const [date, setDate] = useState({
    // Set startDate and startTime to the closest future time selectable in the modal (15 minute interval)
    ...(() => {
      // 15-minute interval time options
      const timeOptions: string[] = [];
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
          let hour12 = h % 12 === 0 ? 12 : h % 12;
          let ampm = h < 12 ? 'am' : 'pm';
          let minStr = m.toString().padStart(2, '0');
          timeOptions.push(`${hour12}:${minStr}${ampm}`);
        }
      }
      const now = new Date();
      let found = false;
      let selectedTime = "12:00am";
      for (const timeStr of timeOptions) {
        const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
        if (!match) continue;
        let [_, hourStr, minStr, ampm] = match;
        let hour = Number(hourStr);
        let minute = Number(minStr);
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        if (
          hour > now.getHours() ||
          (hour === now.getHours() && minute > now.getMinutes())
        ) {
          selectedTime = timeStr;
          found = true;
          break;
        }
      }
      // If no future time today, use tomorrow at 12:00am
      let startDate = new Date();
      let startTime = selectedTime;
      if (!found) {
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        startTime = "12:00am";
      } else {
        // Set startDate to today with the selected time
        const match = selectedTime.match(/(\d+):(\d+)(am|pm)/i);
        if (match) {
          let hour = Number(match[1]);
          let minute = Number(match[2]);
          let ampm = match[3];
          if (ampm === 'pm' && hour !== 12) hour += 12;
          if (ampm === 'am' && hour === 12) hour = 0;
          startDate.setHours(hour, minute, 0, 0);
        }
      }
      return {
        start: startDate,
        end: new Date(),
        startTime: startTime,
        endTime: '12:00am',
        endSet: false,
        dateChosen: false,
      };
    })()
  });
  const imageOptions = defaultImages;
  const [image, setImage] = useState(imageOptions[Math.floor(Math.random() * imageOptions.length)]);

  const { user } = useUserStore();
  const [cohosts, setCohosts] = useState<(Friend | string)[]>([]);
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
  const [rsvpDL, setRSVPDL] = useState<Date | null>(null);
  const [rsvpDLTime, setRSVPDLTime] = useState<string | null>(null);
  const [showCohostModal, setShowCohostModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  useEffect(() => {
    console.log(date);
  }, [showDateTimeModal]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showMoreSettingsModal, setShowMoreSettingsModal] = useState(false);
  const [list, setList] = useState({
    public: true,
    maybe: true,
  })
  const [locations, setLocations] = useState<{ address: string; city: string }[]>([]);

  const [friends, setFriends] = useState<Friend[]>([]);

  const addEvent = async () => {
    
  }

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
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={50}
      showsVerticalScrollIndicator={false}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={!showImageModal}
    >
      {/* Background image and overlay */}
      <Image
        source={
          typeof image === 'string'
            ? (image.startsWith('file://') || image.startsWith('content://')
              ? { uri: image }
              : { uri: image })
            : image && image.uri
              ? { uri: image.uri }
              : image
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          bottom: 0,
          height: undefined,
          minHeight: '100%',
          resizeMode: 'cover',
          zIndex: 0,
        }}
        blurRadius={8}
        onError={e => {
          console.log('Background image failed to load:', e.nativeEvent);
        }}
      />
      <View style={tw`w-full h-full bg-black bg-opacity-60`}>
        {/* Top bar */}
        <View style={tw`relative flex-row items-center px-4 mt-10 mb-1.5 h-10`}> 
          {/* Back button - absolute left */}
          <TouchableOpacity
            onPress={() => router.replace('/(home)/home/explore')}
            style={[tw`absolute left-3`, { zIndex: 2 }]}
          >
            <Back />
          </TouchableOpacity>
          {/* Centered title */}
          <View style={tw`flex-1 items-center justify-center`}>
            <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Create event</Text>
          </View>
          {/* Done button - absolute right */}
          <TouchableOpacity
            style={[tw`absolute right-4 bg-[#7b61ff] rounded-full px-4 py-1`, { zIndex: 2 }]}
          onPress={() => addEvent()}>
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Title input */}
        <View style={tw`px-4 mb-2 items-center`}>
          <TextInput style={[tw`text-white text-[22px]`, { fontFamily: 'Nunito-ExtraBold' }]}
            value={title}
            onChangeText={setTitle}
            placeholder='your event title'
            placeholderTextColor={'#9ca3af'}
          />
        </View>

        <View style={tw`flex-row items-center mx-4 mb-2.5`}>
          <TouchableOpacity style={tw`flex-row items-center gap-2 justify-center bg-[#064B55] ${publicEvent ? 'border border-white/10' : 'opacity-30'} rounded-full px-2 py-0.5 mr-1`}
            onPress={() => { setPublic(true) }}>
            <Public />
            <Text style={[tw`text-[13px] text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-row items-center gap-2 justify-center bg-[#080B32] ${publicEvent ? 'opacity-30' : 'border border-purple-900'} rounded-full px-2 py-0.5`}
            onPress={() => { setPublic(false) }}>
            <Private />
            <Text style={[tw`text-[13px] text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Private</Text>
          </TouchableOpacity>
        </View>

        {/* Image picker */}
        <View style={tw`px-4 mb-2`}>
          <TouchableOpacity style={[tw`rounded-xl overflow-hidden w-full items-center justify-center relative`, { aspectRatio: 410 / 279 }]}
            onPress={() => { setShowImageModal(true) }}>
            <Image
              source={
                typeof image === 'string'
                  ? { uri: image }
                  : image && image.uri
                    ? { uri: image.uri }
                    : image
              }
              style={{ width: '100%', height: '100%' }}
              resizeMode={
                typeof image === 'string' && imageOptions.includes(image)
                  ? 'contain'
                  : 'cover'
              }
            />
            {/* Placeholder for event image */}
            <View style={tw`flex-row gap-1.5 absolute top-2.5 right-2.5 bg-white rounded-lg px-2 py-1 shadow-md`}>
              <Camera width={14} height={14} />
              <Text style={[tw`text-xs text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>{'Choose image'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Set date and time */}
        <View style={tw`px-4 mb-2`}>
          {/* Placeholder for date/time picker */}
          <TouchableOpacity style={tw`bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-start`}
            onPress={() => setShowDateTimeModal(true)}
            activeOpacity={0.7}
          >
            {(!date.dateChosen) ? (
              <Text style={[tw`text-gray-400 text-[18px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Set date and time</Text>
            ) : date.endSet ? (
              (() => {
                const startDateStr = formatFullDate(date.start);
                const endDateStr = formatFullDate(date.end);
                if (startDateStr === endDateStr) {
                  // Same day: show date on first line, times on second line
                  return (
                    <Text style={[tw`text-white text-[18px]`, { fontFamily: 'Nunito-ExtraBold' }]}>
                      {startDateStr}{"\n"}
                      {date.startTime} - {date.endTime}
                    </Text>
                  );
                } else {
                  // Different days: show both date and time on each line
                  return (
                    <Text style={[tw`text-white text-[18px]`, { fontFamily: 'Nunito-ExtraBold' }]}>
                      {startDateStr}, {date.startTime} -{"\n"}
                      {endDateStr}, {date.endTime}
                    </Text>
                  );
                }
              })()
            ) : (
              <Text style={[tw`text-white text-[18px]`, { fontFamily: 'Nunito-ExtraBold' }]}>
                {formatFullDate(date.start)}{"\n"}
                {date.startTime}
              </Text>
            )}
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
                <Text style={[tw`text-white`, { fontFamily: 'Nunito-Bold' }]}>{user.firstname}</Text>
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
                    <Text style={[tw`text-white`, { fontFamily: 'Nunito-Bold' }]}>{cohost.firstname}</Text>
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
              {location.selected ? location.selected : 'Set location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RSVP deadline */}
        <TouchableOpacity style={tw`px-4 mb-2`}
          activeOpacity={0.7}
          onPress={() => setShowRSVPModal(true)}
        >
          <View style={tw`bg-white/10 border border-white/20 flex-row items-center gap-2 rounded-xl px-4 py-3`}>
            {rsvpDL ? (
              <RSVPWhite width={14} height={14} />
            ) : (
              <RSVP width={14} height={14} />
            )}
            <Text
              style={[
                tw`${rsvpDL ? 'text-white' : 'text-gray-400'} text-[13px]`,
                { fontFamily: 'Nunito-ExtraBold' }
              ]}
            >
              {rsvpDL
                ? `RSVP deadline: ${formatRSVPDate(rsvpDL)}${rsvpDLTime ? ", " + rsvpDLTime : ''}`
                : 'Set RSVP deadline'}
            </Text>
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
        <View style={tw`px-4.5 mb-2`}>
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
                <View style={tw`pl-6.5`}>
                  <TextInput
                    style={[
                      tw`items-center text-white bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[13px]`,
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
                <View style={tw`pl-6.5`}>
                  <TextInput
                    style={[
                      tw`items-center text-white bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[13px]`,
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
                <View style={tw`pl-6.5`}>
                  <TextInput
                    style={[
                      tw`items-center text-white bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[13px]`,
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
                <View style={tw`pl-6.5`}>
                  <TextInput
                    style={[
                      tw`items-center text-white bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[13px]`,
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

        {/* More settings modal */}
        <View style={tw`px-4 mb-20`}>
          <TouchableOpacity
            style={tw`flex-row items-center gap-2.5 bg-white/10 rounded-xl px-3.5 py-2 mt-2`}
            onPress={() => setShowMoreSettingsModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>More settings</Text>
          </TouchableOpacity>
        </View>
        {/* </KeyboardAwareScrollView > */}

        {/* Cohost Modal */}
        <CohostModal
          visible={showCohostModal}
          onClose={() => setShowCohostModal(false)}
          friends={friends}
          cohosts={cohosts}
          onSave={setCohosts}
        />
        {/* Location Modal */}
        {/* <LocationModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          location={location}
          setLocation={setLocation}
          locations={locations}
        /> */}
        <DateTimeModal
          visible={showDateTimeModal}
          onClose={() => {
            setShowDateTimeModal(false);
          }}
          startDate={date.start}
          startTime={date.startTime}
          endSet={date.endSet}
          endDate={date.end || new Date()}
          endTime={date.endTime || '12:00am'}
          onSave={({ start, end, startTime, endTime, endSet }) => {
            // Helper to combine date and time string into a Date object
            function combineDateAndTime(dateObj: Date, timeStr: string): Date {
              const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
              if (!match) return new Date(dateObj);
              let [_, hourStr, minStr, ampm] = match;
              let hour = Number(hourStr);
              let minute = Number(minStr);
              if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
              if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
              const newDate = new Date(dateObj);
              newDate.setHours(hour, minute, 0, 0);
              return newDate;
            }

            const now = new Date();
            const startDateTime = combineDateAndTime(start, String(startTime));
            const endDateTime = combineDateAndTime(end, String(endTime || '12:00am'));

            // 1. Start must not be before now
            if (startDateTime.getTime() < now.getTime()) {
              alert("Start date and time must not be before the current time.");
              return;
            }

            // 2. End must be at least 30 minutes after start
            if (endSet && endDateTime.getTime() - startDateTime.getTime() < 30 * 60 * 1000) {
              alert("End date and time must be at least 30 minutes after the start.");
              return;
            }

            // If valid, update date state and close modal
            setDate((prev) => ({
              ...prev,
              start: start,
              startTime: String(startTime),
              end: end,
              endTime: String(endTime),
              endSet: endSet,
              dateChosen: true,
            }));
            setShowDateTimeModal(false);
          }}
        />
        <ImageModal
          visible={showImageModal}
          onClose={() => { setShowImageModal(false) }}
          imageOptions={imageOptions}
          onSelect={(img) => { setImage(img) }}
        />

        {/* More Settings Modal */}
        <MoreSettingsModal
          visible={showMoreSettingsModal}
          onClose={() => setShowMoreSettingsModal(false)}
          list={list}
          setList={setList}
        />

        <RSVPDeadlineModal
          visible={showRSVPModal}
          onClose={() => setShowRSVPModal(false)}
          initialDate={rsvpDL ?? new Date()}
          maxDate={date.start}
          minDate={(() => {
            const start = new Date(date.start);
            const min = new Date(start);
            min.setDate(min.getDate() - 7);
            const now = new Date();
            // minDate cannot be before today
            if (min < now) return now;
            return min;
          })()}
          onSave={(rsvp) => {
            // Check if the selected date is within 7 days before the event start date
            const startDate = new Date(date.start);
            const selectedDate = new Date(rsvp);
            const diffMs = startDate.getTime() - selectedDate.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays >= 0 && diffDays <= 8) {
              setRSVPDL(rsvp);
              setShowRSVPModal(false);
            } else {
              alert("RSVP deadline must be within 7 days before the event start date.");
              return;
            }
          }}
        />
      </View>

      {/* Cohost Modal */}
      <CohostModal
        visible={showCohostModal}
        onClose={() => setShowCohostModal(false)}
        friends={friends}
        cohosts={cohosts}
        onSave={setCohosts}
      />
      {/* Location Modal */}
      {/* <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        location={location}
        setLocation={setLocation}
        locations={locations}
      /> */}
      <DateTimeModal
        visible={showDateTimeModal}
        onClose={() => {
          setShowDateTimeModal(false);
        }}
        startDate={date.start}
        startTime={date.startTime}
        endSet={date.endSet}
        endDate={date.end || new Date()}
        endTime={date.endTime || '12:00am'}
        onSave={({ start, end, startTime, endTime, endSet }) => {
          // Helper to combine date and time string into a Date object
          function combineDateAndTime(dateObj: Date, timeStr: string): Date {
            const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
            if (!match) return new Date(dateObj);
            let [_, hourStr, minStr, ampm] = match;
            let hour = Number(hourStr);
            let minute = Number(minStr);
            if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
            if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
            const newDate = new Date(dateObj);
            newDate.setHours(hour, minute, 0, 0);
            return newDate;
          }

          const now = new Date();
          const startDateTime = combineDateAndTime(start, String(startTime));
          const endDateTime = combineDateAndTime(end, String(endTime || '12:00am'));

          // 1. Start must not be before now
          if (startDateTime.getTime() < now.getTime()) {
            alert("Start date and time must not be before the current time.");
            return;
          }

          // 2. End must be at least 30 minutes after start
          if (endSet && endDateTime.getTime() - startDateTime.getTime() < 30 * 60 * 1000) {
            alert("End date and time must be at least 30 minutes after the start.");
            return;
          }

          // If valid, update date state and close modal
          setDate((prev) => ({
            ...prev,
            start: start,
            startTime: String(startTime),
            end: end,
            endTime: String(endTime),
            endSet: endSet,
            dateChosen: true,
          }));
          setShowDateTimeModal(false);
        }}
      />
      <ImageModal
        visible={showImageModal}
        onClose={() => { setShowImageModal(false) }}
        imageOptions={imageOptions}
        onSelect={(img) => { setImage(img) }}
      />

      {/* More Settings Modal */}
      <MoreSettingsModal
        visible={showMoreSettingsModal}
        onClose={() => setShowMoreSettingsModal(false)}
        list={list}
        setList={setList}
      />

      <RSVPDeadlineModal
        visible={showRSVPModal}
        onClose={() => setShowRSVPModal(false)}
        initialDate={rsvpDL ?? new Date()}
        maxDate={date.start}
        minDate={(() => {
          const start = new Date(date.start);
          const min = new Date(start);
          min.setDate(min.getDate() - 7);
          const now = new Date();
          // minDate cannot be before today
          if (min < now) return now;
          return min;
        })()}
        onSave={(selectedDate, selectedTime) => {
          // Check if the selected date is within 7 days before the event start date
          const startDate = new Date(date.start);
          const diffMs = startDate.getTime() - new Date(selectedDate).getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays >= 0 && diffDays <= 8) {
            setRSVPDL(new Date(selectedDate));
            setRSVPDLTime(selectedTime);
            setShowRSVPModal(false);
          }
        }}
      />
    </KeyboardAwareScrollView >
  );
}