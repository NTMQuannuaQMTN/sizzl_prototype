import { supabase } from '@/utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import BotBar from '../botbar';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { signupInfo } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFirstName = async () => {
      if (!signupInfo?.email) return;
      const { data, error } = await supabase
        .from('users')
        .select('firstname')
        .eq('email', signupInfo.email)
        .single();
      if (!error && data?.firstname) {
        setFirstName(data.firstname);
      } else {
        setFirstName('');
      }
    };
    fetchFirstName();
  }, [signupInfo?.email]);

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[tw`text-white text-xl text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>yo mtfk, this is you!</Text>
        <Text style={[tw`text-white text-lg mt-4`, { fontFamily: 'Nunito-Bold' }]}>{firstName}</Text>
        <TouchableOpacity
          style={tw`mt-8 bg-white rounded-full px-6 py-2`}
          onPress={() => router.push('/(profile)/editprofile')}
        >
          <Text style={[tw`text-black text-base`, { fontFamily: 'Nunito-Bold' }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <BotBar currentTab="profile" />
    </LinearGradient>
  );
}
