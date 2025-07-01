
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import BotBar from '../botbar';

export default function EditProfile() {
  const router = useRouter();
  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[tw`text-white text-xl text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>ur editing ur profile, mtfk</Text>
        <TouchableOpacity
          style={tw`mt-8 bg-white rounded-full px-6 py-2`}
          onPress={() => router.back()}
        >
          <Text style={[tw`text-black text-base`, { fontFamily: 'Nunito-Bold' }]}>Back</Text>
        </TouchableOpacity>
      </View>
      <BotBar currentTab="profile" />
    </LinearGradient>
  );
}
