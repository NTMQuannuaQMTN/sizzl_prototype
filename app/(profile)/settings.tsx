
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../../assets/icons/back.svg';
import AboutIcon from '../../assets/icons/catforfun.svg';
import HelpIcon from '../../assets/icons/help-icon.svg';
import InstaIcon from '../../assets/icons/insta-icon.svg';
import InviteIcon from '../../assets/icons/invite-icon.svg';
import Logout from '../../assets/icons/logout-icon.svg';
import XIcon from '../../assets/icons/x-icon.svg';
import MailIcon from '../../assets/icons/mail-icon.svg';
import FeedbackIcon from '../../assets/icons/feedback-icon.svg';
import TermsIcon from '../../assets/icons/terms-icon.svg';

export default function Settings() {
    const router = useRouter();
    return (
        <LinearGradient
            colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Top row: back icon and settings title */}
            <View style={tw`flex-row items-center px-4 pt-13 pb-4 w-full`}>
                <TouchableOpacity style={tw`mr-2`} onPress={() => router.back()} accessibilityLabel="Go back">
                    <BackIcon width={24} height={24} />
                </TouchableOpacity>
                <View style={tw`flex-1 items-center`}>
                    <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Settings</Text>
                </View>
                {/* Empty view for spacing on right */}
                <View style={tw`w-7`} />
            </View>

            {/* Invite friends box/button */}
            <View style={tw`px-6 mt-3`}>
                <TouchableOpacity style={tw`bg-white/10 rounded-lg flex-row items-center gap-x-2.5 py-4 px-4`} activeOpacity={0.8}>
                    <InviteIcon width={20} height={20} />
                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Invite friends to Sizzl</Text>
                </TouchableOpacity>
            </View>

            {/* Help */}
            <View style={tw`px-6 mt-4`}>
                <Text style={[tw`text-white text-base mb-2`, { fontFamily: 'Nunito-ExtraBold' }]}>Help</Text>
                <TouchableOpacity style={tw`bg-white/10 rounded-t-lg border-b border-white/5 flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <MailIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Contact support</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/10 rounded-b-lg flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <FeedbackIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Send feedback</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* About Sizzl */}
            <View style={tw`px-6 mt-4`}>
                <Text style={[tw`text-white text-base mb-2`, { fontFamily: 'Nunito-ExtraBold' }]}>About Sizzl</Text>
                <TouchableOpacity style={tw`bg-white/10 rounded-t-lg border-b border-white/5 flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <AboutIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>About us</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/10 border-b border-white/5 flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <InstaIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Instagram</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/10 rounded-b-lg flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <XIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Twitter (𝕏)</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={tw`px-6 mt-4`}>
                <Text style={[tw`text-white text-base mb-2`, { fontFamily: 'Nunito-ExtraBold' }]}>Terms</Text>
                <TouchableOpacity style={tw`bg-white/10 rounded-t-lg border-b border-white/5 flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <TermsIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Community Guidelines</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/10 border-b border-white/5 flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <TermsIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Terms of Service</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/10 rounded-b-lg flex-row items-center gap-x-2.5 py-4 px-4 justify-between`} activeOpacity={0.8}>
                    <View style={tw`flex-row items-center gap-x-2.5`}>
                        <TermsIcon width={20} height={20} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Privacy Policy</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Logout box/button */}
            <View style={tw`px-6 mt-4`}>
                <TouchableOpacity style={tw`bg-white/10 rounded-lg flex-row items-center gap-x-2.5 py-4 px-4`} activeOpacity={0.8}>
                    <Logout width={20} height={20} />
                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Log out</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}
