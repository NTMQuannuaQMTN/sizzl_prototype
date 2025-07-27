import { supabase } from '@/utils/supabase';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import tw from 'twrnc';

import defaultImages from '../(create)/defaultimage';


type EventView = {
    id: string;
    title: string;
    public: boolean;
    image: string;
    start: string;
    end: string;
    location_add: string;
    location_name: string;
    location_more: string;
    location_note: string;
    rsvp_deadline: string;
    bio: string;
    cash_prize: string | null;
    free_food: string | null;
    free_merch: string | null;
    cool_prize: string | null;
    host_id: string;
    public_list: boolean;
    maybe: boolean;
    rsvpfirst: boolean;
    school_id: string;
}

export default function EventGuests() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<EventView | null>(null);
    const [rsvp, setRSVP] = useState<any[]>([]);

    useEffect(() => {
        const getRSVP = async () => {
            const { data, error } = await supabase
                .from('guests')
                .select('decision, user_id, users(profile_image)')
                .eq('event_id', id)
                .in('decision', ['Going', 'Maybe'])

            if (!error && data) setRSVP(data);
        }
        getRSVP();
    }, [event]);

    return (
        <View style={tw`w-full h-full`}>
            {/* Background image and overlay */}
            <Image
                source={
                    event
                        ? (typeof event.image === 'string'
                            ? (event.image.startsWith('file://') || event.image.startsWith('content://')
                                ? { uri: event.image }
                                : event.image.startsWith('default_')
                                    ? defaultImages[parseInt(event.image.replace('default_', ''), 10) - 1]
                                    : { uri: event.image })
                            : defaultImages[0])
                        : defaultImages[0]
                }
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    bottom: 0,
                    height: undefined,
                    minHeight: '100%',
                    resizeMode: 'cover',
                    zIndex: 0,
                }}
                blurRadius={8}
                onError={e => {
                    console.log('Background image failed to load:', e.nativeEvent);
                }}
            />
            {/* Header */}
            <ScrollView style={tw`bg-black absolute top-0 left-0 bg-opacity-60 w-full h-full pt-10`}>
            </ScrollView>
        </View>
    );
}
