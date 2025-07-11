import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import tw from 'twrnc';
import BackIcon from '../../assets/icons/back.svg';
import DownloadIcon from '../../assets/icons/download-icon.svg';
import { useUserStore } from '../store/userStore';
import ProfileBackgroundWrapper from './background_wrapper';

const tabInactive = 'rgba(255,255,255,0.05)';
const tabActive = '#7A5CFA';
const tabTextActive = '#fff';
const tabTextInactive = '#fff';
const bgpopup = '#080B32';
const bggreenmodal = '#22C55E';


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
  const [showSavedModal, setShowSavedModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSaveQr = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'QR card not ready.');
      return;
    }
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos to save the QR card.');
        setSaving(false);
        return;
      }
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      setShowSavedModal(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      Alert.alert('Error', 'Could not save QR card.');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSavedModal(false));
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
          <>
            <View ref={cardRef} collapsable={false} style={{ width: '100%', alignItems: 'center', marginTop: 20, minHeight: 500 }}>
              <ProfileBackgroundWrapper imageUrl={user?.background_url} borderRadius={14}>
                <View style={[tw`flex-1 justify-center items-center p-10`, { backgroundColor: user?.background_url ? '' : bgpopup }]}> 
                  <Text style={[tw`text-white text-[15px] mb-8`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Add me on Sizzl 🔥</Text>
                  <QRCode
                    value={`https://sizzl.app/profile/${username || userId}`}
                    size={240}
                    color="#fff"
                    backgroundColor="transparent"
                    getRef={c => { qrRef.current = c; }}
                  />
                  <Text style={[tw`text-white mt-8`, { fontFamily: 'Nunito-Bold', fontSize: 13, textAlign: 'center' }]}>@{username}</Text>
                </View>
              </ProfileBackgroundWrapper>
            </View>
            <TouchableOpacity
              style={[tw`mt-8 flex-row items-center bg-white/5 border border-white/10 rounded-xl py-2 px-4`]}
              onPress={handleSaveQr}
              disabled={saving}
            >
              <DownloadIcon width={20} height={20} style={{ marginRight: 6 }} />
              <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold', fontSize: 13 }]}>Save QR Card</Text>
            </TouchableOpacity>

            {/* Custom Saved Modal */}
            {showSavedModal && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 100,
                  opacity: fadeAnim,
                }}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={closeModal}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <TouchableOpacity
                  activeOpacity={1}
                  style={{ backgroundColor: bggreenmodal, borderRadius: 16, padding: 24, alignItems: 'center', maxWidth: 320, width: '80%' }}
                  onPress={e => e.stopPropagation()}
                >
                  <Text style={[tw`text-white text-[16px] mb-2`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Your QR Card is saved 🥳</Text>
                  <Text style={[tw`text-white mb-4`, { fontFamily: 'Nunito-Medium', textAlign: 'center', fontSize: 14 }]}>You can now find your QR card in your Photos/Gallery. Share it with friends to connect on Sizzl! 🎉</Text>
                  <TouchableOpacity
                    style={[tw`flex-row items-center justify-center bg-white/10 border border-white/20 rounded-xl px-6 py-2`]}
                    onPress={closeModal}
                  >
                    <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold', fontSize: 14 }]}>Got it</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            )}
          </>
        )}
        {tab === 'scan' && (
          <View style={[tw`items-center`, { marginTop: 24 }]}> 
            <Text style={[tw`text-white text-2xl`, { fontFamily: 'Nunito-ExtraBold' }]}>coming soon 😏</Text>
            {/* Add any content you want for the 'scan' tab here */}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default QRProfile;
