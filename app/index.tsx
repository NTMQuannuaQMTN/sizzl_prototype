import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import tw from 'twrnc';

export default function Index() {
  const textLanding = ['get started 1', 'get started 2', 'get started 3'];
  const [slide, setSlide] = useState(0);
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1, padding: 20 }}
    >
      {/* Center content - takes up most of the screen */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text 
          style={[tw`text-white text-xl`, 
          { fontFamily: 'Nunito-ExtraBold' }]}>{textLanding[slide]}
        </Text>
      </View>
      
      {/* Bottom button - fixed at bottom */}
      {slide < 2 || 
        <Text 
          style={[tw`text-white text-[10px] text-center mb-4`,
          { fontFamily: 'Nunito-Regular' }]}>
            By tapping GET STARTED, you are agreeing to our {'\n'}
            <Text style={{ fontFamily: 'Nunito-Bold' }}>Community Guidelines</Text>, <Text style={{ fontFamily: 'Nunito-Bold' }}>Privacy Policy</Text> and <Text style={{ fontFamily: 'Nunito-Bold' }}>Terms of Service</Text>
        </Text>}
      <TouchableOpacity onPress={() => {
        if (slide < 2) {
          setSlide(slide + 1);
        } else {
          router.replace('/(auth)/signup');
        }
        
      }}
        style={tw`bg-white rounded-[5] py-[10] w-full items-center mb-8`}>
        <Text 
          style={[tw`text-black text-[15px]`, 
          { fontFamily: 'Nunito-ExtraBold' }]}>{slide < 2 ? 'Next' : 'Get started'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
