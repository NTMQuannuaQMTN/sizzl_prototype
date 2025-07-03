import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import Edit from '../../assets/icons/edit-icon.svg';
import FBIcon from '../../assets/icons/fb-icon.svg';
import InstagramIcon from '../../assets/icons/insta-icon.svg';
import Share from '../../assets/icons/share-icon.svg';
import SnapchatIcon from '../../assets/icons/snapchat-icon.svg';
import XIcon from '../../assets/icons/x-icon.svg';
import BotBar from '../botbar';
import { useUserStore } from '../store/userStore';
import ProfileBackgroundWrapper from './background_wrapper';

import { navigate } from 'expo-router/build/global-state/routing';
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
            <SettingIcon style={tw`m-2`} />
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
        <Text style={tw`text-white font-bold text-lg`}>{user.firstname} {user.lastname}</Text>
        <View style={tw`flex-row items-center mb-2`}>
          <Text style={tw`text-white/80 text-base`}>@{user.username}</Text>
          <Text style={tw`text-white/40 mx-2`}>•</Text>
          <Text style={tw`text-white/80 text-base`}>100 friends</Text>
        </View>

        {/* Bio */}
        {user.bio && <Text style={tw`text-white px-3 py-1 mb-2`}>{user.bio}</Text>}

        {/* Edit and Share profile buttons */}
        <View style={tw`flex-row w-full justify-around px-6 mb-2`}>
          <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/20 flex-1 py-2 rounded-xl mr-2`}
          onPress={() => {router.push('/(profile)/editprofile')}}>
            <Edit></Edit>
            <Text style={tw`text-white font-bold`}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`flex-row justify-center gap-2 bg-white/20 flex-1 py-2 rounded-xl ml-2`}>
            <Share></Share>
            <Text style={tw`text-white font-bold`}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday and zodiac */}
        {user.birthdate && <View style={tw`flex-row items-center mb-2`}>
          <Text style={tw`text-white text-base mr-2`}>🎂{user.birthdate}</Text>
          <Text style={tw`text-white/40 mx-2`}>•</Text>
          <Text style={tw`text-white text-base`}>...</Text>
        </View>}

        {/* Social icons row */}
        <View style={tw`flex-row items-center justify-center`}>
          {/* Instagram */}
          {user.instagramurl && <TouchableOpacity style={tw`mx-2`}
          onPress={() => {navigate(user.instagramurl)}}>
            <InstagramIcon></InstagramIcon>
          </TouchableOpacity>}
          {/* X (Twitter) */}
          {user.xurl && <TouchableOpacity style={tw`mx-2`}
          onPress={() => {navigate(user.xurl)}}>
            <XIcon></XIcon>
          </TouchableOpacity>}
          {/* Snapchat */}
          {user.snapchaturl && <TouchableOpacity style={tw`mx-2`}
          onPress={() => {navigate(user.snapchaturl)}}>
            <SnapchatIcon></SnapchatIcon>
          </TouchableOpacity>}
          {/* Facebook */}
          {user.facebookurl && <TouchableOpacity style={tw`mx-2`}
          onPress={() => {navigate(user.facebookurl)}}>
            <FBIcon></FBIcon>
          </TouchableOpacity>}
        </View>
      </View>
      <BotBar currentTab="profile" />
    </ProfileBackgroundWrapper>
  );
}
