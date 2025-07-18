import defaultImages from '@/app/(create)/defaultimage';
import { useUserStore } from '@/app/store/userStore';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import tw from 'twrnc';

import Host from '@/assets/icons/hostwhite-icon.svg';

export default function EventCard(props: any) {
  const [hostWC, setHostWC] = useState({
    host: '',
    count: 0,
  });
  const [cohosts, setCohosts] = useState<any[]>([]);
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
        } else {
          const { data: host, error: hostErr } = await supabase.from('users')
            .select('firstname').eq('id', props.event.host_id).single();
          if (hostErr) {
            console.log('Err get hos');
          } else {
            setHostWC({ host: host.firstname, count: cohost.length + 1 });
          }
        }
      }
    }

    getHost();
  }, []);

  return (
    <View style={tw`mb-5`}>
      <View style={tw`rounded-2xl overflow-hidden bg-black/30`}>
        <View style={{ height: 200, width: '100%' }}>
          <View style={[tw`absolute left-0 right-0 top-0 bottom-0`, { zIndex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }]} />
          <View style={tw`w-full h-full`}>
            <View style={tw`absolute left-0 right-0 top-0 bottom-0`}>
              <Image
                source={
                  props.event.image.startsWith('default_')
                    ? defaultImages[parseInt(props.event.image.replace('default_', ''), 10) - 1]
                    : props.event.image
                }
                resizeMode='cover'
                style={{ width: '100%', height: '100%' }}
              />
              <View style={tw`w-full h-full absolute top-0 left-0 bg-black bg-opacity-50 p-4`}>
                {/* Badges */}
                <View style={tw`flex-row z-10`}>
                  <View style={tw`bg-yellow-400 px-2 py-1 rounded-full mr-2`}>
                    <Text style={tw`text-xs font-bold text-black`}>Cash prize</Text>
                  </View>
                  <View style={tw`bg-cyan-200 px-2 py-1 rounded-full`}>
                    <Text style={tw`text-xs font-bold text-blue-900`}>Free food</Text>
                  </View>
                </View>
                {/* Card Content */}
                <View style={tw`pt-2`}>
                  <Text style={tw`text-white text-lg font-bold mb-1`}>{props.event.title}</Text>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Text style={tw`text-white/80 text-xs mr-2`}>Hosted by {hostWC.host} {hostWC.count > 1 && `+${hostWC.count - 1}`}</Text>
                    <Text style={tw`text-white/80 text-xs`}>•</Text>
                    <Text style={tw`text-white/80 text-xs ml-2`}>{props.event.start} - {props.event.end}</Text>
                  </View>
                  <Text style={tw`text-white/80 text-xs mb-1`}>{props.event.location_name}</Text>
                  <View style={tw`flex-row items-center mb-1`}>
                    <Text style={tw`text-white/80 text-xs mr-2`}>10k+ going</Text>
                  </View>
                </View>
                <View style={tw`absolute bottom-3 right-4 flex-row gap-2 items-center`}>
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
                        <Text style={tw`text-md font-bold text-white`}>
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to RSVP
                        </Text>
                      );
                    } else if (daysLeft === 0) {
                      return (
                        <Text style={tw`text-xs font-bold text-yellow-900`}>
                          RSVP closes today
                        </Text>
                      );
                    } else {
                      return null;
                    }
                  })()}
                  {user.id === props.event.host_id &&
                    <View style={tw`px-4 py-2 bg-[#0A66C2] z-99 rounded-full flex-row gap-2 items-center`}>
                      <Host></Host>
                      <Text style={[tw`text-white text-[16px]`, { fontFamily: 'Nunito-Bold' }]}>Host</Text>
                    </View>
                  }
                  {cohosts.indexOf(user.id) >= 0 &&
                    <View style={tw`px-4 py-2 bg-[#0A66C2] z-99 rounded-full flex-row gap-2 items-center`}>
                      <Host></Host>
                      <Text style={[tw`text-white text-[16px]`, { fontFamily: 'Nunito-Bold' }]}>Host</Text>
                    </View>
                  }
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
