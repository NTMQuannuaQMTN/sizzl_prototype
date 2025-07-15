import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Animated, Easing, Image, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import UploadIcon from '../../assets/icons/uploadwhite-icon.svg';

interface ImageModalProps {
    visible: boolean;
    onClose: () => void;
    imageOptions: any[];
    onSelect: (img: any) => void;
}


export default function ImageModal({ visible, onClose, imageOptions, onSelect }: ImageModalProps) {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 1
        });
        if (!result.canceled) {
            onSelect(result.assets[0].uri);
            onClose();
        }
    };

    // Shuffle function
    function shuffleArray<T>(array: T[]): T[] {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Animation logic similar to profile.tsx modal, but keep mounted until slide-down finishes
    const slideAnim = React.useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
    const [shouldRender, setShouldRender] = React.useState(visible);
    const [shuffledImages, setShuffledImages] = React.useState(imageOptions);

    React.useEffect(() => {
        if (visible) {
            setShuffledImages(shuffleArray(imageOptions));
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
    }, [visible, imageOptions]);

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
                <TouchableOpacity
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
                        { backgroundColor: '#080B32', marginBottom: 0, height: 600 },
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
                    <Text style={[tw`text-white text-[15px] mb-4`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Choose a theme for your event!</Text>
                    <View style={{ flex: 1, minHeight: 0, width: '100%' }}>
                        <ScrollView
                            contentContainerStyle={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                marginBottom: 0,
                                width: '100%',
                            }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                            scrollEnabled={true}
                        >
                            {shuffledImages.map((img, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => { onSelect(img); onClose(); }}
                                    style={{
                                        margin: 8,
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                        borderWidth: 0,
                                        borderColor: 'transparent',
                                        width: '45%',
                                        aspectRatio: 410 / 279, // maintain 410:279 ratio
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={img}
                                        style={{ width: '100%', height: '100%', borderRadius: 10 }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={tw`py-3 px-4`}>
                        <TouchableOpacity
                            style={tw`bg-[#7A5CFA] rounded-full flex-row justify-center py-2.5 items-center gap-1.5`}
                            onPress={pickImage}
                        >
                            <UploadIcon width={20} height={20} />
                            <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Upload image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw`bg-white/5 rounded-full py-2.5 items-center mt-2`}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}