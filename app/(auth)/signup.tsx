import { supabase } from "@/utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';
import { useAuthStore } from "../store/authStore";

export default function SignUp() {
    const router = useRouter();
    const [valid, setValid] = useState(true);
    const [email, setEmail] = useState('');

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

            router.push('/(auth)/verify');
        }
    };


    return (
        <LinearGradient
            colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
        >
            <Text style={tw`text-[#FFFFFF] text-[2.9] text-center`}>What's sizzlin' on your campus</Text>
            <Text style={tw`text-[#FFFFFF] font-extrabold text-xl`}>Join to find out 🚀</Text>

            {/* Form */}
            <Text style={tw`text-[#FFFFFF] font-bold w-full`}>College email</Text>
            <TextInput style={tw`h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-[#FFFFFF]`}
                placeholder="hello@yourcollege.edu" placeholderTextColor={'#9CA3AF'}
                value={email} onChangeText={(newVal) => { setEmail(newVal); setValid(true); }}></TextInput>
            {/* Error */}
            {valid || <View style={tw`w-full py-2 items-center justify-center bg-[#FF1769] rounded-[1]`}>
                <Text style={tw`text-[#FFFFFF]`}>Oops, you gotta use a proper .edu email 😭</Text>
            </View>}

            <Text style={tw`text-[#FFFFFF] text-[2.9] text-center`}>By tapping SEND CODE, you consent to receive email updates from us or event hosts. Unsubscribe in the emails</Text>
            <TouchableOpacity onPress={checkEmail}
                style={tw`bg-white rounded-[5] py-[10] w-full items-center`}>
                <Text style={tw`text-[#000000] font-bold`}>Send code</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}