
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import BotBar from '../botbar';
import { useUserStore } from '../store/userStore';

import Camera from '../../assets/icons/camera_icon.svg';
import FBIcon from '../../assets/icons/fb-icon.svg';
import InstagramIcon from '../../assets/icons/insta-icon.svg';
import SnapchatIcon from '../../assets/icons/snapchat-icon.svg';
import XIcon from '../../assets/icons/x-icon.svg';

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, height: 'auto', marginVertical: 40, marginBottom: 100 }}>
        <ScrollView style={{width: '90%', marginHorizontal: 'auto'}}>
          <Text style={[tw`w-full text-center text-white text-md mb-4`, { fontFamily: 'Nunito-Bold' }]}>Edit profile</Text>
          {/* Change background button */}
          <TouchableOpacity
            style={[
              tw`flex-row items-center justify-center mb-4`,
              { backgroundColor: 'white', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }
            ]}
            // onPress={handleChangeBackground} // Placeholder for background change logic
            activeOpacity={0.8}
          >
            <View style={tw`flex-row gap-2 items-center`}>
              <Camera></Camera>
              <Text style={[tw`text-black font-bold`, { fontFamily: 'Nunito-Bold', fontSize: 12 }]}>Change background</Text>
            </View>
          </TouchableOpacity>
          {/* Profile picture */}
          <TouchableOpacity style={[tw`mb-4`, { alignItems: 'center' }]}>
            <View style={[tw`rounded-full border-2 border-white`, { width: 100, height: 100, overflow: 'hidden', backgroundColor: '#222' }]}>
              <Image
                source={{ uri: user.profile_image }}
                style={{ width: 100, height: 100 }}
              />
            </View>
          </TouchableOpacity>
          {/* Input fields */}
          <View style={{ width: '100%' }}>
            <View style={tw`flex-row mb-2`}>
              <View style={[tw`flex-1 mr-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
                <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                  placeholder='First name'
                  placeholderTextColor={'#9CA3AF'}></TextInput>
              </View>
              <View style={[tw`flex-1 ml-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
                <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                  placeholder='Last name'
                  placeholderTextColor={'#9CA3AF'}></TextInput>
              </View>
            </View>
            <View style={[tw`mb-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
              <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                placeholder='Username'
                placeholderTextColor={'#9CA3AF'}></TextInput>
            </View>
            <View style={[tw`mb-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
              <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                placeholder='Add a bio (optional)'
                placeholderTextColor={'#9CA3AF'}></TextInput>
            </View>
            <View style={[tw`mb-1`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
              <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                placeholder='Add your birthday (optional)'
                placeholderTextColor={'#9CA3AF'}></TextInput>
            </View>

            <Text style={[tw`text-white mb-2`, { fontFamily: 'Nunito-Medium', fontSize: 14 }]}>
              Add social media (optional)
            </Text>
            <View style={{ gap: 8, marginBottom: 16 }}>
              {/* Instagram */}
              <View style={[
                tw`flex-row items-center`,
                { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, height: 48 }
              ]}>
                <InstagramIcon width={22} height={22} />
                <TextInput
                  style={[tw`text-white ml-3 flex-1`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                  placeholder="username"
                  placeholderTextColor="#9CA3AF"
                // value={} onChangeText={}
                />
              </View>
              {/* X (Twitter) */}
              <View style={[
                tw`flex-row items-center`,
                { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, height: 48 }
              ]}>
                <XIcon width={22} height={22} />
                <TextInput
                  style={[tw`text-white ml-3 flex-1`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                  placeholder="username"
                  placeholderTextColor="#9CA3AF"
                // value={} onChangeText={}
                />
              </View>
              {/* Snapchat */}
              <View style={[
                tw`flex-row items-center`,
                { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, height: 48 }
              ]}>
                <SnapchatIcon width={22} height={22} />
                <TextInput
                  style={[tw`text-white ml-3 flex-1`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                  placeholder="username"
                  placeholderTextColor="#9CA3AF"
                // value={} onChangeText={}
                />
              </View>
              {/* Facebook */}
              <View style={[
                tw`flex-row items-center`,
                { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, height: 48 }
              ]}>
                <FBIcon width={22} height={22} />
                <TextInput
                  style={[tw`text-white ml-3 flex-1`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                  placeholder="username"
                  placeholderTextColor="#9CA3AF"
                // value={} onChangeText={}
                />
              </View>
            </View>
            {/* Save changes button */}
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                paddingVertical: 4,
                alignItems: 'center',
                marginBottom: 16,
              }}
              // onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[tw`text-black font-bold`, { fontFamily: 'Nunito-Bold', fontSize: 16 }]}>
                Save changes
              </Text>
            </TouchableOpacity>
            {/* Not now */}
            <TouchableOpacity
              style={{ alignItems: 'center', marginBottom: 8 }}
            // onPress={handleNotNow}
            >
              <Text style={[tw`text-white`, { fontFamily: 'Nunito-Medium', fontSize: 14, opacity: 0.7 }]}>
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <BotBar currentTab="profile" />
    </LinearGradient>
  );
}
