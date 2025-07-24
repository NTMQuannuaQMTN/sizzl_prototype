function getRelativeTime(dateString: string) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 31) return `${diffDay}d ago`;
  const diffMo = Math.floor(diffDay / 30);
  return `${diffMo}mo ago`;
}
import { supabase } from '@/utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import BackIcon from '../../assets/icons/back.svg';
import PfpDefault from '../../assets/icons/pfpdefault.svg';

import BotBar from '../botbar';
import { useUserStore } from '../store/userStore';
import { fetchFriendRequestNotifications } from '../utils/notificationsUtils';
// Accept friend request
async function handleAcceptFriend(myId: string, friendId: string, refresh: () => void) {
  const { error: addError } = await supabase.from('friends')
    .insert([{ user_id: myId, friend: friendId }, { user_id: friendId, friend: myId }]).select();
  if (addError) {
    alert('Problems in adding friend');
  }
  // Remove request after accepting
  await supabase.from('requests')
    .delete()
    .eq('user_id', friendId)
    .eq('requestee', myId);
  refresh();
}

// Cancel friend request
async function handleCancelRequest(myId: string, friendId: string, refresh: () => void) {
  await supabase.from('requests')
    .delete()
    .eq('user_id', friendId)
    .eq('requestee', myId);
  refresh();
}

const NotificationScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    const notifs = await fetchFriendRequestNotifications(user.id);
    setNotifications(notifs);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Top Bar copied from QRProfile */}
      <View style={tw`w-full flex-row items-center mb-2 px-3 pt-14 relative`}>
        <TouchableOpacity
          onPress={() => router.replace('/home/homepage')}
          style={tw`absolute left-0 px-3 pt-14`}
          accessibilityLabel="Back to homepage"
        >
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Notifications</Text>
        </View>
      </View>
      <View style={[tw`flex-1`]}>
        {loading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>Loading...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>Notifications will appear here</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={tw`px-4 pt-2 pb-8`}>
            {notifications.map((notif, idx) => {
              const timeString = notif.created_at ? getRelativeTime(notif.created_at) : '';
              const profileId = notif.user?.id || notif.user_id;
              const showActions = !notif.isFriend;
              return (
                <View key={idx} style={tw`bg-white/10 rounded-xl p-4 mb-3`}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (showActions && profileId) {
                        router.push({ pathname: '/(profile)/profile', params: { user_id: profileId } });
                      }
                    }}
                  >
                    <View style={tw`flex-row items-center`}>
                      {notif.user?.profile_image ? (
                        <View style={tw`w-7 h-7 rounded-full overflow-hidden mr-2 bg-white/20 items-center justify-center`}>
                          <Image
                            source={{ uri: notif.user.profile_image }}
                            style={{ width: 28, height: 28, borderRadius: 14 }}
                          />
                        </View>
                      ) : (
                        <View style={tw`w-7 h-7 rounded-full overflow-hidden mr-2 bg-white/20 items-center justify-center`}>
                          <PfpDefault width={24} height={24} />
                        </View>
                      )}
                      <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>@{notif.user?.username || notif.user_id || 'Someone'}</Text>
                      <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Medium' }]}>{notif.isFriend ? ' and you are now friends!' : ' wants to be your friend'}</Text>
                    </View>
                    {timeString && (
                      <Text style={[tw`text-gray-400 text-xs mt-2`, { fontFamily: 'Nunito-Regular' }]}>{timeString}</Text>
                    )}
                  </TouchableOpacity>
                  {showActions && (
                    <View style={tw`flex-row gap-2 mt-2.5`}>
                      <TouchableOpacity
                        style={tw`flex-1 py-2.5 rounded-xl bg-[#22C55E] items-center`}
                        onPress={async () => {
                          await handleAcceptFriend(user.id, notif.user_id, () => {
                            // Refresh notifications after action
                            fetchNotifications();
                          });
                        }}
                      >
                        <View style={tw`flex-row items-center justify-center`}>
                          <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Accept</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={tw`flex-1 py-2.5 rounded-xl bg-rose-600 items-center`}
                        onPress={async () => {
                          await handleCancelRequest(user.id, notif.user_id, () => {
                            fetchNotifications();
                          });
                        }}
                      >
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
      <BotBar currentTab="noti" />
    </LinearGradient>
  );
};

export default NotificationScreen;
