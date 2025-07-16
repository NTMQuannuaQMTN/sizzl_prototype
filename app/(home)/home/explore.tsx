import { supabase } from '@/utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../../store/userStore';
import TopBar from '../../topbar';
import EventCard from './eventcard';

export default function Explore() {
    const { session, user } = useUserStore();
    const [users, setUsers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const currentUserId = user?.id;

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, firstname, lastname, profile_image')
            .neq('id', currentUserId);
        if (!error && data) {
            setUsers(data);
        } else {
            console.error('Error fetching users:', error.message);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    };

    useEffect(() => {
        console.log(currentUserId);
        fetchUsers();
    }, []);

    return (
        <LinearGradient
            colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <ScrollView 
                style={tw`flex-1 mt-8`}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ffffff"
                        colors={["#ffffff"]}
                    />
                }
            >
                <View style={tw`px-4 pt-4`}>
                    {/* Header */}
                    <TopBar />

                    {/* Explore / Your events toggle */}
                    {/* <View style={tw`w-full items-center mt-4 mb-2`}>
                        <View style={tw`w-full justify-around flex-row rounded-full`}>
                            <View style={tw`w-[50%] items-center bg-white rounded-full py-2`}>
                                <Text style={[tw`text-indigo-900`, { fontFamily: 'Nunito-ExtraBold' }]}>Explore</Text>
                            </View>
                            <View style={tw`w-[50%] items-center py-2`}>
                                <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Your events</Text>
                            </View>
                        </View>
                    </View> */}

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

                    {/* People you may know */}
                    <Text style={tw`text-white font-bold text-lg mt-6 mb-2`}>People you may know</Text>
                    <View style={tw`gap-y-3 mb-4`}> 
                        {users.map((user) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

// UserCard component
function UserCard({ user }: { user: { id: string; username?: string; firstname?: string; lastname?: string; profile_image?: string } }) {
    return (
        <TouchableOpacity style={tw`flex-row items-center bg-white/10 rounded-xl px-4 py-3`}
        onPress={() => router.replace({ pathname: '/(profile)/profile', params: { user_id: user.id } })}> 
            <View style={tw`w-10 h-10 rounded-full bg-white/20 mr-3 overflow-hidden justify-center items-center`}>
                {user.profile_image ? (
                    <Image source={{ uri: user.profile_image }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                    <Image source={require('../../../assets/images/pfp-default.png')} style={{ width: 40, height: 40, borderRadius: 20 }} />
                )}
            </View>
            <Text style={tw`text-white flex-1 font-semibold`}>{user.firstname} {user.lastname} <Text style={tw`text-white/60`}>@{user.username}</Text></Text>
            <View style={tw`ml-2`}>
                <View style={tw`bg-yellow-400 rounded-full px-4 py-2`}>
                    <Text style={tw`text-indigo-900 font-bold`}>Add Friend</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
