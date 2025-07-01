import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import tw from 'twrnc';

export default function Home() {
  return (
    <LinearGradient
      colors={['#080B32', '#0E1241', '#291C56', '#392465', '#51286A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[tw`text-white text-2xl`, { fontFamily: 'Nunito-ExtraBold' }]}>hello motherfucker</Text>
      </View>
    </LinearGradient>
  );
}
