import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';
import { useAuthStore } from "../store/authStore";

export default function Verify() {
    const [code, setCode] = useState('');
    const MAXLENGTH = 6;
    const [valid, setValid] = useState(true);

    const { user, token, verify, isLoading } = useAuthStore();

    useEffect(() => {
        verify(user.email);
    }, []);

    const checkOTP = async () => {
        const check = await checkCode(user.email, code);
        setValid(check);
    }

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
                <TextInput style={tw`text-center h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-opacity-0 text-[#FFF]`}
                    value={code}
                    onChangeText={newCode => { setCode(newCode); setValid(true); }}
                    maxLength={MAXLENGTH}
                    caretHidden={true}
                ></TextInput>
                <View style={tw`w-full h-[8] py-2 items-center justify-center absolute top-0`}>
                    <Text style={tw`${code.length > 0 ? 'text-[#FFFFFF]' : 'text-gray-400'} text-md tracking-[2]`}>{code + '_'.repeat(MAXLENGTH - code.length)}</Text>
                </View>
            </View>
            {/* Error */}
            {valid || <View style={tw`w-full py-2 items-center justify-center bg-[#FF1769] rounded-[1]`}>
                <Text style={tw`text-[#FFFFFF]`}>Oops, the code doesn't match 😭</Text>
            </View>}

            <Text>Haven't seen the code?</Text>
            <TouchableOpacity onPress={() => verify(user.email)}>
                <Text>Resend code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={tw`bg-white rounded-[5] py-[10] w-full items-center`}
                onPress={() => {checkOTP()}}>
                <Text style={tw`text-[#000000] font-bold`}>Continue</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}