import { supabase } from "@/utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';
import { useAuthStore } from "../store/authStore";

export default function Verify() {
    const [code, setCode] = useState('');
    const MAXLENGTH = 6;
    const [valid, setValid] = useState(true);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { signupInfo, setUser, setSession } = useAuthStore();

    // Function to resend OTP
    const resendOTP = async () => {
        if (!signupInfo?.email) return;
        console.log("Resending OTP to:", signupInfo.email);
        const { error } = await supabase.auth.signInWithOtp({
            email: signupInfo.email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: 'exp://j3bihve-courtins-8081.exp.direct',
            },
        });

        if (error) {
            console.log("OTP resend error", error.message);
        } else {
            console.log("OTP resent successfully");
        }
    };

    // Function to verify the entered OTP code
    const checkCode = async () => {
        if (code.length !== MAXLENGTH || !signupInfo?.email) {
            setValid(false);
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.verifyOtp({
            email: signupInfo.email,
            token: code,
            type: "email", // Use "email_otp" if "email" doesn't work for your supabase-js version.
        });

        setLoading(false);

        if (error) {
            setValid(false);
            console.log("Verification error:", error.message);
        } else if (data && data.session && data.user) {
            setValid(true);
            setUser(data.user);
            setSession(data.session);
            const userAvailable = await checkAvailable(signupInfo.email);
            console.log(userAvailable);
            if (userAvailable === null) {
                router.replace('/(auth)/register');
            } else {
                router.replace('/(auth)/image');// Tạm thay cho Home
            }
        } else {
            setValid(false);
            console.log("Verification failed: No session returned");
        }
    };

    return (
        <LinearGradient
            colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
        >
            <Text style={tw`text-[#FFFFFF] text-[2.9] text-center`}>Check your email inbox!</Text>
            <Text style={tw`text-[#FFFFFF] font-extrabold text-xl`}>Type in the code 🙌</Text>

            {/* Form */}
            <Text style={tw`text-[#FFFFFF] font-bold w-full`}>Verification code</Text>
            <View style={tw`w-full relative items-center`}>
                <TextInput 
                    style={tw`text-center h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-[#FFF] text-opacity-0`}
                    value={code}
                    onChangeText={newCode => { 
                        setCode(newCode); 
                        setValid(true); 
                    }}
                    maxLength={MAXLENGTH}
                    caretHidden={true}
                    keyboardType="numeric"
                    autoComplete="one-time-code"
                />
                <View style={tw`w-full h-[8] py-2 items-center justify-center absolute top-0`}>
                    <Text style={tw`${code.length > 0 ? 'text-[#FFFFFF]' : 'text-gray-400'} text-md tracking-[2]`}>
                        {code + '_'.repeat(MAXLENGTH - code.length)}
                    </Text>
                </View>
            </View>

            {/* Error */}
            {valid || <View style={tw`w-full py-2 items-center justify-center bg-[#FF1769] rounded-[1]`}>
                <Text style={tw`text-[#FFFFFF]`}>Oops, the code doesn't match 😭</Text>
            </View>}

            <Text style={tw`text-[#FFFFFF] mt-4`}>Haven't seen the code?</Text>
            <TouchableOpacity onPress={resendOTP}>
                <Text style={tw`text-[#FFFFFF] underline`}>Resend code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={tw`bg-white rounded-[5] py-[10] w-full items-center mt-6 ${loading ? 'opacity-50' : ''}`}
                onPress={checkCode}
                disabled={loading}
            >
                <Text style={tw`text-[#000000] font-bold`}>
                    {loading ? 'Verifying...' : 'Continue'}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const checkAvailable = async (email) => {
    const {data, error} = await supabase.from("users").select('*').eq('email', email).single();
    if (error) {return null};
    return data;
}