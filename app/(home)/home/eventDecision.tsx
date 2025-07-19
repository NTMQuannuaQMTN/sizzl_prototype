import React from 'react';
import { Animated, Easing, Modal, PanResponder, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import tw from 'twrnc';

interface DecisionProps {
    visible: boolean;
    onClose: () => void;
    eventTitle: string;
    maybe: boolean;
    onSelect: (decision: string) => void;
}


export default function DecisionModal({ visible, onClose, eventTitle, maybe, onSelect }: DecisionProps) {
    const MODAL_HEIGHT = 260;
    const slideAnim = React.useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const pan = React.useRef(new Animated.ValueXY()).current;
    const [isModalMounted, setIsModalMounted] = React.useState(false);

    // PanResponder for drag-to-dismiss
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
            },
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

    React.useEffect(() => {
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
                {/* Backdrop for closing the modal by tapping outside */}
                <TouchableOpacity
                    style={tw`absolute inset-0 bg-black/50`}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
                        { backgroundColor: '#080B32', height: MODAL_HEIGHT },
                        { transform: [{ translateY: combinedTranslateY }] },
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                            <View style={tw`pb-8 pt-4 px-4 gap-y-3`}>
                            <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Your decision to {eventTitle}?</Text>
                                <TouchableOpacity
                                    style={tw`bg-green-500 rounded-md flex-row justify-center py-2.5 items-center gap-1.5`}
                                    onPress={() => {onSelect('Going')}}
                                >
                                    <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I’m going 🥳</Text>
                                </TouchableOpacity>
                                {maybe && <TouchableOpacity
                                    style={tw`bg-[#CA8A04] rounded-md flex-row justify-center py-2.5 items-center gap-1.5`}
                                    onPress={() => {onSelect('Maybe')}}
                                >
                                    <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Eh...maybe 🤔</Text>
                                </TouchableOpacity>}
                                <TouchableOpacity
                                    style={tw`bg-[#E11D48] rounded-md flex-row justify-center py-2.5 items-center gap-1.5`}
                                    onPress={() => {onSelect('Nope')}}
                                >
                                    <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>I can't 😭</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </View>
        </Modal>
    );
}