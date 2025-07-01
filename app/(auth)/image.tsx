import { supabase } from '@/utils/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';
import { useAuthStore } from '../store/authStore';

import DefaultProfileSVG from '../../assets/icons/pfpdefault.svg';

export default function ImagePage() {
  const router = useRouter();
  const { signupInfo } = useAuthStore();
  const [imageInput, setImageInput] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });
    if (!result.canceled) {
      setImageInput(result.assets[0].uri);
    }
  };

  const confirmImage = async () => {
    if (!imageInput || !signupInfo) return;
    setLoading(true);
    try {
      // Find user by email
      const { data: userData } = await supabase.from('users').select('id').eq('email', signupInfo.email).single();
      const userID = userData?.id;
      if (!userID) throw new Error('User not found');
      const filePath = `avatar/${userID}`;
      // Read file as base64 and upload as data URL
      const base64 = await FileSystem.readAsStringAsync(imageInput, { encoding: FileSystem.EncodingType.Base64 });
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      const { error: uploadError } = await supabase.storage.from('sizzl-profileimg').upload(filePath, dataUrl, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = await supabase.storage.from('sizzl-profileimg').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      await supabase.from('users').update({ 'profile_image': publicUrl }).eq('id', userID);
      Alert.alert('Success');
      router.replace('/');
    } catch (err) {
      const errorMessage = (err instanceof Error && err.message) ? err.message : String(err);
      Alert.alert('Image upload failed', errorMessage);
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={tw`mb-8`}>
          <Text style={[tw`text-white text-sm text-center mb-2`, { fontFamily: 'Nunito-Medium' }]}>Add your profile image</Text>
          <Text style={[tw`text-white text-lg text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>Make it easier to find your friends 💛</Text>
      </View>
      <TouchableOpacity style={tw`w-32 h-32 items-center justify-center rounded-full mb-6`}
        onPress={pickImage}>
        {imageInput ? (
          <Image style={tw`w-full h-full rounded-full`} resizeMode="contain" source={{ uri: imageInput }} />
        ) : (
          <DefaultProfileSVG width={128} height={128} style={tw`rounded-full`} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-white rounded-full py-3 w-full items-center mb-4`}
        onPress={confirmImage}
        disabled={loading || !imageInput}
      >
        <Text style={[tw`text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>{loading ? 'Uploading...' : "Let's start!"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`px-4 py-2 bg-transparent border border-white rounded-full`}
        onPress={() => router.replace('/')}
      >
        <Text style={[tw`text-white text-sm`, { fontFamily: 'Nunito-Medium' }]}>Skip this step.</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
