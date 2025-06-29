import { supabase } from "@/utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from "react-native";
import tw from 'twrnc';
import { useAuthStore } from "../store/authStore";

export default function SignUp() {
    const router = useRouter();
    const [valid, setValid] = useState(true);
    const [email, setEmail] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const { setSignupInfo } = useAuthStore();

    const getSchoolFromEmail = async (email: string) => {
        if (email.indexOf('@') < 0) return '';
        const domain = email.trim().split('@')[1].toLowerCase();
        if (!domain) return '';

        const { data, error } = await supabase.from('school')
            .select('id').eq('domain', domain).single();

        if (error) {
            console.log('Error fetching school with domain', domain, error);
            return '';
        }

        return data.id || '';
    }

    const checkEmail = async () => {
        const newSchool = await getSchoolFromEmail(email);
        setValid(newSchool !== '');
        if (newSchool !== '') {
            setSignupInfo({ email: email, school: newSchool });

            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: 'exp://j3bihve-courtins-8081.exp.direct',
                },
            });

            if (error) {
                console.log("OTP send error", error.message);
                return;
            }

            router.replace('/(auth)/verify');
        }
    };


    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setIsFocused(false);
        }}>
            <LinearGradient
                colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1, padding: 20 }}
            >
            {/* Center content - takes up most of the screen */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={tw`mb-8`}>
                    <Text style={[tw`text-white text-sm text-center mb-2`, { fontFamily: 'Nunito-Medium' }]}>What's sizzlin' on your campus?</Text>
                    <Text style={[tw`text-white text-lg text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>Join to find out 🚀</Text>
                </View>

                {/* Form */}
                <View style={tw`w-full`}>
                    <Text style={[tw`text-white mb-1.5 text-[13px]`, { fontFamily: 'Nunito-SemiBold' }]}>College email</Text>
                    <TextInput 
                        style={[
                            tw`h-10 bg-white bg-opacity-5 w-full rounded-[2] px-3 py-2 text-white text-[13px]`,
                            {
                                fontFamily: 'Nunito-Medium',
                                borderWidth: 1,
                                borderColor: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                            }
                        ]}
                        placeholder="hello@yourcollege.edu"
                        placeholderTextColor={'#9CA3AF'}
                        value={email} 
                        onChangeText={(newVal) => { setEmail(newVal); setValid(true); }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        caretHidden={!isFocused}
                    />
                </View>

                {/* Error */}
                {valid ||
                <View style={tw`w-full py-2 mt-1.5 items-center justify-center bg-[#FF1769] rounded-[2]`}>
                    <Text style={[tw`text-[#FFFFFF]`, { fontFamily: 'Nunito-Medium' }]}>Oops, you gotta use a proper .edu email 😭</Text>
                </View>}
            </View>

            {/* Bottom content - fixed at bottom */}
            <Text style={[tw`text-white text-[10px] text-center mb-4`, { fontFamily: 'Nunito-Regular' }]}>By tapping SEND CODE, you consent to receive email updates from us or event hosts. Unsubscribe in the emails</Text>
            <TouchableOpacity onPress={checkEmail}
                style={tw`bg-white rounded-full py-[10] w-full items-center mb-8`}>
                <Text style={[tw`text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>Send code</Text>
            </TouchableOpacity>
        </LinearGradient>
        </TouchableWithoutFeedback>
    );
}