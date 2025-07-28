import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface DraggableSpecModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  spec: string;
  color: string;
}

const MODAL_HEIGHT = 400;

const badgeColors: Record<string, { bg: string; text: string }> = {
  'bg-yellow-200': { bg: '#FEF08A', text: '#000' },
  'bg-sky-200': { bg: '#BAE6FD', text: '#000' },
  'bg-pink-200/90': { bg: '#FBCFE8', text: '#000' },
  'bg-green-200/90': { bg: '#BBF7D0', text: '#000' },
};

export default function DraggableSpecModal({ visible, onClose, title, spec, color }: DraggableSpecModalProps) {
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const [isModalMounted, setIsModalMounted] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderGrant: () => {
        slideAnim.stopAnimation();
        pan.setOffset({ x: 0, y: (slideAnim as any).__getValue() });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        const clampedDy = Math.max(0, gestureState.dy);
        pan.setValue({ x: 0, y: clampedDy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        const currentPosition = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0;
        const slideDownThreshold = MODAL_HEIGHT * 0.3;
        const velocityThreshold = 0.5;
        if (currentPosition > slideDownThreshold || gestureState.vy > velocityThreshold) {
          Animated.timing(slideAnim, {
            toValue: MODAL_HEIGHT,
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
        toValue: MODAL_HEIGHT,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsModalMounted(false);
        pan.setValue({ x: 0, y: 0 });
      });
    }
  }, [visible]);

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
          style={tw`absolute inset-0 bg-black/50`}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            { backgroundColor: badgeColors[color]?.bg || color || '#fff', height: MODAL_HEIGHT },
            { transform: [{ translateY: combinedTranslateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={tw`w-12 h-1.5 bg-gray-500 rounded-full self-center mb-3`} />
          <Text style={[{ color: badgeColors[color]?.text || '#000' }, tw`text-[18px] mb-2 text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>{title}</Text>
          <Text style={[{ color: badgeColors[color]?.text || '#000' }, tw`text-[15px] px-6 text-center`, { fontFamily: 'Nunito-Medium' }]}>{spec}</Text>
          <TouchableOpacity
            style={tw`absolute right-4 top-4 px-3 py-1 rounded-full`}
            onPress={onClose}
          >
            <Text style={[{ color: badgeColors[color]?.text || '#000' }, tw`text-[13px]`]}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
