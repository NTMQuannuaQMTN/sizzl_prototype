import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { Image } from 'expo-image'; // Ensure you have expo-image installed

export default function YourEvents() {
    return (
        <View style={tw`flex-1 justify-center items-center bg-black`}>
            <Text style={tw`text-white text-2xl mb-4`}>hello ahihi</Text>
            <Image source={require('../../../assets/gifs/rickroll.gif')} style={{ width: 300, height: 200 }} resizeMode="contain" />
        </View>
    );
}
