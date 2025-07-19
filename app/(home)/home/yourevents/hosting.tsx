import { useUserStore } from '@/app/store/userStore';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import EventCard from '../eventcard';

export default function Hosting() {
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [pastEvents, setPastEvents] = useState<any[]>([]);
    const { user } = useUserStore();

    useEffect(() => {
        const fetchEvents = async () => {
            const { data: hostEvents, error: hosErr } = await supabase.from('hosts')
                .select('event_id').eq('user_id', user.id);

            if (hosErr) {
                console.log('Error get host events');
                return;
            }

            const userCohost = (hostEvents ? hostEvents.map(e => e.event_id) : []);
            console.log('User cohost', userCohost);

            // Only include events where the RSVP deadline is after now
            const now = new Date().toISOString();

            let query_upcoming = supabase
                .from('events')
                .select('*')
                .eq('done', true)
                .or([`host_id.eq.${user.id}`,
                `id.in.(${userCohost.join(',')})`].filter(Boolean).join(','));
            query_upcoming = query_upcoming.gte('start', now);

            const { data: upcomingData, error: upcomingErr } = await query_upcoming;

            if (upcomingErr) {
                console.log('Yes problem in getting events');
            } else {
                setUpcomingEvents(upcomingData || []);
            }

            let query_past = supabase
                .from('events')
                .select('*')
                .eq('done', true)
                .or([`host_id.eq.${user.id}`,
                `id.in.(${userCohost.join(',')})`].filter(Boolean).join(','));
            query_past = query_past.lte('start', now);

            const { data: pastData, error: pastErr } = await query_past;

            if (pastErr) {
                console.log('Yes problem in getting events');
            } else {
                setPastEvents(pastData);
            }
        }
        fetchEvents();
    }, [user]);

    return (
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
            {/* Event Card 1 */}
            {upcomingEvents.map((e, index) => {
                console.log(e);
                return <EventCard key={index} event={e} />
            })}
            {/* Past events */}
            <View style={tw`flex-row items-center mb-2`}>
                <Text style={[tw`text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Past events</Text>
            </View>
            {/* Event Card 1 */}
            {pastEvents.map((e, index) => {
                console.log(e);
                return <EventCard key={index} event={e} />
            })}
        </ScrollView>
    );
}
