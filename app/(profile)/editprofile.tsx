// Handle "Save changes" button press: confirm avatar and background image, and update all fields
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
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
    firstname: user?.firstname || null,
    lastname: user?.lastname || null,
    username: user?.username || null,
    bio: user?.bio || null,
    facebookurl: user?.facebookurl || null,
    instagramurl: user?.instagramurl || null,
    snapchaturl: user?.snapchaturl || null,
    xurl: user?.xurl || null,
  });
  const [dob, setDOB] = useState(user?.birthdate ? new Date(user?.birthdate) : new Date());
  const [dobInput, setDOBInput] = useState(user?.birthdate ? new Date(user?.birthdate) : new Date());
  const [dobAvail, setDOBAvail] = useState(user?.birthdate ? true : false);
  const [dobOpen, setDOBOpen] = useState(false);
  const [bgInput, setBgInput] = useState(user?.background_url || '');
  const [avtInput, setAvtInput] = useState(user?.profile_image || '');
  const [loading, setLoading] = useState(false);

  // For modal picker, just set dobInput on change
  const onChangeDOB = ({ type }, date) => {
    if (type == 'set') { setDOBInput(date) }
    else { setDOBOpen(false) }
  }

  const formatDate = (date: any) => {
    if (!date) return '';
    let d = date;
    if (typeof date === 'string') {
      d = new Date(date);
    }
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();

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
  };

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

  const handleSave = async () => {
    setLoading(true);

    try {
      const usernameRegex = /^[a-z0-9_.]{4,}$/;
      if (!usernameRegex.test(input.username)) {
        Alert.alert('Username must have a-z, 0-9, at least 4 letters.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('users').select('*')
        .eq('username', input.username).single();
      if (!error && user.username !== input.username) {
        Alert.alert('There is someone with this username bro, too late.');
        setLoading(false);
        return false;
      }

      const nameRegex = /^[a-zA-Z\s]{2,}$/;
      if (!nameRegex.test(input.firstname.trim())) {
        Alert.alert('The first name must be at least two letters and no other symbols than alphabets.');
        setLoading(false);
        return false;
      }

      if (!nameRegex.test(input.lastname.trim())) {
        Alert.alert('The last name must be at least two letters and no other symbols than alphabets.');
        setLoading(false);
        return false;
      }

      const userID = user?.user_id || user?.id;
      if (!userID) throw new Error('User ID not found');

      // Prepare avatar and background upload promises
      const avatarNeedsUpload = avtInput && avtInput !== user?.profile_image && avtInput.startsWith('file');
      const backgroundNeedsUpload = bgInput && bgInput !== user?.background_url && bgInput.startsWith('file');

      // Helper for uploading an image
      const uploadImage = async (fileUri: string, type: 'avatar' | 'background') => {
        const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${type === 'avatar' ? 'avatar' : 'background'}/${userID}.${fileExtension}`;
        const fileArrayBuffer = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Convert base64 to Uint8Array
        const byteCharacters = atob(fileArrayBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const uint8Array = new Uint8Array(byteNumbers);
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('sizzl-profileimg')
          .upload(fileName, uint8Array, {
            contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
            upsert: true,
          });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('sizzl-profileimg')
          .getPublicUrl(fileName);
        if (!urlData?.publicUrl) throw new Error(`Failed to get ${type} public URL`);
        return urlData.publicUrl;
      };

      // Run uploads in parallel
      const [avatarResult, backgroundResult] = await Promise.allSettled([
        avatarNeedsUpload ? uploadImage(avtInput, 'avatar') : Promise.resolve(avtInput),
        backgroundNeedsUpload ? uploadImage(bgInput, 'background') : Promise.resolve(bgInput),
      ]);

      let profileImageUrl = avtInput;
      let backgroundUrl = bgInput;

      if (avatarResult.status === 'rejected') {
        Alert.alert('Avatar Upload Error', avatarResult.reason?.message || 'Failed to upload avatar image.');
        setLoading(false);
        return;
      } else if (avatarResult.status === 'fulfilled') {
        profileImageUrl = avatarResult.value;
      }

      if (backgroundResult.status === 'rejected') {
        Alert.alert('Background Upload Error', backgroundResult.reason?.message || 'Failed to upload background image.');
        setLoading(false);
        return;
      } else if (backgroundResult.status === 'fulfilled') {
        backgroundUrl = backgroundResult.value;
      }

      // 3. Update user fields in Supabase
      // Ensure birthdate is a string in YYYY-MM-DD format for Supabase date type
      let birthdate: string | null = null;
      if (dob instanceof Date && !isNaN(dob.getTime()) && dobAvail) {
        // Format as YYYY-MM-DD
        birthdate = dob.toISOString().split('T')[0];
      } else if (typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob) && dobAvail) {
        birthdate = dob;
      } else {
        birthdate = null;
      }

      const updateFields = {
        firstname: input.firstname,
        lastname: input.lastname,
        username: input.username,
        bio: input.bio,
        facebookurl: input.facebookurl,
        instagramurl: input.instagramurl,
        snapchaturl: input.snapchaturl,
        xurl: input.xurl,
        birthdate: birthdate,
        profile_image: profileImageUrl,
        background_url: backgroundUrl,
      };
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update(updateFields)
        .eq('id', userID)
        .select();
      if (updateError) throw updateError;

      // 4. Update local user store
      setUser({
        ...user,
        ...updateFields,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      router.replace({ pathname: '/(profile)/profile', params: { user_id: user?.id } });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (selectedDate: Date) => {
    setDOBInput(selectedDate);
    setDOBAvail(true);
  };

  return (
    <ProfileBackgroundWrapper self={true} imageUrl={bgInput}>
      <View style={{ flex: 1, height: 'auto', marginVertical: 40, marginHorizontal: 'auto', marginBottom: 100, width: '90%' }}>
        <Text style={[tw`w-full text-center text-white text-md mb-4`, { fontFamily: 'Nunito-ExtraBold' }]}>Edit profile</Text>
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
        <TouchableOpacity style={[tw`mb-2 rounded-full border-2 border-white mx-auto`, { width: 100, height: 100, overflow: 'hidden', backgroundColor: '#222' }]}
          onPress={pickAvatar}>
          {/* Fast loading profile image with fallback and cache busting */}
          {avtInput ? (
            <Image
              source={{ uri: avtInput + (avtInput.startsWith('file') ? '' : `?cb=${user?.id || ''}`) }}
              style={{ width: 100, height: 100 }}
              resizeMode="cover"
              defaultSource={require('../../assets/icons/pfpdefault.svg')}
              onError={() => { }}
            />
          ) : (
            <Image
              source={require('../../assets/icons/pfpdefault.svg')}
              style={{ width: 100, height: 100 }}
              resizeMode="cover"
            />
          )}
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDOBOpen(true)}
            style={[tw`mb-2`, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}
            accessibilityRole="button"
            accessibilityLabel="Add your birthday"
          >
            <TextInput
              style={[tw`text-white px-4 py-2`, { fontFamily: 'Nunito-Medium', opacity: 0.7 }]}
              placeholder='Add your birthday (optional)'
              value={dobAvail ? formatDate(dob) : ''}
              editable={false}
              pointerEvents="none"
              placeholderTextColor={'#9CA3AF'}
            />
          </TouchableOpacity>

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
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={[tw`text-black font-bold`, { fontFamily: 'Nunito-Bold', fontSize: 16 }]}>
              Save changes
            </Text>
          </TouchableOpacity>
          {/* Not now */}
          <TouchableOpacity
            style={{ alignItems: 'center', marginBottom: 8 }}
            onPress={() => router.replace({ pathname: '/(profile)/profile', params: { user_id: user?.id } })}
          >
            <Text style={[tw`text-white`, { fontFamily: 'Nunito-Medium', fontSize: 14, opacity: 0.7 }]}>
              Not now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {dobOpen && Platform.OS == 'ios' &&
        <TouchableOpacity style={tw`w-full h-full flex-col-reverse absolute top-0 left-0 bg-black bg-opacity-60 z-[99]`}
          onPress={() => {
            setDOB(dobInput);
            setDOBOpen(false);
          }}>
          <View style={tw`bg-black w-full h-80 flex-col p-4 absolute left-0 bottom-0`}>
            <DateTimePicker
              mode='date'
              display='spinner'
              value={dob}
              onChange={onChangeDOB}
              textColor='#FFFFFF'>

            </DateTimePicker>
            <View style={tw`flex-row justify-center gap-8`}>
              <TouchableOpacity style={tw`px-4 py-2 bg-white rounded-full`}
                onPress={() => {
                  setDOBOpen(false);
                  setDOBInput(dob);
                }}>
                <Text style={[tw`text-[4]`, { fontFamily: 'Nunito-Bold' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`px-4 py-2 bg-[#392465] rounded-full`}
                onPress={() => {
                  setDOB(dobInput);
                  setDOBAvail(true);
                  setDOBOpen(false);
                }}>
                <Text style={[tw`text-[4] text-white`, { fontFamily: 'Nunito-Bold' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>}
    </ProfileBackgroundWrapper>
  );
}
