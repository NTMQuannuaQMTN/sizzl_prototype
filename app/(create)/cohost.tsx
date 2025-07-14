import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

import Host from '../../assets/icons/host.svg';

interface Friend {
  id: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  profile_image?: string;
}

type Cohost = Friend | string;

interface CohostModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  cohosts: Cohost[];
  onSave: (cohosts: Cohost[]) => void;
}

export default function CohostModal({ visible, onClose, friends, cohosts, onSave }: CohostModalProps) {
  const [localCohosts, setLocalCohosts] = useState<Cohost[]>(cohosts || []);
  const [input, setInput] = useState('');

  // Animation logic (slide up/down)
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) setLocalCohosts(cohosts || []);
  }, [visible, cohosts]);

  const handleAddCohost = (friend: Friend) => {
    if (!localCohosts.some(c => typeof c !== 'string' && c.id === friend.id)) {
      setLocalCohosts([...localCohosts, friend]);
    }
  };

  const handleCancel = () => {
    setLocalCohosts(cohosts || []);
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Tap outside to close */}
        <TouchableOpacity
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            { backgroundColor: '#080B32', marginBottom: 0, paddingHorizontal: 0, paddingBottom: 0 },
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 400],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[tw`text-white text-[15px] mb-4`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Manage hosts</Text>

          {/* Cohost input */}
            <View style={tw`mb-3 mx-3 bg-white/10 rounded-xl px-3 py-2`}>
            <View style={tw`flex-row justify-start items-center gap-2`}>
              <Host style={tw`-mt-0.5`} width={12} height={12} />
              <TextInput style={[tw`text-white text-[13px] w-full`, { fontFamily: 'Nunito-Medium' }]} 
                placeholder='Cohosts (club, organization, person, etc.)'
                placeholderTextColor={'#9CA3AF'}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={e => {
                  if (input != '') {
                    setLocalCohosts([...localCohosts, input])
                  }
                  setInput('');
                }}
              />
            </View>
            {localCohosts.length > 0 ? (
              <View style={tw`mb-2 flex-row flex-wrap gap-1.5`}>
                {localCohosts.map((cohost, idx) => {
                  if (typeof cohost === 'string') {
                    return (
                      <View key={`cohost-string-${idx}`} style={tw`flex-row items-center bg-yellow-600 rounded-full px-3 py-2 gap-2`}>
                        <TouchableOpacity onPress={() => setLocalCohosts(localCohosts.filter(c => !(typeof c === 'string' && c === cohost)))}>
                            {/* Use Ionicons close icon */}
                            <Text style={[tw`text-white`, {fontFamily: 'Nunito-Bold'}]}>
                            <Ionicons name="close" size={14} color="#fff" />
                            </Text>
                        </TouchableOpacity>
                        <Text style={[tw`text-white`, {fontFamily: 'Nunito-Bold'}]}>{cohost}</Text>
                      </View>
                    );
                  } else if (cohost && typeof cohost === 'object') {
                    return (
                      <View key={cohost.id} style={tw`flex-row items-center bg-yellow-600 rounded-full px-3 py-2 gap-2`}>
                        <TouchableOpacity onPress={() => setLocalCohosts(localCohosts.filter(c => !(typeof c === 'object' && c.id === cohost.id)))}>
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                        <Image
                          source={cohost.profile_image ? { uri: cohost.profile_image } : require('../../assets/icons/pfpdefault.svg')}
                          style={{ width: 24, height: 24, borderRadius: 12 }}
                          resizeMode="cover"
                          defaultSource={require('../../assets/icons/pfpdefault.svg')}
                        />
                        <Text style={[tw`text-white`, {fontFamily: 'Nunito-Bold'}]}>{cohost.firstname}</Text>
                      </View>
                    );
                  } else {
                    return null;
                  }
                })}
              </View>
            ) : null}
          </View>
          {/* Friends list */}
          <Text style={[tw`mx-3 text-white mb-2.5`, {fontFamily: 'Nunito-ExtraBold'}]}>Your friends</Text>
          <View style={tw`mb-4 mx-3`}>
            {friends && friends.length > 0 ? friends.map((friend: Friend) => (
                <View
                key={friend?.id}
                style={tw`flex-row items-center bg-white/10 rounded-xl mb-2.5 p-3`}
                >
                <Image
                  source={
                  friend?.profile_image
                    ? { uri: friend.profile_image }
                    : require('../../assets/icons/pfpdefault.svg')
                  }
                  style={tw`w-10 h-10 rounded-full mr-2.5`}
                  resizeMode="cover"
                  defaultSource={require('../../assets/icons/pfpdefault.svg')}
                />
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-white text-[15px] -mb-0.5`, { fontFamily: 'Nunito-ExtraBold' }]}>
                  {friend?.firstname} {friend?.lastname}
                  </Text>
                  <Text style={[tw`text-gray-400 text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>
                  @{friend?.username}
                  </Text>
                </View>
                <TouchableOpacity
                  style={tw`bg-[#7A5CFA] rounded-full px-4 py-2`}
                  onPress={() => handleAddCohost(friend)}
                >
                  <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Add cohost</Text>
                </TouchableOpacity>
                </View>
            )) : (
            <Text style={[tw`bg-rose-600/70 text-white text-[13px] text-center p-2 rounded-xl mt-2 mb-2 leading-[1.2]`, { fontFamily: 'Nunito-Medium' }]}>Oops, you gotta add some friends before having them cohort events with you 🫠</Text>
            )}
          </View>
          {/* Save and Cancel buttons */}
          <View style={tw`px-3 pb-4`}>
            <TouchableOpacity
              style={[
                tw`bg-[#7A5CFA] rounded-full py-3 items-center mb-2`,
                { opacity: JSON.stringify(localCohosts) === JSON.stringify(cohosts) ? 0.2 : 1 }
              ]}
              onPress={() => { onSave(localCohosts); onClose(); }}
              activeOpacity={0.8}
              disabled={JSON.stringify(localCohosts) === JSON.stringify(cohosts)}
            >
              <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>{'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[tw`bg-white/5 rounded-full py-3 items-center`, { opacity: 1 }]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
} 