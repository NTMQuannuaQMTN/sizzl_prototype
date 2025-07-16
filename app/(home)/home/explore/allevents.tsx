import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import EventCard from '../eventcard';

export default function Allevents() {
    const [users, setUsers] = useState<any[]>([]);
    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, firstname, lastname, profile_image');
            if (!error && data) {
                setUsers(data);
            } else {
                console.error('Error fetching users:', error?.message);
            }
        };
        fetchUsers();
    }, []);
    return (
        <ScrollView style={tw`flex-1`}>
            {/* Upcoming hit event */}
            <View style={tw`flex-row items-center mb-2`}>
                <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>🔥 Upcoming hit event</Text>
            </View>
            {/* Event Card 1 */}
            <EventCard />
        </ScrollView>
    );
}
