import { supabase } from '@/utils/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import Host from '@/assets/icons/hostwhite-icon.svg';
import defaultImages from '../(create)/defaultimage';
import DecisionModal from '../(home)/home/eventDecision';
import Back from '../../assets/icons/back.svg';
import Invite from '../../assets/icons/invite-icon.svg';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import ThreeDots from '../../assets/icons/threedots.svg';

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
    const { id, status } = useLocalSearchParams();
    const [event, setEvent] = useState<EventView | null>(null);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [curStatus, setStatus] = useState(status);
    const [hostWC, setHostWC] = useState({
        host: '',
        count: 0,
    });
    const [hostPfp, setHostPfp] = useState<string | null>(null);
    const [cohosts, setCohosts] = useState<any[]>([]);
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

        getEventDetail();
    }, [id]);

    useEffect(() => {
        const getHost = async () => {
            const { data: cohost, error: cohErr } = await supabase.from('hosts')
                .select('user_id, name').eq('event_id', event?.id);
            if (cohErr) {
                console.log('Err get coh');
            } else {
                setCohosts(cohost.filter(e => e.user_id).map(e => e.user_id));
                if (cohost.filter(e => e.name).map(e => e.name).length !== 0) {
                    setHostWC({ host: cohost.filter(e => e.name).map(e => e.name)[0], count: cohost.length + 1 })
                    // fetch pfp for cohost
                    const { data: hostUser, error: hostUserErr } = await supabase.from('users')
                        .select('profile_image').eq('id', cohost[0].user_id).single();
                    if (!hostUserErr && hostUser && hostUser.profile_image) {
                        setHostPfp(hostUser.profile_image);
                    } else {
                        setHostPfp(null);
                    }
                } else {
                    const { data: host, error: hostErr } = await supabase.from('users')
                        .select('firstname, profile_image').eq('id', event?.host_id).single();
                    if (hostErr) {
                        console.log('Err get hos');
                    } else {
                        setHostWC({ host: host.firstname, count: cohost.length + 1 });
                        setHostPfp(host.profile_image || null);
                    }
                }
            }
        }

        getHost();
    }, [event]);

    const handleDecisionSelect = async (d: string) => {
        if (d === 'Not RSVP') {
            setStatus('Not RSVP');
            // Optionally, you can also remove the RSVP from the database:
            const { error } = await supabase.from('guests')
                .delete()
                .eq('event_id', event?.id)
                .eq('user_id', user.id);
            if (error) { console.log('Error not rsvp'); return; }
        }
        setStatus(d);
        if (curStatus !== 'Not RSVP') {
            const { error } = await supabase.from('guests')
                .update({ 'decision': d }).eq('event_id', event?.id)
                .eq('user_id', user.id);

            if (error) {
                console.log('Update error');
                return;
            }
        } else {
            const { error } = await supabase.from('guests')
                .insert([{
                    'decision': d, 'event_id': event?.id,
                    'user_id': user.id
                }]);

            if (error) {
                console.log('Add error');
                return;
            } else {
                console.log('okay');
            }
        }
        setShowDecisionModal(false);
    }

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
                <View style={tw`px-4 pt-3 pb-1`}>
                    {/* Top bar with back and threedots icons */}
                    <View style={tw`flex-row items-center justify-between mb-1.5`}>
                        <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
                            <Back width={24} height={24} />
                        </TouchableOpacity>
                        <View style={tw`flex-1`} />
                        <TouchableOpacity onPress={() => {/* TODO: add menu logic */ }} style={tw`p-1`}>
                            <ThreeDots width={22} height={22} />
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={[tw`text-white text-[24px] w-full leading-[1.25]`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}
                        numberOfLines={2}
                        allowFontScaling={true}
                        ellipsizeMode="tail"
                    >
                        {event?.title}
                    </Text>
                    <View style={tw`flex-row items-center my-2`}>
                        {event?.public ? <View style={tw`flex-row items-center gap-2 justify-center bg-[#064B55] border border-white/10 rounded-full px-2 py-0.5`}>
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
                <View style={tw`px-4`}>
                    <View style={[tw`rounded-xl overflow-hidden w-full items-center justify-center relative`, { aspectRatio: 410 / 279 }]}>
                        <Image
                            source={
                                event ? typeof event.image === 'string' && event.image.startsWith('default_')
                                    ? defaultImages[parseInt(event.image.replace('default_', ''), 10) - 1]
                                    : event.image
                                        ? { uri: event.image }
                                        : defaultImages[0]
                                    : defaultImages[0]
                            }
                            style={{ width: '100%', height: '100%' }}
                            resizeMode={
                                event && typeof event.image === 'string' && event.image.startsWith('default_')
                                    ? 'contain'
                                    : 'cover'
                            }
                        />
                    </View>
                </View>
                {/* RSVP/Invite Buttons */}
                <View style={tw`flex-row px-4 mt-3.5 mb-2 gap-2`}>
                    {curStatus === 'Host' || curStatus === 'Cohost' ?
                        <TouchableOpacity style={tw`bg-[#CAE6DF] flex-1 flex-row py-2.5 rounded-full items-center justify-center gap-1.5`}
                            onPress={() => router.push({ pathname: '/(create)/create', params: { id: event?.id } })}>
                            <Text style={[tw`text-black text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Edit event</Text>
                        </TouchableOpacity>
                        : curStatus === 'Not RSVP' ?
                            <TouchableOpacity style={tw`bg-[#7A5CFA] flex-1 flex-row py-2.5 rounded-full items-center justify-center gap-1.5`}
                                onPress={() => setShowDecisionModal(true)}>
                                <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>RSVP</Text>
                            </TouchableOpacity>
                            : curStatus === 'Going' ?
                                <TouchableOpacity style={tw`bg-green-500 flex-1 flex-row py-2.5 rounded-full items-center justify-center gap-1.5`}
                                    onPress={() => setShowDecisionModal(true)}>
                                    <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I’m going </Text>
                                    <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>🥳</Text>
                                </TouchableOpacity>
                                : curStatus === 'Maybe' ?
                                    <TouchableOpacity style={tw`bg-yellow-600 flex-1 flex-row py-2.5 rounded-full items-center justify-center gap-1.5`}
                                        onPress={() => setShowDecisionModal(true)}>
                                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Eh...maybe </Text>
                                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>🤔</Text>
                                    </TouchableOpacity>
                                    : <TouchableOpacity style={tw`bg-rose-600 flex-1 py-2.5 rounded-full items-center`}
                                        onPress={() => setShowDecisionModal(true)}>
                                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I can't </Text>
                                        <Text style={[tw`text-white text-[14px] -mt-0.5`, { fontFamily: 'Nunito-ExtraBold' }]}>😭</Text>
                                    </TouchableOpacity>
                    }
                    <TouchableOpacity style={tw`flex-row bg-[#23244A] gap-x-2 py-2.5 px-6 rounded-full items-center`}>
                        <Invite width={18} height={18} />
                        <Text style={[tw`text-white text-[16px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Invite</Text>
                    </TouchableOpacity>
                </View>
                {/* Date/Time */}
                <View style={tw`px-4 mt-1 mb-2`}>
                    {/* Date/Time breakdown */}
                    {(() => {
                        if (!event?.start) return null;
                        const startDate = event.start ? new Date(event.start) : null;
                        const endDate = event.end ? new Date(event.end) : null;
                        const formatDate = (date: Date) => {
                            return date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            });
                        };
                        const formatTime = (date: Date) => {
                            let h = date.getHours();
                            let m = date.getMinutes();
                            let ampm = h >= 12 ? 'PM' : 'AM';
                            h = h % 12;
                            if (h === 0) h = 12;
                            return `${h}:${m.toString().padStart(2, '0')}${ampm}`;
                        };
                        if (!startDate) return null;
                        if (!endDate || startDate.toDateString() === endDate.toDateString()) {
                            // Only start, or start/end on same day
                            return (
                                <View>
                                    <Text style={[tw`text-white text-[22px] `, { fontFamily: 'Nunito-ExtraBold', textAlign: 'left' }]}>
                                        {formatDate(startDate)}
                                    </Text>
                                    <Text style={[tw`text-white text-[15px] `, { fontFamily: 'Nunito-Medium', textAlign: 'left' }]}>
                                        {formatTime(startDate)}
                                        {endDate ? ` - ${formatTime(endDate)}` : ''}
                                    </Text>
                                </View>
                            );
                        } else {
                            // Start/end on different days
                            return (
                                <View>
                                    <Text style={[tw`text-white text-[22px] `, { fontFamily: 'Nunito-ExtraBold', textAlign: 'left' }]}>
                                        {formatDate(startDate)}, {formatTime(startDate)}
                                    </Text>
                                    <Text style={[tw`text-white text-[15px] `, { fontFamily: 'Nunito-Medium', textAlign: 'left' }]}>
                                        to {formatDate(endDate)}, {formatTime(endDate)}
                                    </Text>
                                </View>
                            );
                        }
                    })()}
                </View>
                {/* Host and Description */}
                <View style={tw`px-4 mt-1 mb-2`}>
                    <View style={tw`flex-row items-center mb-1.5`}>
                        <Host width={12} height={12} style={tw`mr-2`} />
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>Hosted by </Text>
                        <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>{hostWC.host}</Text>
                        {/* Host profile image */}
                        {hostPfp ? <Image
                            source={
                                hostPfp
                                    ? { uri: hostPfp }
                                    : require('@/assets/images/pfp-default2.png')
                            }
                            style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 6 }}
                        /> : null}
                        {hostWC.count > 1 && (
                            <Text style={[tw`text-white text-[10px] ml-1.5`, { fontFamily: 'Nunito-Medium' }]}>+{hostWC.count - 1}</Text>
                        )}
                    </View>
                    {event?.bio && (
                        <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-Medium' }]}>{event.bio}</Text>
                    )}
                    {event?.rsvp_deadline && (
                        <Text style={[tw`text-gray-300 text-xs mt-1`, { fontFamily: 'Nunito-Medium' }]}>{event.rsvp_deadline}</Text>
                    )}
                </View>
                {/* What's special */}
                {/* <View style={tw`px-4 mt-2 mb-2`}>
                <Text style={[tw`text-white text-base  mb-2`, { fontFamily: 'Nunito-Bold' }]}>What’s special?</Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                    {event.specials.map((s, i) => (
                        <View key={i} style={tw`${s.color} px-2 py-1 rounded-full mr-2 mb-2`}>
                            <Text style={[tw`${s.text} text-xs `, { fontFamily: 'Nunito-Bold' }]}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View> */}
                {/* Who's going */}
                {/* <View style={tw`px-4 mt-2`}>
                <View style={tw`flex-row items-center justify-between mb-1`}>
                    <Text style={[tw`text-white text-base `, { fontFamily: 'Nunito-Bold' }]}>Who’s going?</Text>
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
                {/* Decision Modal */}
                <DecisionModal
                    visible={showDecisionModal}
                    onClose={() => setShowDecisionModal(false)}
                    eventTitle={event?.title || ''}
                    maybe={!!event?.maybe}
                    onSelect={(dec) => { handleDecisionSelect(dec); }}
                />
            </ScrollView>
        </View>
    );
}
