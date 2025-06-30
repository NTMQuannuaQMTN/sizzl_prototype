import { supabase } from '@/utils/supabase';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import tw from 'twrnc';
import DefaultProfileIMG from '../../assets/images/pfp-default.png';

export default function Register() {
  // Helper to check if all required fields are filled
  const allFieldsFilled = () => {
    return (
      registerInfo.username.trim().length > 0 &&
      registerInfo.first.trim().length > 0 &&
      registerInfo.last.trim().length > 0
    );
  };
  const [imagePage, setImagePage] = useState(false);
  const [focusedField, setFocusedField] = useState<null | 'username' | 'first' | 'last'>(null);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [registerInfo, setRegisterInfo] = useState({
    username: '',
    first: '',
    last: '',
    image: '',
  })

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });

    console.log(result);

    if (!result.canceled) {
      setImageInput(result.assets[0].uri);
    }
  }

  const checkRegister = () => {
    setLoading(true);
    setShowFieldErrors(true);

    // Username validation: 4+ chars, only a-z, 0-9, _, .
    const usernameRegex = /^[a-z0-9_.]{4,}$/;
    if (!usernameRegex.test(registerInfo.username)) {
      setValid(false);
      setLoading(false);
      return false;
    }

    // First name validation: 2+ characters, letters and spaces only
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    if (!nameRegex.test(registerInfo.first.trim())) {
      setValid(false);
      setLoading(false);
      return false;
    }

    // Last name validation: 2+ characters, letters and spaces only
    if (!nameRegex.test(registerInfo.last.trim())) {
      setValid(false);
      setLoading(false);
      return false;
    }

    // All validations passed
    setValid(true);
    setLoading(false);

    // TODO: Save user data to database
    console.log('Registration data:', {
      username: registerInfo.username,
      firstName: registerInfo.first.trim(),
      lastName: registerInfo.last.trim()
    });

    return true;
  }

  const confirmRegister = async () => {
    const filePath = `avatar/${registerInfo.username}`

    // Convert the image URI to a Blob before uploading to Supabase
    try {
      const response = await fetch(imageInput);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('sizzl-profileimg')
        .upload(filePath, blob);

      if (error) {
        console.error('Upload error:', error);
        return;
      }

      const { data } = await supabase.storage.from('sizzl-profileimg').getPublicUrl(filePath);
      setRegisterInfo((regInfo) => ({ ...regInfo, image: data.publicUrl }));
      console.log(registerInfo);

      const { error: insertError } = await supabase.from('users').insert({ registerInfo }).select().single();
      if (insertError) {
        console.error('Insert error', insertError);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setFocusedField(null); }}>
      <LinearGradient
        colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, padding: 20 }}
      >
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={tw`mb-5`}>
                <Text style={[tw`text-white text-sm text-center mb-1`, { fontFamily: 'Nunito-Medium' }]}>{imagePage ? 'Add your profile image!' : 'Finish your profile!'}</Text>
                <Text style={[tw`text-white text-lg text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>{imagePage ? 'Make it easier to find your friends 💛' : 'Can’t be nameless, right 🙃'}</Text>
              </View>

              {imagePage ||
                <View style={tw`w-full h-fit`}>
                  {/* Form */}
                  <Text style={[tw`text-white mb-1.5 text-[13px]`, { fontFamily: 'Nunito-SemiBold' }]}>Username</Text>
                  <View style={tw`w-full relative items-center`}>
                    <TextInput
                      style={[
                        tw`h-10 bg-white bg-opacity-5 w-full rounded-[2] px-3 py-2 text-[13px]`,
                        {
                          fontFamily: 'Nunito-Medium',
                          borderWidth: 1,
                          borderColor:
                            showFieldErrors && !/^[a-z0-9_.]{4,}$/.test(registerInfo.username)
                              ? '#FF1769'
                              : focusedField === 'username'
                                ? '#FFFFFF'
                                : 'rgba(255, 255, 255, 0.1)',
                          textAlign: 'left',
                          color:
                            showFieldErrors && !/^[a-z0-9_.]{4,}$/.test(registerInfo.username)
                              ? '#FF1769'
                              : '#FFFFFF',
                        },
                      ]}
                      value={registerInfo.username}
                      placeholder="choppedpartythrower"
                      placeholderTextColor={'#9CA3AF'}
                      onChangeText={newUsername => {
                        setRegisterInfo(regInfo => ({ ...regInfo, username: newUsername }));
                        setValid(true);
                        setShowFieldErrors(false);
                      }}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      caretHidden={focusedField !== 'username'}
                    />
                  </View>
                  <Text
                    style={[
                      tw`text-[10px] text-left mt-1.5 mb-2.5 leading-[1.2]`,
                      {
                        fontFamily: 'Nunito-Medium',
                        color:
                          showFieldErrors && !/^[a-z0-9_.]{4,}$/.test(registerInfo.username)
                            ? '#FF1769'
                            : '#FFFFFF',
                      },
                    ]}
                  >
                    Must be between a-z, 0-9, _ , . and have at least 4 characters
                  </Text>

                  {/* First and Last name on the same row */}
                  <View style={tw`flex-row w-full gap-0.5 mt-2`}>
                    <View style={tw`flex-1`}>
                      <Text style={[tw`text-white mb-1.5 text-[13px]`, { fontFamily: 'Nunito-SemiBold' }]}>First name</Text>
                      <TextInput
                        style={[
                          tw`h-10 bg-white bg-opacity-5 w-full rounded-[2] px-3 py-2 text-[13px]`,
                          {
                            fontFamily: 'Nunito-Medium',
                            borderWidth: 1,
                            borderColor:
                              showFieldErrors && !/^[a-zA-Z\s]{2,}$/.test(registerInfo.first.trim())
                                ? '#FF1769'
                                : focusedField === 'first'
                                  ? '#FFFFFF'
                                  : 'rgba(255, 255, 255, 0.1)',
                            textAlign: 'left',
                            color:
                              showFieldErrors && !/^[a-zA-Z\s]{2,}$/.test(registerInfo.first.trim())
                                ? '#FF1769'
                                : '#FFFFFF',
                          },
                        ]}
                        value={registerInfo.first}
                        placeholder="Sizzle"
                        placeholderTextColor={'#9CA3AF'}
                        onChangeText={newName => {
                          setRegisterInfo(regInfo => ({ ...regInfo, first: newName }));
                          setValid(true);
                          setShowFieldErrors(false);
                        }}
                        onFocus={() => setFocusedField('first')}
                        onBlur={() => setFocusedField(null)}
                        caretHidden={focusedField !== 'first'}
                      />
                      <Text
                        style={[
                          tw`text-[10px] text-left mt-1.5 mb-2.5 leading-[1.2]`,
                          {
                            fontFamily: 'Nunito-Medium',
                            color:
                              showFieldErrors && !/^[a-zA-Z\s]{2,}$/.test(registerInfo.first.trim())
                                ? '#FF1769'
                                : '#FFFFFF',
                          },
                        ]}
                      >
                        Must have at least 2 characters
                      </Text>
                    </View>
                    <View style={tw`flex-1 ml-2`}>
                      <Text style={[tw`text-white mb-1.5 text-[13px]`, { fontFamily: 'Nunito-SemiBold' }]}>Last name</Text>
                      <TextInput
                        style={[
                          tw`h-10 bg-white bg-opacity-5 w-full rounded-[2] px-3 py-2 text-[13px]`,
                          {
                            fontFamily: 'Nunito-Medium',
                            borderWidth: 1,
                            borderColor:
                              showFieldErrors && !/^[a-zA-Z\s]{2,}$/.test(registerInfo.last.trim())
                                ? '#FF1769'
                                : focusedField === 'last'
                                  ? '#FFFFFF'
                                  : 'rgba(255, 255, 255, 0.1)',
                            textAlign: 'left',
                            color:
                              showFieldErrors && !/^[a-zA-Z\s]{2,}$/.test(registerInfo.last.trim())
                                ? '#FF1769'
                                : '#FFFFFF',
                          },
                        ]}
                        value={registerInfo.last}
                        placeholder="Mingle"
                        placeholderTextColor={'#9CA3AF'}
                        onChangeText={newName => {
                          setRegisterInfo(regInfo => ({ ...regInfo, last: newName }));
                          setValid(true);
                          setShowFieldErrors(false);
                        }}
                        onFocus={() => setFocusedField('last')}
                        onBlur={() => setFocusedField(null)}
                        caretHidden={focusedField !== 'last'}
                      />
                      <Text
                        style={[
                          tw`text-[10px] text-left mt-1.5 mb-2 leading-[1.2]`,
                          {
                            fontFamily: 'Nunito-Medium',
                            color:
                              showFieldErrors && !/^[a-zA-Z\s]{2,}$/.test(registerInfo.last.trim())
                                ? '#FF1769'
                                : '#FFFFFF',
                          },
                        ]}
                      >
                        Must have at least 2 characters
                      </Text>
                    </View>
                  </View>

                  {valid ? null : (
                    <View style={tw`w-full py-2 mt-1.5 items-center justify-center bg-[#FF1769] rounded-[2]`}>
                      <Text style={[tw`text-white`, { fontFamily: 'Nunito-Medium' }]}>Oops, check your input please 😭</Text>
                    </View>
                  )}
                </View>}
              {imagePage && <View style={tw`w-full h-fit items-center`}>
                <TouchableOpacity style={tw`bg-white w-[50] h-[50] items-center justify-center rounded-full`}
                  onPress={() => { pickImage() }}>
                  <Image style={tw`w-full h-full rounded-full`} resizeMode="contain" source={imageInput ? { uri: imageInput } : DefaultProfileIMG}></Image>
                </TouchableOpacity>
              </View>}
            </View>
          </KeyboardAvoidingView>
          {/* Bottom button - fixed at bottom */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, marginBottom: 32 }}>
            <TouchableOpacity
              style={[tw`bg-white rounded-full py-[10] w-full items-center`, (loading || !allFieldsFilled()) && tw`opacity-50`]}
              onPress={() => {
                if (!imagePage && checkRegister()) setImagePage(true);
                else if (imagePage) confirmRegister();
              }}
              disabled={loading || !allFieldsFilled()}
            >
              <Text style={[tw`text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>
                {loading ? 'Verifying...' : imagePage ? 'Let\'s start!' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}