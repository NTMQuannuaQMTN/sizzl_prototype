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
            const { data: cohostEvents, error: cohostError } = await supabase
                .from('hosts')
                .select('event_id')
                .eq('user_id', user.id);

            if (cohostError) {
                console.log('Problem getting cohost events');
            }

            // Extract event_ids from cohostEvents
            const cohostEventIds = (cohostEvents || []).map(e => e.event_id);

            // 2. Fetch events where (school_id = user.school_id) OR (id in cohostEventIds)
            let query = supabase
                .from('events')
                .select('*')
                .eq('done', true)
                .or([
                    `school_id.eq.${user.school_id}`,
                    cohostEventIds.length > 0 ? `id.in.(${cohostEventIds.join(',')})` : ''
                ].filter(Boolean).join(','));

            const { data, error } = await query;

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
