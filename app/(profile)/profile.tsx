import { supabase } from '@/utils/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import Edit from '../../assets/icons/edit-icon.svg';
import FBIcon from '../../assets/icons/fb-icon.svg';
import InstagramIcon from '../../assets/icons/insta-icon.svg';
import SettingIcon from '../../assets/icons/setting.svg';
import Share from '../../assets/icons/share-icon.svg';
import SnapchatIcon from '../../assets/icons/snapchat-icon.svg';
import XIcon from '../../assets/icons/x-icon.svg';
import BotBar from '../botbar';
import { useUserStore } from '../store/userStore';
import ProfileBackgroundWrapper from './background_wrapper';

import { navigate } from 'expo-router/build/global-state/routing';

import PfpDefault from '../../assets/icons/pfpdefault.svg';

export default function ProfilePage() {
  const router = useRouter();
  const { user_id } = useLocalSearchParams();
  const [self, setSelf] = useState(false);
  const { user } = useUserStore();
  type UserView = {
    id: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    profile_image?: string;
    background_url?: string;
    bio?: string;
    birthdate?: string;
    instagramurl?: string;
    xurl?: string;
    snapchaturl?: string;
    facebookurl?: string;
    // add other fields as needed
  };
  const [userView, setUserView] = useState<UserView | null>(null);

  // Fetch user data from Supabase 'users' table and set user view
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      async function fetchUser() {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)
            .single();
          if (error) {
            console.error('Error fetching user:', error);
            if (isMounted) setUserView(null);
          } else {
            if (isMounted) setUserView(data);
            console.log(data);
          }
        } catch (err) {
          console.error('Unexpected error fetching user:', err);
          if (isMounted) setUserView(null);
        }
      }
      fetchUser();
      return () => {
        isMounted = false;
      };
    }, [user_id])
  );

  useEffect(() => {
    if (user && user.id) {
      setSelf(user_id === user.id);
      console.log('User', user);
    }
  }, []);

  // Only show month and day (no year)
  const formatDate = (date: any) => {
    if (!date) return '';
    let d = date;
    if (typeof date === 'string') {
      d = new Date(date);
    }
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    let month = d.getMonth();
    let day = d.getDate();

    const monthToWord = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    return `${monthToWord[month]} ${day}`;
  };

  const dateToZodiac = (date: any) => {
    if (!date) return '';
    let d = date;
    if (typeof date === 'string') {
      d = new Date(date);
    }
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    let month = d.getMonth();
    let day = d.getDate();

    // Convert the day and month to zodiac sign
    // Returns a string like "Aries", "Taurus", etc.
    const zodiacSigns = [
      { sign: "♑ Capricorn", from: { month: 0, day: 1 }, to: { month: 0, day: 19 } },
      { sign: "♒ Aquarius", from: { month: 0, day: 20 }, to: { month: 1, day: 18 } },
      { sign: "♓ Pisces", from: { month: 1, day: 19 }, to: { month: 2, day: 20 } },
      { sign: "♈ Aries", from: { month: 2, day: 21 }, to: { month: 3, day: 19 } },
      { sign: "♉ Taurus", from: { month: 3, day: 20 }, to: { month: 4, day: 20 } },
      { sign: "♊ Gemini", from: { month: 4, day: 21 }, to: { month: 5, day: 20 } },
      { sign: "♋ Cancer", from: { month: 5, day: 21 }, to: { month: 6, day: 22 } },
      { sign: "♌ Leo", from: { month: 6, day: 23 }, to: { month: 7, day: 22 } },
      { sign: "♍ Virgo", from: { month: 7, day: 23 }, to: { month: 8, day: 22 } },
      { sign: "♎ Libra", from: { month: 8, day: 23 }, to: { month: 9, day: 22 } },
      { sign: "♏ Scorpio", from: { month: 9, day: 23 }, to: { month: 10, day: 21 } },
      { sign: "♐ Sagittarius", from: { month: 10, day: 22 }, to: { month: 11, day: 21 } },
      { sign: "♑ Capricorn", from: { month: 11, day: 22 }, to: { month: 11, day: 31 } },
    ];

    for (let i = 0; i < zodiacSigns.length; i++) {
      const { sign, from, to } = zodiacSigns[i];
      if (
        (month === from.month && day >= from.day) ||
        (month === to.month && day <= to.day)
      ) {
        return sign;
      }
    }
    return '';
  }

  return (

    <ProfileBackgroundWrapper self={self} imageUrl={userView?.background_url}>
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginVertical: 16, height: 'auto' }}>
        {/* Top bar: username and settings icon */}
        <View style={tw`absolute top-6 left-0 right-0 flex-row justify-between items-center px-6`}>
          <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>@{userView?.username}</Text>
          <TouchableOpacity>
            <SettingIcon width={20} height={20} style={tw`m-2`} />
          </TouchableOpacity>
        </View>

        {/* Profile picture: show image if present, otherwise SVG fallback, fast like BotBar */}
        <View style={tw`mt-24 mb-2`}>
          <View style={[tw`rounded-full border-2 border-white items-center justify-center bg-white/10`, { width: 120, height: 120, overflow: 'hidden' }]}> 
            {userView?.profile_image ? (
              <Image
                source={{ uri: userView.profile_image }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
                defaultSource={require('../../assets/icons/pfpdefault.svg')}
                onError={() => {}}
              />
            ) : (
              <PfpDefault width={120} height={120} />
            )}
          </View>
        </View>

        {/* Name, username, friends count */}
        <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-ExtraBold' }]}>{userView?.firstname} {userView?.lastname}</Text>
        <View style={tw`flex-row items-center mb-2.5`}>
            <Text style={[tw`text-gray-400 text-[14px]`, { fontFamily: 'Nunito-Medium' }]}>@{userView?.username}</Text>
            <Text style={[tw`text-gray-400 mx-1.5 text-[10px]`, { fontFamily: 'Nunito-Medium' }]}>•</Text>
            <Text style={[tw`text-gray-400 text-[14px]`, { fontFamily: 'Nunito-Medium' }]}>#wingay friends</Text>
        </View>

        {/* Bio */}
        {userView?.bio && <Text style={[tw`text-white px-3 mb-4`, { fontFamily: 'Nunito-Medium' }]}>{userView?.bio}</Text>}

        {/* Edit and Share profile buttons */}
        <View style={tw`flex-row gap-x-2.5 px-10 mb-4`}>
          <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { router.push('/(profile)/editprofile') }}>
            <Edit width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}>
            <Share width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday and zodiac */}
        {userView?.birthdate && (
          <View style={tw`flex-row items-center gap-x-2 mb-3.5`}>
            <Text style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>
              🎂  {formatDate(userView?.birthdate)}
            </Text>
            <Text style={[tw`text-white text-[10px]`, { fontFamily: 'Nunito-Medium' }]}>•</Text>
            <Text style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>
              {dateToZodiac(userView?.birthdate)}
            </Text>
          </View>
        )}

        {/* Social icons row */}
        <View style={tw`flex-row gap-x-4 items-center justify-center`}>
          {/* Instagram */}
          {userView?.instagramurl && (
            <TouchableOpacity style={tw``}
              onPress={() => { navigate(`https://instagram.com/${userView?.instagramurl}`); }}>
              <InstagramIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {/* X (Twitter) */}
          {userView?.xurl && (
            <TouchableOpacity style={tw``}
              onPress={() => { navigate(`https://x.com/${userView?.xurl}`); }}>
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {/* Snapchat */}
          {userView?.snapchaturl && (
            <TouchableOpacity style={tw``}
              onPress={() => { navigate(`https://snapchat.com/add/${userView?.snapchaturl}`) }}>
              <SnapchatIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {/* Facebook */}
          {userView?.facebookurl && (
            <TouchableOpacity style={tw``}
              onPress={() => { navigate(`https://facebook.com/${userView?.facebookurl}`) }}>
              <FBIcon width={24} height={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <BotBar currentTab="profile" />
    </ProfileBackgroundWrapper>
  );
}
