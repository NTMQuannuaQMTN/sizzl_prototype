import { supabase } from '@/utils/supabase';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import defaultImages from '../(create)/defaultimage';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import { useUserStore } from '../store/userStore';

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

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<EventView | null>(null);
    const [decision, setDecision] = useState<string>('');
    const { user } = useUserStore();

    useEffect(() => {
        const getEventDetail = async () => {
            const { data, error: eventErr } = await supabase.from('events')
                .select('*').eq('id', id).single();

            if (!eventErr) {
                setEvent(data);
                console.log(data.image);
            } else {
                console.log('Err');
            }
        }

        const getDecision = async () => {
            const { data, error } = await supabase.from('guests')
                .select('decision').eq('event_id', id)
                .eq('user_id', user.id).single()

            if (error) {
                setDecision('Not RSVP');
                return;
            }

            setDecision(data.decision);
        }

        getEventDetail();
        getDecision();
    }, [id]);

    return (
        <View style={tw`w-full h-full`}>
            <Image
                source={
                    event ? typeof event.image === 'string' && event.image.startsWith('default_')
                        ? defaultImages[parseInt(event.image.replace('default_', ''), 10) - 1]
                        : event.image
                            ? { uri: event.image }
                            : defaultImages[0]
                        : defaultImages[0]
                }
                resizeMode='cover'
                style={{
                    width: '100%', height: '100%', position: 'absolute',
                    top: 0, left: 0
                }}
            />
            {/* Header */}
            <ScrollView style={tw`bg-black absolute top-0 left-0 bg-opacity-60 w-full h-full`}>
                <View style={tw`px-4 pt-10 pb-2`}>
                    <Text style={[tw`text-white text-2xl font-extrabold`, { fontFamily: 'Nunito-ExtraBold' }]}>{event?.title}</Text>
                    <View style={tw`flex-row items-center mt-2`}>
                        {event?.public ? <View style={tw`flex-row items-center gap-2 justify-center bg-[#064B55] border border-white/10 rounded-full px-2 py-0.5 mr-1`}>
                            <Public />
                            <Text style={[tw`text-[13px] text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Public</Text>
                        </View> :
                            <View style={tw`flex-row items-center gap-2 justify-center bg-[#080B32] border border-purple-900 rounded-full px-2 py-0.5`}>
                                <Private />
                                <Text style={[tw`text-[13px] text-white`, { fontFamily: 'Nunito-ExtraBold' }]}>Private</Text>
                            </View>}
                    </View>
                </View>
                {/* Event Image */}
                <View style={tw`px-4 mt-2`}>
                    <Image
                        source={
                            event ? typeof event.image === 'string' && event.image.startsWith('default_')
                                ? defaultImages[parseInt(event.image.replace('default_', ''), 10) - 1]
                                : event.image
                                    ? { uri: event.image }
                                    : defaultImages[0]
                                : defaultImages[0]
                        }
                        resizeMode='cover'
                        style={{ width: '100%', height: 170, borderRadius: 16 }}
                    />
                </View>
                {/* RSVP/Invite Buttons */}
                <View style={tw`flex-row px-4 mt-4 mb-2 gap-2`}>
                    <TouchableOpacity style={tw`flex-1 bg-[#7A5CFA] py-2.5 rounded-full items-center`}>
                        <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>RSVP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={tw`flex-row bg-[#23244A] py-2.5 px-6 rounded-full items-center`}>
                        <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Invite</Text>
                    </TouchableOpacity>
                </View>
                {/* Date/Time */}
                <View style={tw`px-4 mt-1 mb-2`}>
                    <Text style={[tw`text-white text-base font-bold`, { fontFamily: 'Nunito-Bold' }]}>{event?.start}</Text>
                </View>
                {/* Host and Description */}
                {/* <View style={tw`px-4 mt-1 mb-2`}>
                <View style={tw`flex-row items-center mb-1`}>
                    <Text style={[tw`text-white text-sm`, { fontFamily: 'Nunito-Bold' }]}>{event.host.label} {event.host.name}</Text>
                    <Text style={[tw`text-xs text-gray-300 ml-2`, { fontFamily: 'Nunito-Medium' }]}>RSVP to see details</Text>
                </View>
                <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-Medium' }]}>{event.description}</Text>
                <Text style={[tw`text-gray-300 text-xs mt-1`, { fontFamily: 'Nunito-Medium' }]}>{event.rsvpDeadline}</Text>
            </View> */}
                {/* What's special */}
                {/* <View style={tw`px-4 mt-2 mb-2`}>
                <Text style={[tw`text-white text-base font-bold mb-2`, { fontFamily: 'Nunito-Bold' }]}>What’s special?</Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                    {event.specials.map((s, i) => (
                        <View key={i} style={tw`${s.color} px-2 py-1 rounded-full mr-2 mb-2`}>
                            <Text style={[tw`${s.text} text-xs font-bold`, { fontFamily: 'Nunito-Bold' }]}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View> */}
                {/* Who's going */}
                {/* <View style={tw`px-4 mt-2`}>
                <View style={tw`flex-row items-center justify-between mb-1`}>
                    <Text style={[tw`text-white text-base font-bold`, { fontFamily: 'Nunito-Bold' }]}>Who’s going?</Text>
                    <TouchableOpacity>
                        <Text style={[tw`text-[#7A5CFA] text-sm`, { fontFamily: 'Nunito-Bold' }]}>View</Text>
                    </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-center mt-1`}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40 }}>
                        {event.attendees.map((a, i) => (
                            <Image
                                key={i}
                                source={a.avatar}
                                style={{ width: 36, height: 36, borderRadius: 18, marginRight: -10, borderWidth: 2, borderColor: '#181A3A' }}
                            />
                        ))}
                        <View style={tw`w-9 h-9 rounded-full bg-[#23244A] items-center justify-center ml-2`}>
                            <Text style={[tw`text-white text-xs`, { fontFamily: 'Nunito-Bold' }]}>+{event.going + event.interested - event.attendees.length}</Text>
                        </View>
                    </ScrollView>
                    <Text style={[tw`text-gray-300 text-xs ml-3`, { fontFamily: 'Nunito-Medium' }]}>{event.going} going • {event.interested} interested</Text>
                </View>
            </View> */}
            </ScrollView>
        </View>
    );
}
