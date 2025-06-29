import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Text, TouchableOpacity } from "react-native";
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
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
      <Text style={[tw`text-white text-xl pb-1`, { fontFamily: 'Nunito-ExtraBold' }]}>{textLanding[slide]}</Text>
      {slide < 2 || <Text style={tw`text-[#FFFFFF] text-[2.9] text-center`}>By tapping GET STARTED, you are agreeing to our Community Guidelines, Privacy Policy and Terms of Service</Text>}
      <TouchableOpacity onPress={() => {
        if (slide < 2) {
          setSlide(slide + 1);
        } else {
          router.replace('/(auth)/signup');
        }
      }}
        style={tw`bg-white rounded-[5] py-[10] w-full items-center`}>
        <Text style={[tw`text-black text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>{slide < 2 ? 'Next' : 'Get started'}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
