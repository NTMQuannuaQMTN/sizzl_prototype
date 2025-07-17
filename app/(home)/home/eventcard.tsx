import defaultImages from '@/app/(create)/defaultimage';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import tw from 'twrnc';

export default function EventCard(props: any) {
  const [hostWC, setHostWC] = useState({
    host: '',
    count: 0,
  });

  useEffect(() => {
    const getHost = async () => {
      const { data: cohost, error: cohErr } = await supabase.from('hosts')
        .select('name').eq('event_id', props.event.id);
      if (cohErr) {
        console.log('Err get coh');
      } else {
        console.log(cohost.filter(e => e.name).map(e => e.name));
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
        <View style={{ height: 160, width: '100%' }}>
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
              <View style={tw`w-full h-full absolute top-0 left-0 bg-black bg-opacity-50`} />
            </View>
          </View>
          {/* Badges */}
          <View style={tw`absolute top-3 left-3 flex-row z-10`}>
            <View style={tw`bg-yellow-400 px-2 py-1 rounded-full mr-2`}>
              <Text style={tw`text-xs font-bold text-black`}>Cash prize</Text>
            </View>
            <View style={tw`bg-cyan-200 px-2 py-1 rounded-full`}>
              <Text style={tw`text-xs font-bold text-blue-900`}>Free food</Text>
            </View>
          </View>
          {/* Card Content */}
          <View style={tw`absolute bottom-0 left-0 right-0 p-4`}>
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
        </View>
      </View>
    </View>
  );
}
