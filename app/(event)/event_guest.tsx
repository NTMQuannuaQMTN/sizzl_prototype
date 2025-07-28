import { supabase } from '@/utils/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import defaultImages from '../(create)/defaultimage';
import Back from '../../assets/icons/back.svg';


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
    const { id, hosting } = useLocalSearchParams();
    const [event, setEvent] = useState<EventView | null>(null);
    const [rsvp, setRSVP] = useState<any[]>([]);

    useEffect(() => {
        const getEventDetail = async () => {
            const { data, error: eventErr } = await supabase.from('events')
                .select('*').eq('id', id).single();

            if (!eventErr) {
                setEvent(data);
            } else {
                console.log('Err');
            }
        }

        getEventDetail();
    }, [id]);

    useEffect(() => {
        const getRSVP = async () => {
            const { data, error } = await supabase
                .from('guests')
                .select('decision, user_id, users(profile_image, firstname, lastname, username)')
                .eq('event_id', id)
                .in('decision', (hosting === 'Hosting' ? ['Going', 'Maybe', 'Nope'] : ['Going', 'Maybe']))

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
            <View style={tw`bg-black absolute top-0 left-0 bg-opacity-60 w-full h-full pt-10`}>
                <View style={tw`px-4 pt-3 pb-1`}>
                    {/* Top bar with back and threedots icons */}
                    <View style={tw`flex-row items-center justify-between mb-1.5`}>
                        <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
                            <Back width={24} height={24} />
                        </TouchableOpacity>
                        <View style={tw`flex-1`} />
                    </View>
                    <Text
                        style={[tw`text-white text-[24px] w-full leading-[1.25]`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}
                        numberOfLines={2}
                        allowFontScaling={true}
                        ellipsizeMode="tail"
                    >
                        {event?.title}
                    </Text>
                    <Text style={[tw`text-white text-[18px]`, { fontFamily: 'Nunito-Bold' }]}>All guests</Text>
                    <ScrollView style={tw`mt-2 w-full h-full gap-2`}>
                        {rsvp.filter(e => e.decision === 'Going').map((e, ind) => {
                            return <TouchableOpacity key={ind} style={[tw`flex-row px-3 py-1.5 bg-white bg-opacity-30 rounded-lg items-center gap-x-2 border border-white`]}
                                onPress={() => router.push({ pathname: '/(profile)/profile', params: { user_id: e.user_id } })}>
                                <Image source={{ uri: e.users.profile_image }} width={30} height={30} style={tw`rounded-full`} />
                                <View>
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{e.users.firstname} {e.users.lastname}</Text>
                                    <Text style={[tw`text-white text-[12px]`, { fontFamily: 'Nunito-Bold' }]}>@{e.users.username}</Text>
                                </View>
                                <View style={tw`flex-1`} />
                                <View style={tw`rounded-full px-2 py-1 bg-green-600`}>
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{e.decision.toUpperCase()}</Text>
                                </View>
                            </TouchableOpacity>
                        })}

                        {rsvp.filter(e => e.decision === 'Maybe').map((e, ind) => {
                            return <TouchableOpacity key={ind} style={[tw`flex-row px-3 py-1.5 bg-white bg-opacity-30 rounded-lg items-center gap-x-2 border border-white`]}
                                onPress={() => router.push({ pathname: '/(profile)/profile', params: { user_id: e.user_id } })}>
                                <Image source={{ uri: e.users.profile_image }} width={30} height={30} style={tw`rounded-full`} />
                                <View>
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{e.users.firstname} {e.users.lastname}</Text>
                                    <Text style={[tw`text-white text-[12px]`, { fontFamily: 'Nunito-Bold' }]}>@{e.users.username}</Text>
                                </View>
                                <View style={tw`flex-1`} />
                                <View style={tw`rounded-full px-2 py-1 bg-yellow-600`}>
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{e.decision.toUpperCase()}</Text>
                                </View>
                            </TouchableOpacity>
                        })}

                        {rsvp.filter(e => e.decision === 'Nope').map((e, ind) => {
                            return <TouchableOpacity key={ind} style={[tw`flex-row px-3 py-1.5 bg-white bg-opacity-30 rounded-lg items-center gap-x-2 border border-white`]}
                                onPress={() => router.push({ pathname: '/(profile)/profile', params: { user_id: e.user_id } })}>
                                <Image source={{ uri: e.users.profile_image }} width={30} height={30} style={tw`rounded-full`} />
                                <View>
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{e.users.firstname} {e.users.lastname}</Text>
                                    <Text style={[tw`text-white text-[12px]`, { fontFamily: 'Nunito-Bold' }]}>@{e.users.username}</Text>
                                </View>
                                <View style={tw`flex-1`} />
                                <View style={tw`rounded-full px-2 py-1 bg-rose-600`}>
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{e.decision.toUpperCase()}</Text>
                                </View>
                            </TouchableOpacity>
                        })}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
