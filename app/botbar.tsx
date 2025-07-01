import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ImageBackground, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useUserStore } from '../app/store/userStore';
import CreateTab from '../assets/icons/createtab.svg';
import CreateTabActive from '../assets/icons/createtab_active.svg';
import HomeTab from '../assets/icons/hometab.svg';
import HomeTabActive from '../assets/icons/hometab_active.svg';

export default function BotBar({ currentTab = 'home' }: { currentTab?: 'home' | 'create' | 'profile' }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [avatarUri, setAvatarUri] = useState(user?.profile_image || '');

  useEffect(() => {
    // Always fetch the latest user profile from Supabase on mount
    const fetchUserProfile = async () => {
      const session = await supabase.auth.getSession();
      const email = session.data.session?.user?.email;
      if (email) {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (!error && data) {
          setUser(data);
          setAvatarUri(data.profile_image || '');
        }
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    setAvatarUri(user?.profile_image || '');
  }, [user]);
  return (
    <ImageBackground
      source={require('../assets/images/galaxy.jpg')}
      imageStyle={{ borderRadius: 24, opacity: 0.3 }}
      style={tw`flex-row justify-around items-center mx-4 mb-[${insets.bottom ? insets.bottom : 12}px] h-14 absolute left-0 right-0 bottom-0 shadow-lg shadow-black/15 z-10`}
    >
      <View style={tw`flex-row flex-1 items-center justify-around bg-black/60 rounded-3xl h-full`}>
        {/* Home Tab */}
        <TouchableOpacity onPress={() => router.replace('/home/explore')} style={tw`flex-1 items-center justify-center`}>
          {currentTab === 'home' ? <HomeTabActive width={24} height={24} /> : <HomeTab width={24} height={24} />}
        </TouchableOpacity>
        {/* Center Add Button */}
        <TouchableOpacity onPress={() => router.replace('/(create)/create')} style={tw`flex-1 items-center justify-center`}>
          {currentTab === 'create' ? <CreateTabActive width={24} height={24} /> : <CreateTab width={24} height={24} />}
        </TouchableOpacity>
        {/* Profile Tab */}
        <TouchableOpacity onPress={() => router.replace('/profile')} style={tw`flex-1 items-center justify-center`}>
          <Image
            source={{ uri: avatarUri }}
            style={{
              width: 26,
              height: 26,
              borderRadius: 18,
              borderWidth: currentTab === 'profile' ? 2 : 0,
              borderColor: '#fff',
            }}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
