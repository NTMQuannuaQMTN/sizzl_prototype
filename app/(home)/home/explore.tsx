import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../../store/userStore';
import EventCard from './eventcard';


import TopBar from '../../topbar';

export default function Explore() {
    const { session, user } = useUserStore();

    useEffect(() => {
        console.log(session);
        console.log(user);
    }, [session, user]);

    return (
        <LinearGradient
            colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={tw`px-4 pt-12 flex-1`}>
                {/* Header */}
                <TopBar />

                {/* Explore / Your events toggle */}
                <View style={tw`w-full items-center mt-4 mb-2`}>
                    <View style={tw`w-full justify-around flex-row rounded-full`}>
                        <View style={tw`w-[50%] items-center bg-white rounded-full py-2`}>
                            <Text style={tw`text-indigo-900 font-bold`}>Explore</Text>
                        </View>
                        <View style={tw`w-[50%] items-center py-2`}>
                            <Text style={tw`text-white font-bold`}>Your events</Text>
                        </View>
                    </View>
                </View>

                {/* Events / Feed tabs */}
                <View style={tw`flex-row mt-3 mb-2`}>
                    <Text style={tw`text-white border-b-2 pb-1 px-2 border-white font-bold mr-6`}>Events</Text>
                    <Text style={tw`text-white/60 font-bold`}>Feed</Text>
                </View>

                {/* Upcoming hit event */}
                <View style={tw`flex-row items-center mb-2`}>
                    <Text style={tw`text-yellow-400 text-base font-bold mr-2`}>🔥</Text>
                    <Text style={tw`text-yellow-400 font-bold`}>Upcoming hit event</Text>
                </View>

                {/* Event Card 1 */}
                <EventCard />
            </View>
        </LinearGradient>
    );
}