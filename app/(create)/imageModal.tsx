import React from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  imageOptions: any[];
  onSelect: (img: any) => void;
}

export default function ImageModal({ visible, onClose, imageOptions, onSelect }: ImageModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#0B1A2A', padding: 20, paddingBottom: 32, height: '95%' }}>
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
            // onPress={onClose}
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
        </View>
      </View>
    </Modal>
  );
} 