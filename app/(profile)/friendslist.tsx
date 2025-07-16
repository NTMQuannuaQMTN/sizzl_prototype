import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import Back from '../../assets/icons/back.svg';
import { useUserStore } from '../store/userStore';

export default function FriendsList() {
    const router = useRouter();
    const [friends, setFriends] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { user } = useUserStore();

    React.useEffect(() => {
        // Fetch friends from supabase
        const fetchFriends = async () => {
            setLoading(true);
            try {
                const userId = user.id;
                if (!userId) {
                    setFriends([]);
                    setLoading(false);
                    return;
                }
                // Fetch all rows where user_id or friend is current user
                let { data: friendRows, error } = await supabase
                    .from('friends')
                    .select('friend')
                    .eq('user_id', userId);
                if (error || !friendRows || friendRows.length === 0) {
                    setFriends([]);
                } else {
                    // Get the other user's id for each row
                    console.log(friendRows);
                    let otherUserIds = friendRows.map((row: any) => row.friend);
                    // Deduplicate
                    otherUserIds = Array.from(new Set(otherUserIds));
                    console.log(otherUserIds);
                    if (otherUserIds.length === 0) {
                        setFriends([]);
                    } else {
                        let { data: profiles, error: profileError } = await supabase
                            .from('users')
                            .select('id, username, profile_image')
                            .in('id', otherUserIds);
                        if (profileError || !profiles) {
                            setFriends([]);
                        } else {
                            setFriends(profiles.map((p: any) => (p)));
                            console.log(friends);
                        }
                    }
                }
            } catch (err) {
                setFriends([]);
            }
            setLoading(false);
        };
        fetchFriends();
    }, []);

    return (
        <LinearGradient
            colors={["#080B32", "#0E1241", "#291C56", "#392465", "#51286A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={tw`relative flex-row items-center px-4 mt-10 mb-1.5 h-10`}>
                {/* Back button - absolute left */}
                <TouchableOpacity
                    onPress={() => router.replace('/(home)/home/explore')}
                    style={[tw`absolute left-3`, { zIndex: 2 }]}
                >
                    <Back />
                </TouchableOpacity>
                {/* Centered title */}
                <View style={tw`flex-1 items-center justify-center`}>
                    <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Friends</Text>
                </View>
            </View>

            {/* Friend List */}
            <View style={tw`flex-1 px-4 pt-2`}>
                {loading ? (
                    <Text style={tw`text-white text-center mt-10`}>Loading...</Text>
                ) : friends.length === 0 ? (
                    <View style={tw`-mt-20 flex-1 justify-center items-center`}>
                        <Text style={[tw`text-white text-center text-[17px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Oops, no friends yet 😔</Text>
                        <Text style={[tw`text-white text-center text-[15px] mt-0.5`, { fontFamily: 'Nunito-Medium' }]}>Your friends might be on Sizzl. Let's explore!</Text>
                        <TouchableOpacity
                            style={tw`mt-5 bg-[#7A5CFA] items-center justify-center px-6 py-2 rounded-xl`}
                            activeOpacity={0.7}
                        // onPress={() => router.replace('/(home)/home/explore')}
                        >
                            <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Start exploring!</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    friends.map((friend) => (
                        <View key={friend.id} style={tw`flex-row items-center mb-4 bg-[#1a1a3c] rounded-lg p-3`}>
                            <Image
                                source={friend.profile_image || require('../../assets/images/default_1.png')}
                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                            />
                            <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-Bold' }]}>
                                {friend.username || 'Unknown'}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </LinearGradient>
    );
}
