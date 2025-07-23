// Color constants
const bgpopup = '#080B32';
const bggreenmodal = '#22C55E';

// Imports
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Easing, Image, ImageBackground, Linking, RefreshControl, Share as RNShare, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import QRCode from 'react-native-qrcode-svg';
import QrIcon from '../../assets/icons/qr.svg';
// ...existing code...
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


// Move UserView type outside the component to avoid React hook errors


import PfpDefault from '../../assets/icons/pfpdefault.svg';

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

export default function ProfilePage() {
  // ...existing code...
  // Share profile logic (must be inside the component to access userView)
  const handleShareProfile = async () => {
    if (!userView) return;
    try {
      const profileUrl = `https://sizzl.app/profile/${userView.username || userView.id}`;
      const name = userView.firstname ? userView.firstname : (userView.username || 'Someone');
      const message = `${name} on Sizzl`;
      await RNShare.share({
        message: `${message}\n${profileUrl}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share profile.');
    }
  };

  // State for loading and refreshing
  const [loading, setLoading] = useState(true); // true during initial fetch
  const [refreshing, setRefreshing] = useState(false); // for pull-to-refresh

  // State for QR code modal
  const [showQR, setShowQR] = useState(false);

  // State for "added" alert UI
  const [showAddedAlert, setShowAddedAlert] = useState(false);
  const [addedAlertVisible, setAddedAlertVisible] = useState(false);
  const addedAlertAnim = React.useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

  // Show/fade in the toast when showAddedAlert is set true
  useEffect(() => {
    if (showAddedAlert) {
      setAddedAlertVisible(true);
      Animated.timing(addedAlertAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Fade out after 2s
      const timer = setTimeout(() => {
        Animated.timing(addedAlertAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setAddedAlertVisible(false);
          setShowAddedAlert(false);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAddedAlert]);
  // Variables
  const router = useRouter();
  const { user_id } = useLocalSearchParams();
  const [self, setSelf] = useState(false);
  const { user, setUser } = useUserStore();
  const [friendStat, setFriendStat] = useState('');
  const [userView, setUserView] = useState<UserView | null>(null);
  const [friendRequest, setFriendRequest] = useState(0);

  // Animation state for friend request modal
  const [showFriendModal, setShowFriendModal] = useState(false);
  const friendModalAnim = React.useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
  // Animation state for friend deleted modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteModalAnim = React.useRef(new Animated.Value(1)).current;

  // Animate friend request modal in/out
  React.useEffect(() => {
    if (friendRequest === 1 && userView) {
      setShowFriendModal(true);
      Animated.timing(friendModalAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (showFriendModal) {
      Animated.timing(friendModalAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setShowFriendModal(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendRequest, userView]);

  // Animate friend deleted modal in/out
  React.useEffect(() => {
    if (friendRequest === -1 && userView) {
      setShowDeleteModal(true);
      Animated.timing(deleteModalAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (showDeleteModal) {
      Animated.timing(deleteModalAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setShowDeleteModal(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendRequest, userView]);



  // Fetch user data from Supabase 'users' table and set user view
  const fetchUser = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();
      if (error) {
        // PGRST116 = no rows found (404)
        if (error.code === 'PGRST116') {
          setUserView(null);
        } else {
          Alert.alert('Error', 'Failed to load profile.');
        }
      } else {
        setUserView(data);
      }
    } catch (err) {
      setUserView(null);
    } finally {
      if (!isRefresh) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]);

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

  // State for "added" alert UI
  // const [showAddedAlert, setShowAddedAlert] = useState(false);
  // Auto-close the "added" toast after 2 seconds
  useEffect(() => {
    if (showAddedAlert) {
      const timer = setTimeout(() => {
        setShowAddedAlert(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showAddedAlert]);

  const handleAcceptFriend = async (id: string) => {
    const { error: addError } = await supabase.from('friends')
      .insert([{ user_id: user.id, friend: id }, { user_id: id, friend: user.id }]).select();

    if (addError) {
      Alert.alert('Problems in adding friend');
    } else {
      setShowAddedAlert(true);
    }

    checkRequest(id);
    updateCount(id);
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
    updateCount(id);
  }

  const updateCount = async (id: string | string[]) => {
    await supabase
      .from('users')
      .update({
        friend_count: (await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        ).count
      })
      .eq('id', user.id);

    await supabase
      .from('users')
      .update({
        friend_count: (await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', id)
        ).count
      })
      .eq('id', id);
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
    if (!user?.id) return;

    // Subscribe to real-time changes in the 'requests' table where requestee is the current user
    const channel = supabase
      .channel('public:friends')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friends', filter: `friend=eq.${user.id}` },
        async (payload) => {
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
    if (!user?.id) return;

    // Listen for DELETE events where either user_id or friend is the current user
    const channel = supabase
      .channel('public:friends:delete')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'friends',
          // Listen for any row where the current user is involved
          filter: `user_id=eq.${user.id},friend=eq.${user.id}`
        },
        async (payload) => {
          // If a friend relationship involving the current user is deleted, re-run checkRequest
          // This will update the UI (e.g., setFriendRequest(-2))
          if (user?.id) {
            checkRequest(user_id);
          }

          if (userView?.id) {
            checkRequest(userView?.id);
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

  // Loading screen UI
  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: bgpopup, minHeight: '100%' }]}>
        <Text style={[tw`text-white text-lg mt-6`, { fontFamily: 'Nunito-ExtraBold' }]}>Loading profile...</Text>
      </View>
    );
  }

  // Main profile UI
  return (
    <ProfileBackgroundWrapper imageUrl={userView?.background_url}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', marginVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (userView?.id) {
                checkRequest(userView.id);
              }
              fetchUser(true);
            }}
            tintColor="#fff"
          />
        }
        keyboardShouldPersistTaps="handled"
        style={tw`mt-6`}
      >
        {/* Top bar: username, settings icon, and QR icon */}
        <View style={tw`w-full left-0 right-0 flex-row justify-between items-center px-6 pt-3`}>
          <Text style={[tw`text-white text-[15px] ${self ? '' : 'mt-2'}`, { fontFamily: 'Nunito-ExtraBold' }]}>@{userView?.username}</Text>
          {self && (
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                onPress={() => {
                  if (userView) {
                    router.push({
                      pathname: '/(profile)/qrprofile',
                      params: { username: userView.username, userId: userView.id },
                    });
                  }
                }}
                style={tw`mr-6`}
                accessibilityLabel="Show QR code"
              >
                <QrIcon width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(profile)/settings')}
                accessibilityLabel="Open settings"
              >
                <SettingIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile picture: show image if present, otherwise SVG fallback, fast like BotBar */}
        <View style={tw`mt-4 mb-2`}>
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
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => router.push({ pathname: '/(profile)/friendslist', params: { user_id: user_id, relation: (self ? 'Self' : friendStat === 'friend' ? 'Friend' : 'Stranger') } })}
          >
            <Text style={[tw`text-gray-400 text-[14px]`, { fontFamily: 'Nunito-Medium' }]}>
              {userView?.friend_count} {userView?.friend_count === 1 || userView?.friend_count === 0 ? 'friend' : 'friends'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        {userView?.bio && <Text style={[tw`text-white px-3 mb-4`, { fontFamily: 'Nunito-Medium' }]}>{userView?.bio}</Text>}

        {/* Edit and Share profile buttons (no QR button here) */}
        <View style={tw`flex-row gap-x-2.5 px-10 mb-4`}>
          {self && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { router.replace('/(profile)/editprofile') }}>
            <Edit width={18} height={18} />
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
          {(!self && friendStat === 'requested') && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-yellow-600 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { setFriendRequest(1) }}>
            <Requested width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Accept?</Text>
          </TouchableOpacity>}
          {(!self && friendStat === 'friend') && <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-[#7A5CFA] border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={() => { setFriendRequest(-1) }}>
            <Friend width={20} height={20} />
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Friends</Text>
          </TouchableOpacity>}
          <TouchableOpacity
            style={tw`flex-row justify-center gap-2 bg-white/5 border border-white/10 flex-1 py-2 rounded-xl`}
            onPress={handleShareProfile}
          >
            <Share width={18} height={18} style={tw`mt-0.5`} />
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
              onPress={() => { Linking.openURL(`https://instagram.com/${userView?.instagramurl}`); }}>
              <InstagramIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {/* X (Twitter) */}
          {userView?.xurl && (
            <TouchableOpacity style={tw``}
              onPress={() => { Linking.openURL(`https://x.com/${userView?.xurl}`); }}>
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {/* Snapchat */}
          {userView?.snapchaturl && (
            <TouchableOpacity style={tw``}
              onPress={() => { Linking.openURL(`https://snapchat.com/add/${userView?.snapchaturl}`); }}>
              <SnapchatIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {/* Facebook */}
          {userView?.facebookurl && (
            <TouchableOpacity style={tw``}
              onPress={() => { Linking.openURL(`https://facebook.com/${userView?.facebookurl}`); }}>
              <FBIcon width={24} height={24} />
            </TouchableOpacity>
          )}
        </View>
        {/* BotBar should be outside ScrollView for fixed position, so not included here */}
      </ScrollView>
      <BotBar currentTab="profile" selfView={self} />

      {/* QR Code Modal removed: now navigates to QRProfile page */}

      {/* Friend request modal with slide-up animation */}
      {showFriendModal && userView && (
        <TouchableOpacity
          style={tw`w-full h-full bg-black bg-opacity-60 absolute left-0 z-99 justify-end`}
          activeOpacity={1}
          onPress={() => { setFriendRequest(0); }}
        >
          <Animated.View
            style={[
              tw`w-full px-4 pt-6 pb-15 rounded-t-2xl`, { backgroundColor: bgpopup },
              {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                marginBottom: 0,
                transform: [
                  {
                    translateY: friendModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 400],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[tw`text-white text-[14px] mb-4 text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>@{userView.username} <Text style={{ fontFamily: 'Nunito-Medium' }}>sent you a friend request 🤝</Text></Text>
            <TouchableOpacity style={tw`w-full h-12 bg-[#22C55E] rounded-full flex-row justify-center gap-x-4 items-center mb-2`}
              onPress={() => {
                handleAnswerRequest(userView.id);
                handleAcceptFriend(userView.id);
                setFriendRequest(0);
              }}>
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`w-full h-12 bg-rose-700 rounded-full flex-row justify-center gap-x-4 items-center`}
              onPress={() => {
                handleAnswerRequest(userView.id);
                setFriendRequest(0);
              }}>
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Reject</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Friend deleted modal with slide-up animation */}
      {showDeleteModal && userView && (
        <TouchableOpacity style={tw`w-full h-full bg-black bg-opacity-60 absolute left-0 z-99 justify-end`}
          activeOpacity={1}
          onPress={() => { setFriendRequest(0); }}>
          <Animated.View style={[
            tw`w-full px-4 pt-6 pb-15 rounded-t-2xl`, { backgroundColor: bgpopup },
            {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginBottom: 0,
              transform: [
                {
                  translateY: deleteModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400],
                  }),
                },
              ],
            },
          ]}>
            <Text style={[tw`text-white text-[14px] mb-4 text-center`, { fontFamily: 'Nunito-Medium' }]}>
              Regret being friend with <Text style={{ fontFamily: 'Nunito-ExtraBold' }}>@{userView.username}</Text>? 😤
            </Text>
            <TouchableOpacity style={tw`w-full h-12 bg-rose-700 rounded-full flex-row justify-center gap-x-4 items-center mb-2`}
              onPress={() => {
                handleDeleteFriend(userView.id);
                setFriendRequest(0);
              }}>
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Delete friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`w-full h-12 bg-white/5 rounded-full flex-row justify-center gap-x-4 items-center`}
              onPress={() => { setFriendRequest(0); }}>
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Not now</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
      {/* Added Alert UI */}
      {addedAlertVisible && userView && (
        <Animated.View
          style={[
            tw`absolute w-full left-0 top-0 z-100 items-center justify-center`,
            { height: '100%', opacity: addedAlertAnim }
          ]}
        >
          <View style={[tw`absolute w-full h-full left-0 top-0`, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
          <View style={[tw`bg-[#22C55E] px-6 py-4 rounded-2xl shadow-lg shadow-black/30 items-center`, { width: 280, maxWidth: '90%' }]}>
            <Image
              source={require('../../assets/images/shakehandsmeme.jpeg')}
              style={{ width: 120, height: 120, borderRadius: 10, marginBottom: 10, resizeMode: 'cover' }}
            />
            <Text style={[tw`text-white text-[15px] text-center leading-[1.25]`, { fontFamily: 'Nunito-ExtraBold' }]}>Congrats! Now you and {userView.firstname} are friends 🥳</Text>
          </View>
        </Animated.View>
      )}
    </ProfileBackgroundWrapper>
  );
}
