import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import BackIcon from '../../assets/icons/back.svg';
import BotBar from '../botbar';

const NotificationScreen: React.FC = () => {
  const router = useRouter();
  // For now, just show a placeholder for notifications
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
      <View style={[tw`flex-1 items-center justify-center`]}>
        <Text style={[tw`text-white text-lg`, { fontFamily: 'Nunito-Bold' }]}>Notifications will appear here</Text>
      </View>
      <BotBar currentTab="noti" />
    </LinearGradient>
  );
};

export default NotificationScreen;
