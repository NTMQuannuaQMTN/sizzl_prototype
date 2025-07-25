import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface SpecModalProps {
    visible: boolean;
    color: string;
    title: string;
    spec: string;
    onClose: () => void;
}

const SpecModal: React.FC<SpecModalProps> = ({ visible, color, title, spec, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={tw`${color} w-full absolute bottom-0 left-0 p-4`}>
                    <Text style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 18 }}>{title}</Text>
                    {/* Add your modal content here */}
                    <TouchableOpacity onPress={onClose} style={{ marginTop: 16, padding: 10, backgroundColor: '#7A5CFA', borderRadius: 8 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default SpecModal;
