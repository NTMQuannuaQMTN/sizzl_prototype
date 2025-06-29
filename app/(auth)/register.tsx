import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        username: '',
        first: '',
        last: '',
    })

    return (<LinearGradient
        colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
        <Text style={tw`text-[#FFFFFF] text-[2.9] text-center`}>Finish your profile!</Text>
        <Text style={tw`text-[#FFFFFF] font-extrabold text-xl`}>Can’t be nameless, right 🙃</Text>

        {/* Form */}
        <Text style={tw`text-[#FFFFFF] font-bold w-full`}>Username</Text>
        <View style={tw`w-full relative items-center`}>
            <TextInput
                style={tw`h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-[#FFF]`}
                value={registerInfo.username}
                onChangeText={newUsername => {
                    setRegisterInfo(regInfo => ({ ...regInfo, username: newUsername }));
                    // setValid(true);
                }}
            />
        </View>
        <Text style={tw`text-[#FFFFFF] text-[2.9]`}>Username must be between a-z, 0-9, “_”, “.” and have at least 4 characters</Text>

        <Text style={tw`text-[#FFFFFF] font-bold w-full`}>First name</Text>
        <View style={tw`w-full relative items-center`}>
            <TextInput
                style={tw`h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-[#FFF]`}
                value={registerInfo.first}
                onChangeText={newName => {
                    setRegisterInfo(regInfo => ({ ...regInfo, first: newName }));
                    // setValid(true);
                }}
            />
        </View>
        <Text style={tw`text-[#FFFFFF] text-[2.9]`}>Must have at least 2 characters</Text>

        <Text style={tw`text-[#FFFFFF] font-bold w-full`}>Last name</Text>
        <View style={tw`w-full relative items-center`}>
            <TextInput
                style={tw`h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-[#FFF]`}
                value={registerInfo.last}
                onChangeText={newName => {
                    setRegisterInfo(regInfo => ({ ...regInfo, last: newName }));
                    // setValid(true);
                }}
            />
        </View>
        <Text style={tw`text-[#FFFFFF] text-[2.9]`}>Must have at least 2 characters</Text>

        <TouchableOpacity
            style={tw`bg-white rounded-[5] py-[10] w-full items-center mt-6 ${loading ? 'opacity-50' : ''}`}
            // onPress={checkCode}
            disabled={loading}
        >
            <Text style={tw`text-[#000000] font-bold`}>
                {loading ? 'Verifying...' : 'Continue'}
            </Text>
        </TouchableOpacity>
    </LinearGradient>);
}