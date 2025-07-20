import defaultImages from '@/app/(create)/defaultimage';
import { useUserStore } from '@/app/store/userStore';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import ClockWhite from '@/assets/icons/clockwhite.svg';
import Host from '@/assets/icons/hostwhite-icon.svg';
import LocationWhite from '@/assets/icons/locationicon.svg';

import DecisionModal from './eventDecision';

export default function EventCard(props: any) {
  const [hostWC, setHostWC] = useState({
    host: '',
    count: 0,
  });
  const [hostPfp, setHostPfp] = useState<string | null>(null);
  const [cohosts, setCohosts] = useState<any[]>([]);
  const [spec, setSpec] = useState<string[][]>([]);
  const [decision, setDecision] = useState<string>('');
  const [selection, setSelection] = useState(false);

  const specCol = {
    '💸 Cash prize': 'bg-yellow-200',
    '🍕 Free food': 'bg-sky-200',
    '👕 Free merch': 'bg-pink-200/90',
    '🎟️ Cool prizes': 'bg-green-200/90'
  }
  const { user } = useUserStore();

  useEffect(() => {
    const getHost = async () => {
      const { data: cohost, error: cohErr } = await supabase.from('hosts')
        .select('user_id, name').eq('event_id', props.event.id);
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
            .select('firstname, profile_image').eq('id', props.event.host_id).single();
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
  }, []);

  useEffect(() => {
    const getDecision = async () => {
      const { data, error } = await supabase.from('guests')
        .select('decision').eq('event_id', props.event.id)
        .eq('user_id', user.id).single()

      if (error) {
        setDecision('Not RSVP');
        return;
      }

      setDecision(data.decision);
    }
    getDecision();
  }, []);

  const handleDecision = async (dec: string) => {
    if (dec === 'Clear') {
      setDecision('Not RSVP');
      // Optionally, you can also remove the RSVP from the database:
      try {
        await supabase.from('guests')
          .delete()
          .eq('event_id', props.event.id)
          .eq('user_id', user.id);
      } catch (e) {
        // ignore
      }
      return;
    }
    setDecision(dec);
    if (decision !== 'Not RSVP') {
      const {error} = await supabase.from('guests')
      .update({'decision': dec}).eq('event_id', props.event.id)
      .eq('user_id', user.id);

      if (error) {
        console.log('Update error');
        return;
      }
    } else {
      const {error} = await supabase.from('guests')
      .insert([{'decision': dec, 'event_id': props.event.id,
        'user_id': user.id}]);

      if (error) {
        console.log('Add error');
        return;
      } else {
        console.log('okay');
      }
    }
  }

  useEffect(() => {
    const getSpecial = () => {
      let specs = [
        ['💸 Cash prize', props.event.cash_prize],
        ['🍕 Free food', props.event.free_food],
        ['👕 Free merch', props.event.free_merch],
        ['🎟️ Cool prizes', props.event.cool_prize],
      ].filter(e => e[1] != null);
      setSpec(specs);
    }
    getSpecial();
  }, []);

  return (
    <View style={tw`mb-5`}> 
      <View style={[tw`rounded-2xl overflow-hidden w-full items-center justify-center`, { aspectRatio: 410 / 279 }]}> 
        <View style={{ width: '100%', height: '100%' }}>
          <View style={[tw`absolute left-0 right-0 top-0 bottom-0`, { zIndex: 1 }]} />
          <View style={tw`w-full h-full`}>
            <View style={tw`absolute left-0 right-0 top-0 bottom-0`}>
              <Image
                source={
                  props.event.image.startsWith('default_')
                    ? defaultImages[parseInt(props.event.image.replace('default_', ''), 10) - 1]
                    : { uri: props.event.image }
                }
                resizeMode='cover'
                style={{ width: '100%', height: '100%' }}
              />
              <View style={tw`w-full h-full absolute top-0 left-0 bg-black bg-opacity-70 px-4 pb-4 pt-2`}>
                {/* Badges */}
                {spec.length !== 0 && <View style={tw`flex-row z-10 pt-2 pb-0.5`}>
                  {spec.slice(0, 2).map((s, ind) => {
                    // s[0] is a string, but specCol only allows certain keys
                    // So we need to assert s[0] is a valid key of specCol
                    const key = s[0] as keyof typeof specCol;
                    return (
                      <View key={ind} style={tw`${specCol[key]} px-2 py-1 rounded-full mr-1.5`}>
                        <Text style={[tw`text-xs text-black`, { fontFamily: 'Nunito-ExtraBold' }]}>{s[0]}</Text>
                      </View>
                    );
                  })}
                  {spec.length > 2 && (
                    <View style={tw`justify-center rounded-full bg-gray-600/60 px-1.5`}>
                      <Text style={[tw`text-[10px] text-white`, { fontFamily: 'Nunito-Bold' }]}>+{spec.length - 2}</Text>
                    </View>
                  )}
                </View>}
                {/* Card Content */}
                <View style={tw`pt-1.5`}>
                  <Text style={[tw`text-white text-[22px] mb-1.5`, { fontFamily: 'Nunito-ExtraBold' }]}>{props.event.title}</Text>
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
                      style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 6}}
                    /> : null}
                    {hostWC.count > 1 && (
                      <Text style={[tw`text-white text-[10px] ml-1.5`, { fontFamily: 'Nunito-Medium' }]}>+{hostWC.count - 1}</Text>
                    )}
                  </View>
                  <View style={tw`flex-row items-center mb-2`}>
                    {/* Clock icon instead of dot */}
                    <ClockWhite width={12} height={12} style={tw`mr-1`} />
                    <Text style={[tw`text-white text-[14px] ml-1`, { fontFamily: 'Nunito-Bold' }]}>
                      {(() => {
                        // Helper to format date and time
                        const formatDate = (dateStr: string) => {
                          const date = new Date(dateStr);
                          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          const day = days[date.getDay()];
                          const month = months[date.getMonth()];
                          const dateNum = date.getDate();
                          let hours = date.getHours();
                          const minutes = date.getMinutes();
                          const ampm = hours >= 12 ? 'pm' : 'am';
                          hours = hours % 12;
                          if (hours === 0) hours = 12;
                          const minStr = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
                          return `${day}, ${month} ${dateNum}, ${hours}${minStr}${ampm}`;
                        };
                        const start = props.event.start;
                        const end = props.event.end;
                        if (!start) return '';
                        if (!end || start === end) {
                          // Only start time
                          return formatDate(start);
                        }
                        const startDate = new Date(start);
                        const endDate = new Date(end);
                        if (
                          startDate.getFullYear() === endDate.getFullYear() &&
                          startDate.getMonth() === endDate.getMonth() &&
                          startDate.getDate() === endDate.getDate()
                        ) {
                          // Same day: Sat, Jul 18, 3pm - 5pm
                          // Show start as full, end as time only
                          let endHours = endDate.getHours();
                          const endMinutes = endDate.getMinutes();
                          const endAmpm = endHours >= 12 ? 'pm' : 'am';
                          endHours = endHours % 12;
                          if (endHours === 0) endHours = 12;
                          const endMinStr = endMinutes === 0 ? '' : `:${endMinutes.toString().padStart(2, '0')}`;
                          return `${formatDate(start)} - ${endHours}${endMinStr}${endAmpm}`;
                        } else {
                          // Different days: Sat, Jul 18, 3pm - Sun, Jul 19, 2:30am
                          return `${formatDate(start)} - ${formatDate(end)}`;
                        }
                      })()}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center mb-1.5 pr-4`}>
                    <LocationWhite width={14} height={14} style={tw`-ml-0.25 mr-1.7`} />
                    <Text
                      style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-Bold' }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {props.event.host_id !== user.id && cohosts.indexOf(user.id) < 0 && props.event.rsvpfirst && decision === 'Not RSVP' ? 'You must RSVP first' : props.event.location_name}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Text style={tw`text-white/80 text-xs mr-2`}>10k+ going</Text>
                  </View>
                </View>
                <View style={tw`absolute bottom-3 right-4 flex-row gap-2.5 items-center`}>
                  {props.event.rsvp_deadline && (() => {
                    const deadline = new Date(props.event.rsvp_deadline);
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
                        <Text style={[tw`text-[12px] text-gray-400`, { fontFamily: 'Nunito-Medium' }]}>
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to RSVP
                        </Text>
                      );
                    } else if (daysLeft === 0) {
                      return (
                        <Text style={[tw`text-[12px] text-rose-500`, { fontFamily: 'Nunito-Bold' }]}>
                          RSVP closes today
                        </Text>
                      );
                    } else {
                      return null;
                    }
                  })()}
                  {user.id === props.event.host_id ?
                    <View style={tw`px-3 py-1.5 gap-1.5 bg-[#0A66C2] z-99 rounded-full flex-row items-center`}>
                      <Host></Host>
                      <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Host</Text>
                    </View>
                  : cohosts.indexOf(user.id) >= 0 ?
                    <View style={tw`px-3 py-1.5 gap-1.5 bg-[#0A66C2] z-99 rounded-full flex-row items-center`}>
                      <Host></Host>
                      <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cohost</Text>
                    </View>
                  : decision === 'Not RSVP' ?
                    <TouchableOpacity style={tw`px-3 py-1.5 bg-[#7A5CFA] z-99 rounded-full flex-row items-center`}
                      onPress={() => setSelection(true)}>
                      <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>RSVP</Text>
                    </TouchableOpacity>
                  : decision === 'Going' ?
                    <TouchableOpacity style={tw`px-3 py-1.5 bg-green-500 z-99 rounded-full flex-row items-center`}
                      onPress={() => setSelection(true)}>
                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I’m going </Text>
                        <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>🥳</Text>
                    </TouchableOpacity>
                  : decision === 'Maybe' ?
                    <TouchableOpacity style={tw`px-3 py-1.5 bg-yellow-600 z-99 rounded-full flex-row items-center`}
                      onPress={() => setSelection(true)}>
                      <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Eh...maybe </Text>
                      <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>🤔</Text>
                    </TouchableOpacity>
                  : <TouchableOpacity style={tw`px-3 py-1.5 bg-rose-600 z-99 rounded-full flex-row items-center`}
                      onPress={() => setSelection(true)}>
                      <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I can't </Text>
                      <Text style={[tw`text-white text-[14px] -mt-0.5`, { fontFamily: 'Nunito-ExtraBold' }]}>😭</Text>
                    </TouchableOpacity>
                  }
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      <DecisionModal
        visible={selection}
        onClose={() => setSelection(false)}
        eventTitle={props.event.title}
        maybe={props.event.maybe}
        onSelect={(dec) => {
          handleDecision(dec);
          setSelection(false);
        }} />
    </View>
  );
}
