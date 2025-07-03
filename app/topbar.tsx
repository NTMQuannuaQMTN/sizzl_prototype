import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import NotiIcon from '../assets/icons/noti_icon.svg';
import NewNoti from '../assets/icons/newnoti.svg';

export default function TopBar() {
  return (
    <View style={tw`flex-row items-start justify-between mb-2`}>
      <View>
        <Text style={tw`text-white text-2xl font-bold`}>sizzl</Text>
        <Text style={tw`text-white text-xs mt-1`}>Eyy what's good what's good!</Text>
      </View>
      <TouchableOpacity style={tw`py-2`}>
        <NotiIcon />
      </TouchableOpacity>
    </View>
  );
}
