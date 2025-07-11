import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import tw from 'twrnc';
import BackIcon from '../../assets/icons/back.svg';
import DownloadIcon from '../../assets/icons/download-icon.svg';
import { useUserStore } from '../store/userStore';
import { saveBase64ToGallery } from '../utils/saveToGallery';
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
  const qrRef = useRef<any>(null);
  const cardRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveQr = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'QR card not ready.');
      return;
    }
    setSaving(true);
    try {
      // Debug: show alert before capture
      Alert.alert('Saving', 'Attempting to save QR card...');
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });
      // Read file as base64
      const base64 = await fetch(uri).then(res => res.blob()).then(blob => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
      await saveBase64ToGallery(base64);
      Alert.alert('Saved!', 'QR card saved to your gallery.');
    } catch (e) {
      Alert.alert('Error', 'Could not save QR card.');
    } finally {
      setSaving(false);
    }
  };

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
          <View ref={cardRef} collapsable={false} style={{ width: '100%', alignItems: 'center', marginTop: 40, minHeight: 500 }}>
            <ProfileBackgroundWrapper imageUrl={user?.background_url} borderRadius={14}>
              <View style={[tw`items-center px-14 py-16`, { backgroundColor: user?.background_url ? '' : bgpopup }]}> 
                <Text style={[tw`text-white text-[15px] mb-6`, { fontFamily: 'Nunito-ExtraBold' }]}>Add me on Sizzl 🔥</Text>
                <QRCode
                  value={`https://sizzl.app/profile/${username || userId}`}
                  size={200}
                  color="#fff"
                  backgroundColor="transparent"
                  getRef={c => { qrRef.current = c; }}
                />
                <Text style={[tw`text-white mt-6`, { fontFamily: 'Nunito-Bold', fontSize: 13 }]}>@{username}</Text>
              </View>
            </ProfileBackgroundWrapper>
            <TouchableOpacity
              style={[tw`mt-10 flex-row items-center bg-white/5 border border-white/10 rounded-xl py-2 px-4`]}
              onPress={handleSaveQr}
              disabled={saving}
            >
              <DownloadIcon width={20} height={20} style={{ marginRight: 6 }} />
              <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold', fontSize: 13 }]}>Save QR Card</Text>
            </TouchableOpacity>
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
