import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import tw from 'twrnc';
import BackIcon from '../../assets/icons/back.svg';
import { useUserStore } from '../store/userStore';
import ProfileBackgroundWrapper from './background_wrapper';

const tabInactive = 'rgba(255,255,255,0.05)';
const tabActive = '#7A5CFA';
const tabTextActive = '#fff';
const tabTextInactive = '#fff';
const bgpopup = '#080B32';


// This page expects to be used as a route, so get params from router
import { useLocalSearchParams } from 'expo-router';


const QRProfile: React.FC = () => {
  const { username, userId } = useLocalSearchParams<{ username?: string; userId?: string }>();
  const [tab, setTab] = useState<'qr' | 'scan'>('qr');
  const router = useRouter();
  const { user } = useUserStore();

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={[tw`flex-1 items-center mt-10 justify-start`]}>
        {/* Back button */}
        <View style={tw`w-full flex-row items-center mb-2 px-4`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`p-2 mr-2`}
            accessibilityLabel="Back to profile"
          >
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={[tw`text-white text-[16px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Sizzl QR</Text>
        </View>

        {/* Tabs */}
        <View style={[tw`flex-row w-full mt-2 mb-6 px-8`, { gap: 8 }]}> 
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[
                tw`rounded-xl items-center justify-center`,
                { backgroundColor: tab === 'qr' ? tabActive : tabInactive, height: 36 },
              ]}
              onPress={() => setTab('qr')}
            >
              <Text style={{ color: tab === 'qr' ? tabTextActive : tabTextInactive, fontFamily: 'Nunito-ExtraBold', fontSize: 14 }}>My code</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[
                tw`rounded-xl items-center justify-center`,
                { backgroundColor: tab === 'scan' ? tabActive : tabInactive, height: 36 },
              ]}
              onPress={() => setTab('scan')}
            >
              <Text style={{ color: tab === 'scan' ? tabTextActive : tabTextInactive, fontFamily: 'Nunito-ExtraBold', fontSize: 14 }}>scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab content */}
        {tab === 'qr' && (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 75, minHeight: 400 }}>
            <ProfileBackgroundWrapper imageUrl={user?.background_url} borderRadius={14}>
              <View style={[tw`items-center p-14`, { backgroundColor: user?.background_url ? '' : bgpopup }]}> 
                <Text style={[tw`text-white text-[15px] mb-6`, { fontFamily: 'Nunito-ExtraBold' }]}>Add me on Sizzl 🔥</Text>
                <QRCode
                  value={`https://sizzl.app/profile/${username || userId}`}
                  size={200}
                  color="#fff"
                  backgroundColor="transparent"
                />
                <Text style={[tw`text-white mt-6`, { fontFamily: 'Nunito-Bold', fontSize: 13 }]}>@{username}</Text>
              </View>
            </ProfileBackgroundWrapper>
          </View>
        )}
        {tab === 'scan' && (
          <View style={[tw`items-center`, { marginTop: 24 }]}> 
            <Text style={[tw`text-white text-2xl`, { fontFamily: 'Nunito-ExtraBold' }]}>scan 😏</Text>
            {/* Add any content you want for the 'scan' tab here */}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default QRProfile;
