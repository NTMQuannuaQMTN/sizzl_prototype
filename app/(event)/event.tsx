import { supabase } from '@/utils/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, ScrollView, Text, TouchableOpacity, useAnimatedValue, View } from 'react-native';
import tw from 'twrnc';

import Host from '@/assets/icons/hostwhite-icon.svg';
import defaultImages from '../(create)/defaultimage';
import DecisionModal from '../(home)/home/eventDecision';
import Back from '../../assets/icons/back.svg';
import Deadline from '../../assets/icons/hourglasswhite-icon.svg';
import Invite from '../../assets/icons/invite-icon.svg';
import Location from '../../assets/icons/locationwhite-icon.svg';
import Private from '../../assets/icons/private.svg';
import Public from '../../assets/icons/public.svg';
import ThreeDots from '../../assets/icons/threedots.svg';

import { Ionicons } from '@expo/vector-icons';
import SpecModal from '../(home)/home/specModal';
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
    const [cohosts, setCohosts] = useState<any[]>([]);
    const { user } = useUserStore();
    const [viewLocation, setViewLocation] = useState(0);
    const viewLocationAnimation = useAnimatedValue(0);
    const [spec, setSpec] = useState<any[][]>([]);
    const [specView, setSpecView] = useState<number[]>([0, 0, 0, 0]);

    const cashSpecAnimation = useAnimatedValue(0);
    const foodSpecAnimation = useAnimatedValue(0);
    const merchSpecAnimation = useAnimatedValue(0);
    const coolSpecAnimation = useAnimatedValue(0);

    useEffect(() => {
        cashSpecAnimation.setValue(1 - specView[0]);
        Animated.timing(cashSpecAnimation, {
            toValue: specView[0],
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [specView[0]])

    useEffect(() => {
        cashSpecAnimation.setValue(1 - specView[0]);
        Animated.timing(cashSpecAnimation, {
            toValue: specView[0],
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [specView[0]])

    useEffect(() => {
        foodSpecAnimation.setValue(1 - specView[1]);
        Animated.timing(foodSpecAnimation, {
            toValue: specView[1],
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [specView[1]])

    useEffect(() => {
        merchSpecAnimation.setValue(1 - specView[2]);
        Animated.timing(merchSpecAnimation, {
            toValue: specView[2],
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [specView[2]])

    useEffect(() => {
        coolSpecAnimation.setValue(1 - specView[3]);
        Animated.timing(coolSpecAnimation, {
            toValue: specView[3],
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [specView[3]])

    const specCol = {
        '💸 Cash prize': 'bg-yellow-200',
        '🍕 Free food': 'bg-sky-200',
        '👕 Free merch': 'bg-pink-200/90',
        '🎟️ Cool prizes': 'bg-green-200/90'
    }

    useEffect(() => {
        viewLocationAnimation.setValue(1 - viewLocation);
        Animated.timing(viewLocationAnimation, {
            toValue: viewLocation,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [viewLocation]);

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
        const getSpecial = () => {
            let specs = [
                ['💸 Cash prize', event?.cash_prize],
                ['🍕 Free food', event?.free_food],
                ['👕 Free merch', event?.free_merch],
                ['🎟️ Cool prizes', event?.cool_prize],
            ].map(e => [e[0], e[1]]);
            setSpec(specs);
        }
        getSpecial();
    }, [event]);

    useEffect(() => {
        if (!event) return;
        const getHost = async () => {
            const { data: cohost, error: cohErr } = await supabase.from('hosts')
                .select('user_id, name').eq('event_id', id);
            if (cohErr) {
                console.log('Err get coh', id);
            } else {
                const cohostID = [event.host_id, ...cohost.filter(e => e.user_id && e.user_id !== event.host_id).map(e => e.user_id)];
                const cohostName = cohost.filter(e => e.name).map(e => e.name);

                if (cohostName.length > 0) {
                    setHostWC({ host: cohostName[0], count: cohost.length + 1 });
                } else {
                    setHostWC({ host: '', count: cohost.length + 1 });
                }

                // For each element in cohostID, get the user and add to cohosts
                let users: any[] = [];
                for (const uid of cohostID) {
                    const { data: userData, error: userErr } = await supabase
                        .from('users')
                        .select('id, firstname, profile_image')
                        .eq('id', uid)
                        .single();
                    if (!userErr && userData) {
                        users.push(userData);
                    }
                }
                setCohosts(users);
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
                .update({ 'decision': d, 'created_at': new Date().toISOString() }).eq('event_id', event?.id)
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

    const viewLocationRotate = viewLocationAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '11.25deg', '45deg', '78.75deg', '90deg'],
        extrapolate: 'clamp',
    });

    const coolRotate = coolSpecAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '-11.25deg', '-45deg', '-78.75deg', '-90deg'],
        extrapolate: 'clamp',
    });

    const cashRotate = cashSpecAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '-11.25deg', '-45deg', '-78.75deg', '-90deg'],
        extrapolate: 'clamp',
    });

    const foodRotate = foodSpecAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '-11.25deg', '-45deg', '-78.75deg', '-90deg'],
        extrapolate: 'clamp',
    });

    const merchRotate = merchSpecAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '-11.25deg', '-45deg', '-78.75deg', '-90deg'],
        extrapolate: 'clamp',
    });

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
                            onPress={() => router.replace({ pathname: '/(create)/create', params: { id: event?.id } })}>
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
                                    : <TouchableOpacity style={tw`bg-rose-600 flex-1 flex-row py-2.5 rounded-full items-center justify-center gap-1.5`}
                                        onPress={() => setShowDecisionModal(true)}>
                                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I can't </Text>
                                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>😭</Text>
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
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={tw`flex-row items-center mb-1.5 gap-1.5`}
                    >
                        {cohosts.map((cohost, idx) => {
                            return (
                                <TouchableOpacity key={idx} style={tw`flex-row items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-2 rounded-xl`}
                                    onPress={() => router.push({ pathname: '/(profile)/profile', params: { user_id: cohost.id } })}>
                                    <View style={[tw`rounded-full border border-white/20 items-center justify-center bg-white/10`, { width: 30, height: 30, overflow: 'hidden' }]}>
                                        <Image
                                            source={cohost.profile_image ? { uri: cohost.profile_image } : require('../../assets/icons/pfpdefault.svg')}
                                            style={{ width: 30, height: 30, borderRadius: 60 }}
                                            resizeMode="cover"
                                            defaultSource={require('../../assets/icons/pfpdefault.svg')}
                                        />
                                    </View>
                                    <Text style={[tw`text-white`, { fontFamily: 'Nunito-Bold' }]}>{cohost.firstname}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    <View style={tw`flex-row mb-1.5 items-center gap-2`}>
                        <Location width={12} height={12} style={tw``} />
                        {event?.rsvpfirst && curStatus === 'Not RSVP' ?
                            <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>RSVP to see details</Text>
                            : <TouchableOpacity style={tw`flex-row items-center justify-center`} onPress={() => setViewLocation(1 - viewLocation)}>
                                <Text style={[tw`text-white text-[15px] max-w-72`, { fontFamily: 'Nunito-Bold' }]}>{event?.location_name}</Text>
                                {(event?.location_add !== event?.location_name || event?.location_more || event?.location_note) && <Animated.View style={{ transform: [{ rotate: viewLocationRotate }] }}>
                                    <Ionicons name="chevron-forward" size={16} color="#fff" style={tw`ml-1 mt-0.5`} />
                                </Animated.View>}
                            </TouchableOpacity>}
                    </View>
                    {viewLocation === 1 && <Animated.View style={[tw`h-fit w-fit overflow-hidden`]}>
                        <View style={[tw`w-80 px-4 gap-1 py-2 bg-white rounded-md`]}>
                            {event?.location_add && event?.location_add !== event?.location_name && <Text style={[tw`text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>Address: {event.location_add}</Text>}
                            {event?.location_more && <Text style={[tw`text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>Address: {event.location_more}</Text>}
                            {event?.location_note && <Text style={[tw`text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>Note: {event.location_note}</Text>}
                        </View>
                    </Animated.View>}
                    <View style={tw`flex-row mb-1.5 items-center gap-2`}>
                        {event?.bio && <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>{event.bio}</Text>}
                    </View>
                    {event?.rsvp_deadline && <View style={tw`flex-row mb-1.5 items-center gap-2`}>
                        <Deadline width={12} height={12}></Deadline>
                        {event?.rsvp_deadline && (() => {
                            const deadline = new Date(event.rsvp_deadline);
                            const now = new Date();
                            // Zero out the time for both dates to count full days
                            deadline.setHours(0, 0, 0, 0);
                            now.setHours(0, 0, 0, 0);
                            const msPerDay = 1000 * 60 * 60 * 24;
                            const daysLeft = Math.ceil(
                                (deadline.getTime() - now.getTime()) / msPerDay
                            );
                            if (daysLeft > 0) {
                                return (
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>
                                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to RSVP
                                    </Text>
                                );
                            } else if (daysLeft === 0) {
                                return (
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>
                                        RSVP closes today
                                    </Text>
                                );
                            } else {
                                return (
                                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-Bold' }]}>
                                        RSVP has closed :(
                                    </Text>
                                );
                            }
                        })()}
                    </View>}
                    {spec.length !== 0 && <Text style={[tw`text-[18px] text-white mb-1.5`, { fontFamily: 'Nunito-Bold' }]}>What's special?</Text>}
                    {spec.length !== 0 && <View style={tw`flex-row mb-1.5 items-center gap-2`}>
                        {spec.map((s, ind) => {
                            if (s[1] == null) return;
                            // s[0] is a string, but specCol only allows certain keys
                            // So we need to assert s[0] is a valid key of specCol
                            const key = s[0] as keyof typeof specCol;
                            return (
                                <TouchableOpacity
                                    key={ind}
                                    style={tw`${specCol[key]} flex-row gap-1 px-2 py-1 rounded-full mr-1.5`}
                                    onPress={() => {
                                        setSpecView(prev => {
                                            const newArr = [...prev];
                                            newArr[ind] = prev[ind] === 1 ? 0 : 1;
                                            console.log(newArr);
                                            return newArr;
                                        });
                                    }}
                                >
                                    <Text style={[tw`text-xs text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>{s[0]}</Text>
                                    {s[1] !== '' &&
                                        <Animated.View
                                            style={{
                                                transform: [
                                                    {
                                                        rotate:
                                                            s[0] === '💸 Cash prize'
                                                                ? cashRotate
                                                                : s[0] === '🍕 Free food'
                                                                    ? foodRotate
                                                                    : s[0] === '👕 Free merch'
                                                                        ? merchRotate
                                                                        : coolRotate
                                                    }
                                                ]
                                            }}>
                                            <Ionicons
                                                name="chevron-down"
                                                size={16}
                                                color="#000"
                                            />
                                        </Animated.View>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>}
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
                <SpecModal
                    visible={specView.indexOf(1) >= 0}
                    color={specView.indexOf(1) >= 0 ? Object.values(specCol)[specView.indexOf(1)] : '#000000'}
                    title={specView.indexOf(1) >= 0 ? spec[specView.indexOf(1)][0] : ''}
                    spec={specView.indexOf(1) >= 0 ? spec[specView.indexOf(1)][1] : ''}
                    onClose={() => setSpecView([0, 0, 0, 0])}
                />
            </ScrollView>
        </View>
    );
}
