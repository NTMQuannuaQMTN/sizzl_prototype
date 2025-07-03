import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import BotBar from '../botbar';
import { useUserStore } from '../store/userStore';
import ProfileBackgroundWrapper from './background_wrapper';

import SettingIcon from '../../assets/icons/setting.svg';

export default function ProfilePage() {
  const router = useRouter();
  const { user_id } = useLocalSearchParams();
  const [self, setSelf] = useState(false);
  const user = useUserStore((state) => state.user);
  const Wrapper = self && user.background_url ? ImageBackground : LinearGradient;
  const WrapperProps = self && user.background_url ? {
    source: { uri: user.background_url },
    resizeMode: 'cover',
    style: { flex: 1 },
  } : {
    colors: ['#080B32', '#0E1241', '#291C56', '#392465', '#51286A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    style: { flex: 1 },
  };

  useEffect(() => {
    if (user && user.id) {
      setSelf(user_id === user.id);
    }
  }, [user_id, user]);

  return (
    <ProfileBackgroundWrapper self={self} imageUrl={user.background_url}>
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginVertical: 16, height: 'auto' }}>
        {/* Top bar: username and settings icon */}
        <View style={tw`absolute top-6 left-0 right-0 flex-row justify-between items-center px-6`}>
          <Text style={tw`text-white font-bold text-base`}>@{user.username}</Text>
          <TouchableOpacity>
            {/* Placeholder for settings icon */}
            <SettingIcon style={tw`p-2`} />
          </TouchableOpacity>
        </View>

        {/* Profile picture */}
        <View style={tw`mt-16 mb-2`}>
          <View style={[tw`rounded-full border-2 border-white`, { width: 100, height: 100, overflow: 'hidden' }]}>
            <ImageBackground
              source={{ uri: user.profile_image }}
              style={{ width: 100, height: 100 }}
            />
          </View>
        </View>

        {/* Name, username, friends count */}
        <Text style={tw`text-white font-bold text-lg mt-2`}>{user.firstname} {user.lastname}</Text>
        <View style={tw`flex-row items-center mb-1`}>
          <Text style={tw`text-white/80 text-base`}>@{user.username}</Text>
          <Text style={tw`text-white/40 mx-2`}>•</Text>
          <Text style={tw`text-white/80 text-base`}>100 friends</Text>
        </View>

        {/* Bio */}
        <Text style={tw`text-white bg-green-600/80 px-3 py-1 rounded-full mb-2`}>{user.bio}</Text>

        {/* Edit and Share profile buttons */}
        <View style={tw`flex-row w-full justify-center mb-2`}>
          <TouchableOpacity style={tw`bg-white/20 px-5 py-2 rounded-full mr-2`}>
            <Text style={tw`text-white font-bold`}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-white/20 px-5 py-2 rounded-full ml-2`}>
            <Text style={tw`text-white font-bold`}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday and zodiac */}
        <View style={tw`flex-row items-center mb-2`}>
          <Text style={tw`text-white text-base mr-2`}>🎂 {user.birthdate}</Text>
          <Text style={tw`text-white/40 mx-2`}>•</Text>
          <Text style={tw`text-white text-base`}>...</Text>
        </View>

        {/* Social icons row */}
        <View style={tw`flex-row items-center justify-center`}>
          {/* Instagram */}
          <TouchableOpacity style={tw`mx-2`}>
            <Text style={tw`text-white text-2xl`}>📷</Text>
          </TouchableOpacity>
          {/* X (Twitter) */}
          <TouchableOpacity style={tw`mx-2`}>
            <Text style={tw`text-white text-2xl`}>𝕏</Text>
          </TouchableOpacity>
          {/* Snapchat */}
          <TouchableOpacity style={tw`mx-2`}>
            <Text style={tw`text-white text-2xl`}>👻</Text>
          </TouchableOpacity>
          {/* Facebook */}
          <TouchableOpacity style={tw`mx-2`}>
            <Text style={tw`text-white text-2xl`}>📘</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BotBar currentTab="profile" />
    </ProfileBackgroundWrapper>
  );
}
