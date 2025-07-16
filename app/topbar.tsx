import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import FriendsIcon from '../assets/icons/friends-icon.svg';
import NotiIcon from '../assets/icons/noti_icon.svg';

export default function TopBar() {
  return (
    <View style={tw`flex-row items-start justify-between mb-2`}>
      <View>
        <Text style={tw`text-white text-2xl font-bold`}>sizzl</Text>
        <Text style={tw`text-white text-xs mt-1`}>Eyy what's good what's good!</Text>
      </View>
      <View style={tw`flex-row items-center`}>
        <TouchableOpacity style={tw`py-2 mr-4.5 -mt-0.5`}>
          <FriendsIcon width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity style={tw`py-2`}>
          <NotiIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
