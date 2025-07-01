import { useState } from "react";
import { useRouter } from 'expo-router';
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import DefaultProfileIMG from '../../assets/images/pfp-default2.png';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '../store/authStore';

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
    if (!imageInput) return;
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
      router.replace('/home');
    } catch (err) {
      const errorMessage = (err instanceof Error && err.message) ? err.message : String(err);
      Alert.alert('Image upload failed', errorMessage);
    }
    setLoading(false);
  };

  return (
    <View style={tw`flex-1 items-center justify-center bg-[#080B32] px-6`}>
      <View style={tw`mb-8`}>
          <Text style={[tw`text-white text-sm text-center mb-2`, { fontFamily: 'Nunito-Medium' }]}>Add your profile image</Text>
          <Text style={[tw`text-white text-lg text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>Make it easier to find your friends 💛</Text>
      </View>
      <TouchableOpacity style={tw`w-32 h-32 items-center justify-center rounded-full mb-6`}
        onPress={pickImage}>
        <Image style={tw`w-full h-full rounded-full`} resizeMode="contain" source={imageInput ? { uri: imageInput } : DefaultProfileIMG} />
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
        onPress={() => router.replace('/home')}
      >
        <Text style={[tw`text-white text-sm`, { fontFamily: 'Nunito-Medium' }]}>Skip this step.</Text>
      </TouchableOpacity>
    </View>
  );
}
