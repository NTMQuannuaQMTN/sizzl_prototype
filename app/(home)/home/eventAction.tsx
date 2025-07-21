import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, PanResponder, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import tw from 'twrnc';

export type EventActionModalProps = {
  visible: boolean;
  onClose: () => void;
  actions: Array<{
    label: string;
    onPress: () => void;
    color?: string;
    textStyle?: object;
  }>;
  title?: string;
};

// Helper: preset actions for draft scenario
export function getDraftActions(onContinue: () => void, onDelete: () => void) {
  return [
    {
      label: 'Continue editing',
      onPress: onContinue,
      color: 'bg-[#7A5CFA]'
    },
    {
      label: 'Delete draft',
      onPress: onDelete,
      color: 'bg-rose-600',
      textStyle: { fontFamily: 'Nunito-ExtraBold' }
    }
  ];
}

// Remove fixed modal height

const EventActionModal: React.FC<EventActionModalProps> = ({ visible, onClose, actions, title }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const [isModalMounted, setIsModalMounted] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        slideAnim.stopAnimation();
        pan.setOffset({ x: 0, y: (slideAnim as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        const clampedDy = Math.max(0, gestureState.dy);
        pan.setValue({ x: 0, y: clampedDy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        const currentPosition = (pan.y as any)._value;
        const slideDownThreshold = contentHeight * 0.3;
        const velocityThreshold = 0.5;
        if (currentPosition > slideDownThreshold || gestureState.vy > velocityThreshold) {
          Animated.timing(slideAnim, {
            toValue: contentHeight,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 10,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
          });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setIsModalMounted(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: contentHeight,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsModalMounted(false);
        pan.setValue({ x: 0, y: 0 });
      });
    }
  }, [visible, contentHeight]);

  if (!isModalMounted) return null;
  const combinedTranslateY = Animated.add(slideAnim, pan.y);

  return (
    <Modal
      visible={visible || isModalMounted}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={tw`flex-1 justify-end items-center`}>
        <TouchableOpacity
          style={tw`absolute inset-0 bg-black/70`}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`, { backgroundColor: '#080B32', maxHeight: '80%', transform: [{ translateY: combinedTranslateY }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={{ flexDirection: 'column', justifyContent: 'space-between' }}
              onLayout={e => setContentHeight(e.nativeEvent.layout.height)}
            >
              <View>
                <View style={tw`w-12 h-1.5 bg-gray-500 rounded-full self-center mb-4`} />
                {title && <Text style={[tw`text-white text-[16px] mb-4 text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>{title}</Text>}
              </View>
              <View style={tw`px-6 pb-8 flex-col gap-2`}>
                {actions.map((action, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={tw`${action.color || 'bg-white/10'} rounded-full py-3 items-center`}
                    onPress={action.onPress}
                    activeOpacity={0.8}
                  >
                    <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }, action.textStyle || {}]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EventActionModal;
