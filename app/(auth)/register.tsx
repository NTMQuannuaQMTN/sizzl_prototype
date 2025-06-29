import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';

export default function Register() {
    const [imagePage, setImagePage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        username: '',
        first: '',
        last: '',
        image: '',
    })

    const checkRegister = () => {
        setLoading(true);

        // Username validation: 4+ chars, only a-z, 0-9, _, .
        const usernameRegex = /^[a-z0-9_.]{4,}$/;
        console.log(!usernameRegex.test(registerInfo.username));
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

    return (<LinearGradient
        colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
        <Text style={tw`text-[#FFFFFF] text-[2.9] text-center`}>{imagePage ? 'Add your profile image!' : 'Finish your profile!'}</Text>
        <Text style={tw`text-[#FFFFFF] font-extrabold text-lg`}>{imagePage ? 'Make it easier to find your friends 💛' : 'Can’t be nameless, right 🙃'}</Text>

        {imagePage || <View style={tw`w-full h-fit`}>
            {/* Form */}
            <Text style={tw`text-[#FFFFFF] font-bold w-full`}>Username</Text>
            <View style={tw`w-full relative items-center`}>
                <TextInput
                    style={tw`h-[8] border border-[#FFFFFF] border-opacity-10 w-full rounded-[1] px-2 py-2 text-[#FFF]`}
                    value={registerInfo.username}
                    onChangeText={newUsername => {
                        setRegisterInfo(regInfo => ({ ...regInfo, username: newUsername }));
                        setValid(true);
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
                        setValid(true);
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
                        setValid(true);
                    }}
                />
            </View>
            <Text style={tw`text-[#FFFFFF] text-[2.9]`}>Must have at least 2 characters</Text>

            {valid || <View style={tw`w-full py-2 mt-1.5 items-center justify-center bg-[#FF1769] rounded-[2]`}>
                <Text style={[tw`text-white`, { fontFamily: 'Nunito-Medium' }]}>Oops, check your input please 😭</Text>
            </View>}
        </View>}
        {imagePage && <View style={tw`w-full h-fit`}>
            
        </View>}

        <TouchableOpacity
            style={tw`bg-white rounded-[5] py-[10] w-full items-center mt-6 ${loading ? 'opacity-50' : ''}`}
            onPress={() => {
                if (checkRegister()) setImagePage(true);
            }}
            disabled={loading}
        >
            <Text style={tw`text-[#000000] font-bold`}>
                {loading ? 'Verifying...' : 'Continue'}
            </Text>
        </TouchableOpacity>
    </LinearGradient>);
}