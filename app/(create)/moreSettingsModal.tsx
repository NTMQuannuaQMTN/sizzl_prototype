
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Switch, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface MoreSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  list: { public: boolean; maybe: boolean };
  setList: (list: { public: boolean; maybe: boolean }) => void;
}


const MoreSettingsModal: React.FC<MoreSettingsModalProps> = ({ visible, onClose, list, setList }) => {
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

  if (!shouldRender) return null;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
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
          <Text style={[tw`text-white text-[15px] mb-4`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>More settings</Text>

          {/* Public List Toggle */}
          <View style={tw`flex-row items-center justify-between mb-2 mx-4 bg-white/10 rounded-xl px-4 py-3`}>
            <View style={tw`flex-1`}> 
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-Bold' }]}>Make "Guest List" public 👀</Text>
              <Text style={[tw`text-gray-400 text-xs mt-1 leading-[1.2]`, { fontFamily: 'Nunito-Regular' }]}>Even non-RSVP'ed people can see who's attending your event</Text>
            </View>
            <Switch
              value={list.public}
              onValueChange={v => setList({ ...list, public: v })}
              trackColor={{ false: '#ccc', true: '#7A5CFA' }}
              thumbColor={list.public ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Maybe List Toggle */}
          <View style={tw`flex-row items-center justify-between mb-4 mx-4 bg-white/10 rounded-xl px-4 py-3`}>
            <View style={tw`flex-1`}> 
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-Bold' }]}>Guests can respond "Maybe" 🤔</Text>
              <Text style={[tw`text-gray-400 text-xs mt-1 leading-[1.2]`, { fontFamily: 'Nunito-Regular' }]}>Your guests can be a lil indecisive with their decisions</Text>
            </View>
            <Switch
              value={list.maybe}
              onValueChange={v => setList({ ...list, maybe: v })}
              trackColor={{ false: '#ccc', true: '#7A5CFA' }}
              thumbColor={list.maybe ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={tw`px-4 pb-4`}> 
            <TouchableOpacity
              onPress={onClose}
              style={[
                tw`bg-[#7A5CFA] rounded-full py-3 items-center mb-2`,
                { opacity: 1 }
              ]}
              activeOpacity={0.8}
            >
              <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default MoreSettingsModal; 