import { supabase } from '@/utils/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import Requested from '../../assets/icons/accept_question.svg';
import Friend from '../../assets/icons/accepted.svg';
import AddFriend from '../../assets/icons/add_friend.svg';
import Edit from '../../assets/icons/edit-icon.svg';
import FBIcon from '../../assets/icons/fb-icon.svg';
import Waiting from '../../assets/icons/hourglass.svg';
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
  const { user, setUser } = useUserStore();
  const [friendStat, setFriendStat] = useState('');
  const [friendRequest, setFriendRequest] = useState(0);
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
    friend_count?: number;
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

  const handleAddRequest = async (id: string | string[] | undefined) => {
    const { error } = await supabase.from('requests')
      .insert({ user_id: user.id, requestee: id });
    if (error) {
      console.error(error.message);
    } else {
      if (id !== undefined) {
        checkRequest(id);
      }
    }
  }

  // Make sure id is not undefined/null and user is loaded
  const handleRemoveRequest = async (id: string) => {
    if (!user?.id || !id) {
      console.error('User or requestee id missing');
      return;
    }

    const { error: deleteErr, data: deletedRows } = await supabase
      .from('requests')
      .delete()
      .eq('user_id', user.id)
      .eq('requestee', id)
      .select();

    if (deleteErr) {
      // If you get a 401/permission error, it's likely the policy is not matching the session user
      console.error('Delete error:', deleteErr.message);
      Alert.alert('Failed to remove request', deleteErr.message);
      return;
    }

    checkRequest(id);
  }

  // Make sure id is not undefined/null and user is loaded
  const handleAnswerRequest = async (id: string) => {
    if (!user?.id || !id) {
      console.error('User or requestee id missing');
      return;
    }

    const { error: deleteErr, data: deletedRows } = await supabase
      .from('requests')
      .delete()
      .eq('user_id', id)
      .eq('requestee', user.id)
      .select();

    if (deleteErr) {
      // If you get a 401/permission error, it's likely the policy is not matching the session user
      console.error('Delete error:', deleteErr.message);
      Alert.alert('Failed to remove request', deleteErr.message);
      return;
    }

    checkRequest(id);
  }

  const handleAcceptFriend = async (id: string) => {
    const { error: addError } = await supabase.from('friends')
      .insert([{ user_id: user.id, friend: id }, { user_id: id, friend: user.id }]).select();

    if (addError) {
      Alert.alert('Problems in adding friend');
    } else {
      Alert.alert('Added');
    }

    setUserView((userView) => userView ? { ...userView, friend_count: (userView.friend_count ?? 0) + 1 } : userView);
    setUser((user: any) => ({ ...user, friend_count: (user.friend_count ?? 0) + 1 }));
    // Update the friend_count in the database for the other user as well
    const { error: updateOtherUserErr } = await supabase
      .from('users')
      .update({ friend_count: (userView?.friend_count ?? 0) + 1 })
      .eq('id', id);

    if (updateOtherUserErr) {
      console.error('Failed to update friend count for other user:', updateOtherUserErr.message);
    }

    // Update the friend_count in the database for the current user
    const { error: updateUserErr } = await supabase
      .from('users')
      .update({ friend_count: (userView?.friend_count ?? 0) + 1 })
      .eq('id', user.id);

    if (updateUserErr) {
      console.error('Failed to update friend count:', updateUserErr.message);
    }

    checkRequest(id);
  }

  const handleDeleteFriend = async (id: string) => {
    const { error: deleteErr1 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', id)
      .eq('friend', user.id);
    const { error: deleteErr2 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', user.id)
      .eq('friend', id);

    if (deleteErr1 || deleteErr2) {
      // If you get a 401/permission error, it's likely the policy is not matching the session user
      console.error('Delete error');
      Alert.alert('Failed to remove request');
      return;
    }

    checkRequest(id);
  }

  const checkRequest = async (id: string | string[]) => {
    if (self) return;

    const { error: friendError } = await supabase.from('friends')
      .select('*').eq('user_id', user.id).eq('friend', id).single();
    if (!friendError) {
      setFriendStat('friend');
      return;
    }

    const { error: requestingError } = await supabase.from('requests')
      .select('*').eq('user_id', user.id).eq('requestee', id).single();
    if (!requestingError) {
      setFriendStat('requesting');
      return;
    }

    const { error: requestedError } = await supabase.from('requests')
      .select('*').eq('user_id', id).eq('requestee', user.id).single();
    if (!requestedError) {
      setFriendStat('requested');
      return;
    }

    setFriendStat('');
  }

  // To auto-check when someone sends a friend request to you,
  // add a useEffect that listens for changes in the 'requests' table for the current user.
  // For example, you can use Supabase's real-time subscription:

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to real-time changes in the 'requests' table where requestee is the current user
    const channel = supabase
      .channel('public:requests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests', filter: `requestee=eq.${user.id}` },
        (payload) => {
          // Someone sent a friend request to me
          // Re-run checkRequest for the sender's id
          if (payload.new && payload.new.user_id) {
            checkRequest(payload.new.user_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user_id && user?.id) {
      checkRequest(user_id);
    }
  }, []);

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
    <ProfileBackgroundWrapper imageUrl={userView?.background_url}>
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
                onError={() => { }}
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
          <Text style={[tw`text-gray-400 text-[14px]`, { fontFamily: 'Nunito-Medium' }]}>{userView?.friend_count} friends</Text>
        </View>

        {/* Bio */}
        {userView?.bio && <Text style={[tw`text-white px-3 mb-4`, { fontFamily: 'Nunito-Medium' }]}>{userView?.bio}</Text>}

        {/* Edit and Share profile buttons */}
        <View style={tw`flex-row gap-x-2.5 px-10 mb-4`}>
          {self && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { router.replace('/(profile)/editprofile') }}>
            <Edit width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Edit profile</Text>
          </TouchableOpacity>}
          {(!self && friendStat === '') && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-black border border-white/10 flex-1 rounded-xl`}
            onPress={() => {
              handleAddRequest(userView?.id);
            }}>
            <ImageBackground
              source={require('../../assets/images/galaxy.jpg')}
              imageStyle={{ borderRadius: 12, opacity: 0.5 }}
              style={[tw`flex-row justify-center gap-2 py-2 flex-1 rounded-xl`, { overflow: 'hidden' }]}
            >
              <AddFriend width={20} height={20} />
              <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Add friend</Text>
            </ImageBackground>
          </TouchableOpacity>}
          {(!self && friendStat === 'requesting') && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => {
              if (userView?.id) {
                handleRemoveRequest(userView.id);
              }
            }}>
            <Waiting width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Requested</Text>
          </TouchableOpacity>}
          {(!self && friendStat === 'requested') && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-[#7A5CFA] border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { setFriendRequest(1) }}>
            <Requested width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Accept?</Text>
          </TouchableOpacity>}
          {(!self && friendStat === 'friend') && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { setFriendRequest(-1) }}>
            <Friend width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Friends</Text>
          </TouchableOpacity>}
          <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}>
            <Share width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday and zodiac */}
        {userView?.birthdate && (
          <View style={tw`flex-row items-center gap-x-2 mb-3.5`}>
            <Text style={[tw`text-white text-[13px] -mr-0.5`, { fontFamily: 'Nunito-Medium' }]}>
              🎂
            </Text>
            <Text style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>
              {formatDate(userView?.birthdate)}
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
      <BotBar currentTab="profile" selfView={self} />

      {friendRequest === 1 && (
        <TouchableOpacity style={tw`w-full h-full bg-black bg-opacity-60 absolute left-0 z-99`}
          onPress={() => { setFriendRequest(0) }}>
          <TouchableOpacity style={[tw`w-full h-fit px-6 pb-8 pt-4 gap-y-4 rounded-t-3xl bg-[#04192E] bg-opacity-80 mt-auto`]}
            onPress={() => { }}>
            <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>@{userView?.username} sent you a friend request.</Text>
            <TouchableOpacity style={tw`w-full h-12 bg-[#22C55E] rounded-full flex-row justify-center gap-x-4 items-center`}
              onPress={() => {
                handleAnswerRequest(userView.id);
                handleAcceptFriend(userView.id);
                setFriendRequest(0);
              }}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`w-full h-12 bg-[#E11D48] rounded-full flex-row justify-center gap-x-4 items-center`}
              onPress={() => {
                handleAnswerRequest(userView.id);
                setFriendRequest(0);
              }}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>Reject</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {friendRequest === -1 && (
        <TouchableOpacity style={tw`w-full h-full bg-black bg-opacity-60 absolute left-0 z-99`}
          onPress={() => { setFriendRequest(0) }}>
          <TouchableOpacity style={[tw`w-full h-fit px-6 pb-8 pt-4 gap-y-4 rounded-t-3xl bg-[#04192E] bg-opacity-80 mt-auto`]}
            onPress={() => { }}>
            <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>@{userView?.username} is now your friend.</Text>
            <TouchableOpacity style={tw`w-full h-12 bg-[#E11D48] rounded-full flex-row justify-center gap-x-4 items-center`}
              onPress={() => {
                handleDeleteFriend(userView.id);
                setFriendRequest(0);
              }}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>Delete friend</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </ProfileBackgroundWrapper>
  );
}
