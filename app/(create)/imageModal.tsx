import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Animated, Easing, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

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
        }
    };


    // Animation logic similar to profile.tsx modal, but keep mounted until slide-down finishes
    const slideAnim = React.useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
    const [shouldRender, setShouldRender] = React.useState(visible);

    React.useEffect(() => {
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 100 }}>
            <TouchableOpacity
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                activeOpacity={1}
                onPress={onClose}
            />
            <Animated.View
                style={[
                    { width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#0B1A2A', padding: 20, paddingBottom: 32, height: '95%' },
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
                <Text style={[tw`text-white text-lg font-bold mb-4`, { textAlign: 'center' }]}>Choose an Event Image</Text>
                <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {imageOptions.map((img, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => { onSelect(img); onClose(); }}
                            style={{ margin: 8, borderRadius: 12, overflow: 'hidden', borderWidth: 3, borderColor: 'transparent' }}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={img}
                                style={{ width: 120, height: 120, borderRadius: 12 }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity
                    style={{ backgroundColor: '#FFFFFF', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 16 }}
                    onPress={pickImage}
                >
                    <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 17 }}>Upload image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: '#1A2636', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 8 }}
                    onPress={onClose}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#B0B8C1', fontWeight: 'bold', fontSize: 17 }}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}