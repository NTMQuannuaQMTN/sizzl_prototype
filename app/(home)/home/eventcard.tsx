import { Text, View } from 'react-native';
import tw from 'twrnc';

export default function EventCard() {
  return (
    <View style={tw`mb-5`}>
      <View style={tw`rounded-2xl overflow-hidden bg-black/30`}>
        <View style={{ height: 160, width: '100%' }}>
          <View style={[tw`absolute left-0 right-0 top-0 bottom-0`, { zIndex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }]} />
          <View style={tw`w-full h-full`}>
            <View style={tw`absolute left-0 right-0 top-0 bottom-0`}>
              {/* Replace with <Image /> from react-native */}
              <View style={{ flex: 1, backgroundColor: "#333" }} />
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
            <Text style={tw`text-white text-lg font-bold mb-1`}>Event title</Text>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={tw`text-white/80 text-xs mr-2`}>Hosted by</Text>
              <Text style={tw`text-white/80 text-xs`}>•</Text>
              <Text style={tw`text-white/80 text-xs ml-2`}>Sun. Aug 25 • 3:00PM to 8:00PM</Text>
            </View>
            <Text style={tw`text-white/80 text-xs mb-1`}>IM East Field</Text>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={tw`text-white/80 text-xs mr-2`}>10k+ going</Text>
              <Text style={tw`text-white/80 text-xs mr-2`}>•</Text>
              <Text style={tw`text-white/80 text-xs mr-2`}>Free food</Text>
              <Text style={tw`text-white/80 text-xs`}>•</Text>
              <Text style={tw`text-white/80 text-xs ml-2`}>Cash prize</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
