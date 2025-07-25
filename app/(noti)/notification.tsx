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
import { fetchEventRSVPNotifications, fetchFriendRequestNotifications } from '../utils/notificationsUtils';
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


const TABS = [
  { key: 'all', label: 'All notifications' },
  { key: 'events', label: 'Events' },
  { key: 'friend', label: 'Friend requests' },
];


// Helper to get a unique notification id (for local read state)
function getNotifId(notif: any) {
  if (notif.type === 'friend' || notif.user) {
    return `friend_${notif.user_id}_${notif.created_at}`;
  }
  // For event notifications, use event id or created_at
  return `event_${notif.id || ''}_${notif.created_at || ''}`;
}

const NotificationScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [friendNotifications, setFriendNotifications] = useState<any[]>([]);
  // Placeholder for event notifications
  const [eventNotifications, setEventNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friend');
  // Store read notification ids in local state
  const [readNotifs, setReadNotifs] = useState<string[]>([]);

  // Fetch both friend and event notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    const friendNotifs = await fetchFriendRequestNotifications(user.id);
    setFriendNotifications(friendNotifs);
    // Fetch event RSVP notifications for events hosted by the user
    const eventNotifs = await fetchEventRSVPNotifications(user.id);
    setEventNotifications(eventNotifs);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Helper to render a notification card (friend or event)
  const renderNotificationCard = (notif: any, idx: number) => {
    const notifId = getNotifId(notif);
    const isRead = readNotifs.includes(notifId);
    // Friend request notification
    if (notif.type === 'friend' || notif.user) {
      const timeString = notif.created_at ? getRelativeTime(notif.created_at) : '';
      const profileId = notif.user?.id || notif.user_id;
      const showActions = !notif.isFriend;
      return (
        <View key={idx} style={tw`${isRead ? 'bg-white/10' : 'bg-[#7A5CFA]/70'} rounded-xl p-4 mb-3`}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              if (!isRead) setReadNotifs(prev => [...prev, notifId]);
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
                <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
    // Event RSVP notification
    const timeString = notif.created_at ? getRelativeTime(notif.created_at) : '';
    // Decision badge color logic
    let badgeColor = 'bg-gray-500';
    const dec = notif.decision ? notif.decision.toLowerCase() : '';
    if (dec === 'going') badgeColor = 'bg-green-500';
    else if (dec === 'maybe') badgeColor = 'bg-yellow-600';
    else if (dec === 'nope' || dec === "can't go" || dec === 'cant go' || dec === "can't go") badgeColor = 'bg-rose-600';

    return (
      <View key={idx} style={tw`${isRead ? 'bg-white/10' : 'bg-[#7A5CFA]/70'} rounded-xl p-4 mb-3`}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            if (!isRead) setReadNotifs(prev => [...prev, notifId]);
            // Navigate to event page
            if (notif.event_id) {
              router.push({ pathname: '/(event)/event', params: { id: notif.event_id } });
            }
          }}
        >
          <View style={tw`flex-row items-start`}>
            {/* Avatar */}
            {notif.guest_profile_image ? (
              <View style={tw`w-7 h-7 rounded-full overflow-hidden mr-2 bg-white/20 items-center justify-center mt-0.5`}>
                <Image
                  source={{ uri: notif.guest_profile_image }}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                />
              </View>
            ) : (
              <View style={tw`w-7 h-7 rounded-full overflow-hidden mr-2 bg-white/20 items-center justify-center mt-0.5`}>
                <PfpDefault width={24} height={24} />
              </View>
            )}
            {/* Message - all in one Text for natural wrapping */}
            <View style={{ flex: 1 }}>
              <View style={tw`flex-row items-center flex-shrink flex-wrap`}> 
                <Text style={{ fontFamily: 'Nunito-ExtraBold', color: 'white', fontSize: 15 }}>
                  @{notif.guest_username || 'Someone'}
                </Text>
                <Text style={{ fontFamily: 'Nunito-Medium', color: 'white', fontSize: 15, marginLeft: 4 }}>responds</Text>
                {notif.decision && (
                  <Text style={[
                    tw`rounded-full px-2 py-0.5 ml-1.5`,
                    {
                      backgroundColor:
                        badgeColor === 'bg-green-500' ? '#22C55E' :
                        badgeColor === 'bg-yellow-600' ? '#CA8A04' :
                        badgeColor === 'bg-rose-600' ? '#E11D48' :
                        badgeColor === 'bg-gray-500' ? '#6B7280' :
                        undefined,
                      color: 'white',
                      fontFamily: 'Nunito-ExtraBold',
                      fontSize: 15,
                      overflow: 'hidden',
                    }
                  ]}>{notif.action.toUpperCase()}</Text>
                )}
              </View>
              <Text style={{ color: 'white', fontFamily: 'Nunito-Medium', fontSize: 15, marginTop: 2 }}>
                to <Text style={{ fontFamily: 'Nunito-ExtraBold' }}>"{notif.event_title}"</Text> event.
              </Text>
            </View>
          </View>
          {timeString && (
            <Text style={[tw`text-gray-400 text-xs mt-2`, { fontFamily: 'Nunito-Regular' }]}>{timeString}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  let tabContent: React.ReactNode = null;
  if (loading) {
    tabContent = (
      <View style={tw`flex-1 items-center justify-center -mt-30`}>
        <Text style={[tw`text-white text-[16px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Loading...</Text>
      </View>
    );
  } else if (activeTab === 'friend') {
    tabContent = friendNotifications.length === 0 ? (
      <View style={tw`flex-1 items-center justify-center -mt-30`}>
        <Text style={[tw`text-white text-[17px]`, { fontFamily: 'Nunito-ExtraBold' }]}>You've checked all your requests 🎉</Text>
        <Text style={[tw`text-white text-[15px] mt-0.5`, { fontFamily: 'Nunito-Medium' }]}>Or, you haven't had any yet :(</Text>
      </View>
    ) : (
      <ScrollView contentContainerStyle={tw`px-4 pt-2 pb-8`}>
        {friendNotifications.map((notif, idx) => renderNotificationCard({ ...notif, type: 'friend' }, idx))}
      </ScrollView>
    );
  } else if (activeTab === 'events') {
    tabContent = eventNotifications.length === 0 ? (
      <View style={tw`flex-1 items-center justify-center -mt-30`}>
        <Text style={[tw`text-white text-[17px]`, { fontFamily: 'Nunito-ExtraBold' }]}>No event notifications yet 🙄</Text>
        <Text style={[tw`text-white text-[15px] mt-0.5`, { fontFamily: 'Nunito-Medium' }]}>Stay tuned for updates!</Text>
      </View>
    ) : (
      <ScrollView contentContainerStyle={tw`px-4 pt-2 pb-8`}>
        {eventNotifications.map((notif, idx) => renderNotificationCard({ ...notif, type: 'event' }, idx))}
      </ScrollView>
    );
  } else if (activeTab === 'all') {
    const allNotifications = [
      ...friendNotifications.map(n => ({ ...n, type: 'friend' })),
      ...eventNotifications.map(n => ({ ...n, type: 'event' })),
    ];
    allNotifications.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    tabContent = allNotifications.length === 0 ? (
      <View style={tw`flex-1 items-center justify-center -mt-30`}>
        <Text style={[tw`text-white text-[17px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Yay! No more notifications 🎉</Text>
        <Text style={[tw`text-white text-[15px] mt-0.5`, { fontFamily: 'Nunito-Medium' }]}>Or, it's just started...</Text>
      </View>
    ) : (
      <ScrollView contentContainerStyle={tw`px-4 pt-2 pb-8`}>
        {allNotifications.map((notif, idx) => renderNotificationCard(notif, idx))}
      </ScrollView>
    );
  } else {
    tabContent = (
      <View style={tw`flex-1 items-center justify-center -mt-30`}>
        <Text style={[tw`text-white text-[17px]`, { fontFamily: 'Nunito-ExtraBold' }]}>No event notifications yet 🙄</Text>
        <Text style={[tw`text-white text-[15px] mt-0.5`, { fontFamily: 'Nunito-Medium' }]}>Stay tuned for updates!</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Top Bar copied from QRProfile */}
      <View style={tw`w-full flex-row items-center mb-2 px-4 pt-14 relative`}>
        <TouchableOpacity
          onPress={() => router.replace('/home/homepage')}
          style={tw`absolute left-0 px-4 pt-14`}
          accessibilityLabel="Back to homepage"
        >
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Notifications</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={tw`flex-row justify-left px-5 mt-2 mb-1 gap-x-2`}>
        {TABS.map((tab, idx) => (
          <React.Fragment key={tab.key}>
            <TouchableOpacity
              style={tw`items-center pb-2`}
              onPress={() => setActiveTab(tab.key)}
              accessibilityLabel={tab.label}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  tw`text-[14px]`,
                  { fontFamily: activeTab === tab.key ? 'Nunito-ExtraBold' : 'Nunito-Medium', color: 'white', opacity: activeTab === tab.key ? 1 : 0.6 },
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <View
                  style={{
                    height: 2.5,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    marginTop: 4,
                    alignSelf: 'center',
                    width: '100%',
                  }}
                />
              )}
            </TouchableOpacity>
            {idx < TABS.length - 1 && <View style={tw`w-2`} />}
          </React.Fragment>
        ))}
      </View>

      <View style={[tw`flex-1`]}>
        {tabContent}
      </View>
      <BotBar currentTab="noti" />
    </LinearGradient>
  );
};

export default NotificationScreen;
