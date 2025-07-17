import { useUserStore } from '@/app/store/userStore';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import EventCard from '../eventcard';

export default function Allevents() {
    const [events, setEvents] = useState<any[]>([]);
    const { user } = useUserStore();

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events')
                .select('*').eq('school_id', user.school_id);
            if (error) {
                console.log('Yes problem in getting events');
            } else {
                setEvents(data);
            }
        }
        fetchEvents();
    }, []);

    return (
        <ScrollView style={tw`flex-1`}>
            {/* Upcoming hit event */}
            <View style={tw`flex-row items-center mb-2`}>
                <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>🔥 Upcoming hit event</Text>
            </View>
            {/* Event Card 1 */}
            {events.map((e, index) => {
                console.log(e);
                return <EventCard key={index} event={e} />
            })}
        </ScrollView>
    );
}
