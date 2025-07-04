
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../store/userStore';

import { supabase } from '@/utils/supabase';
import Camera from '../../assets/icons/camera_icon.svg';
import FBIcon from '../../assets/icons/fb-icon.svg';
import InstagramIcon from '../../assets/icons/insta-icon.svg';
import SnapchatIcon from '../../assets/icons/snapchat-icon.svg';
import XIcon from '../../assets/icons/x-icon.svg';
import ProfileBackgroundWrapper from './background_wrapper';

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [input, setInput] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    username: user?.username || '',
    bio: user?.bio || '',
    facebookurl: user?.facebookurl || '',
    instagramurl: user?.instagramurl || '',
    snapchaturl: user?.snapchaturl || '',
    xurl: user?.xurl || '',
  });
  const [dob, setDOB] = useState(user?.birthdate || new Date());
  const [dobInput, setDOBInput] = useState(user?.birthdate || new Date());
  const [dobAvail, setDOBAvail] = useState(user?.birthdate ? true : false);
  const [dobOpen, setDOBOpen] = useState(false);
  const [bgInput, setBgInput] = useState(user?.background_url || '');
  const [avtInput, setAvtInput] = useState(user?.profile_image || '');
  const [loading, setLoading] = useState(false);

  const onChangeDOB = ({ type }, selectedDate) => {
    if (type == 'set') {
      setDOB(selectedDate);
    } else {
      setDOBOpen(false);
    }
  }

  const formatDate = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    const monthToWord = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    return `${monthToWord[month]} ${day}, ${year}`;
  }

  useEffect(() => {
    console.log(input);
  }, [input]);

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });
    if (!result.canceled) {
      setAvtInput(result.assets[0].uri);
      setTimeout(() => console.log(input), 0)
    }
  };

  const pickBackground = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1
    });
    if (!result.canceled) {
      setBgInput(result.assets[0].uri);
      setTimeout(() => console.log(input), 0)
    }
  };

  const confirmAvt = async () => {
    if (!avtInput) return;
    setLoading(true);
    try {
      // Find user by email
      console.log('Looking for user with email:', user?.email);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, profile_image')
        .eq('email', user?.email)
        .single();
      
      if (userError) {
        console.log('User lookup error:', userError);
        throw userError;
      }
      
      const userID = userData?.id;
      if (!userID) throw new Error('User not found');
      
      console.log('Found user data:', userData);
      console.log('User ID:', userID);
      console.log('Current profile_image:', userData?.profile_image);

      // Get file info and determine file extension
      const fileUri = avtInput;
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatar/${userID}.${fileExtension}`;
      // Read file as binary for proper upload
      const fileBinary = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const byteCharacters = atob(fileBinary);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const uint8Array = new Uint8Array(byteNumbers);

      // Upload file as binary data
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sizzl-profileimg')
        .upload(fileName, uint8Array, {
          contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          upsert: true
        });

      if (uploadError) {
        console.log('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('sizzl-profileimg')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error('Failed to get public URL');

      // Update user profile with image URL
      console.log('Attempting to update profile_image for user:', userID);
      console.log('New profile_image URL:', publicUrl);
      
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ profile_image: publicUrl })
        .eq('id', userID)
        .select();

      if (updateError) {
        console.log('Database update error:', updateError);
        throw updateError;
      }

      console.log('Update response data:', updateData);
      console.log('Number of rows updated:', updateData?.length || 0);

      if (updateData?.length === 0) {
        throw new Error('No rows were updated - this might be a policy issue');
      }

      console.log('Profile image updated successfully:', publicUrl);
      Alert.alert('Success', 'Profile image uploaded successfully!');
      router.replace('/(home)/home/explore');
    } catch (err) {
      console.log('Full error:', err);
      const errorMessage = (err instanceof Error && err.message) ? err.message : String(err);
      Alert.alert('Image upload failed', errorMessage);
    }
    setLoading(false);
  };

  return (
    <ProfileBackgroundWrapper self={true} imageUrl={bgInput}>
      <View style={{ flex: 1, height: 'auto', marginVertical: 40, marginHorizontal: 'auto', marginBottom: 100, width: '90%' }}>
        <Text style={[tw`w-full text-center text-white text-md mb-4`, { fontFamily: 'Nunito-Bold' }]}>Edit profile</Text>
        {/* Change background button */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center justify-center mb-4`,
            { backgroundColor: 'white', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }
          ]}
          onPress={pickBackground} // Placeholder for background change logic
          activeOpacity={0.8}
        >
          <View style={tw`flex-row gap-2 items-center`}>
            <Camera></Camera>
            <Text style={[tw`text-black font-bold`, { fontFamily: 'Nunito-Bold', fontSize: 12 }]}>Change background</Text>
          </View>
        </TouchableOpacity>
        {/* Profile picture */}
        <TouchableOpacity style={[tw`mb-4`, { alignItems: 'center' }]}
        onPress={pickAvatar}>
          <View style={[tw`rounded-full border-2 border-white`, { width: 100, height: 100, overflow: 'hidden', backgroundColor: '#222' }]}>
            <Image
              source={{ uri: avtInput }}
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
                value={input.firstname}
                onChangeText={(newName) => setInput(input => ({ ...input, firstname: newName }))}
                placeholderTextColor={'#9CA3AF'}></TextInput>
            </View>
            <View style={[tw`flex-1 ml-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
              <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
                placeholder='Last name'
                value={input.lastname}
                onChangeText={(newName) => setInput(input => ({ ...input, lastname: newName }))}
                placeholderTextColor={'#9CA3AF'}></TextInput>
            </View>
          </View>
          <View style={[tw`mb-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
            <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
              placeholder='Username'
              value={input.username}
              onChangeText={(newName) => setInput(input => ({ ...input, username: newName }))}
              placeholderTextColor={'#9CA3AF'}></TextInput>
          </View>
          <View style={[tw`mb-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
            <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
              placeholder='Add a bio (optional)'
              value={input.bio}
              onChangeText={(newInp) => setInput(input => ({ ...input, bio: newInp }))}
              placeholderTextColor={'#9CA3AF'}></TextInput>
          </View>
          <View style={[tw`mb-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
            <TextInput style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
              placeholder='Add your birthday (optional)'
              value={dobAvail ? formatDate(dobInput) : ''}
              onChangeText={setDOBInput}
              placeholderTextColor={'#9CA3AF'}
              editable={false}
              onPressIn={() => setDOBOpen(true)}></TextInput>
          </View>
          {dobOpen && (
            <View style={tw`w-full h-24 flex justify-center overflow-hidden`}>
              <DateTimePicker
                value={dob}
                mode="date"
                display="spinner"
                onChange={onChangeDOB}
                maximumDate={new Date()}
                style={{ marginTop: -10 }}
                textColor='#FFF'
              />
            </View>
          )}

          {dobOpen && Platform.OS === 'ios' && (
            <View style={tw`flex-row justify-around`}>
              <TouchableOpacity
                style={[
                  tw`px-4 py-2 mb-2 flex-1 justify-center rounded-full`,
                  { backgroundColor: '#6B7280', marginRight: 8 }
                ]}
                onPress={() => {
                  if (dobInput) {
                    setDOB(dobInput);
                  }
                  setDOBOpen(false);
                }}
              >
                <Text style={[tw`text-white w-full text-center text-bold`, { fontFamily: 'Nunito-Medium' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  tw`px-4 py-2 mb-2 flex-1 justify-center rounded-full`,
                  { backgroundColor: '#2563EB' }
                ]}
                onPress={() => {
                  setDOBInput(dob);
                  setDOBAvail(true);
                  setDOBOpen(false);
                }}
              >
                <Text style={[tw`text-white w-full text-center text-bold`, { fontFamily: 'Nunito-Medium' }]}>Set</Text>
              </TouchableOpacity>
            </View>
          )}

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
                value={input.instagramurl}
                onChangeText={(newInp) => setInput(input => ({ ...input, instagramurl: newInp }))}
                placeholderTextColor="#9CA3AF"
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
                value={input.xurl}
                onChangeText={(newInp) => setInput(input => ({ ...input, xurl: newInp }))}
                placeholderTextColor="#9CA3AF"
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
                value={input.snapchaturl}
                onChangeText={(newInp) => setInput(input => ({ ...input, snapchaturl: newInp }))}
                placeholderTextColor="#9CA3AF"
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
                value={input.facebookurl}
                onChangeText={(newInp) => setInput(input => ({ ...input, facebookurl: newInp }))}
                placeholderTextColor="#9CA3AF"
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
            onPress={() => router.replace({ pathname: '/(profile)/[user_id]', params: { user_id: user?.user_id } })}
          >
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-Medium', fontSize: 14, opacity: 0.7 }]}>
              Not now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProfileBackgroundWrapper>
  );
}
