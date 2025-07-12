import React from 'react';
import { Modal, Switch, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface MoreSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  list: { public: boolean; maybe: boolean };
  setList: (list: { public: boolean; maybe: boolean }) => void;
}

const MoreSettingsModal: React.FC<MoreSettingsModalProps> = ({ visible, onClose, list, setList }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end bg-black bg-opacity-60`}>
        <View style={tw`bg-[#0B1A2A] rounded-t-2xl px-6 pt-6 pb-8`}>  
          <Text style={[tw`text-white text-lg mb-4`, { fontFamily: 'Nunito-ExtraBold' }]}>More Settings</Text>

          {/* Public List Toggle */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-Medium' }]}>Publicize list</Text>
            <Switch
              value={list.public}
              onValueChange={v => setList({ ...list, public: v })}
              trackColor={{ false: '#ccc', true: '#7b61ff' }}
              thumbColor={list.public ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Maybe List Toggle */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-Medium' }]}>Allow to answer 'Maybe'</Text>
            <Switch
              value={list.maybe}
              onValueChange={v => setList({ ...list, maybe: v })}
              trackColor={{ false: '#ccc', true: '#7b61ff' }}
              thumbColor={list.maybe ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={tw`mt-2 bg-[#7b61ff] rounded-full py-2 px-4 items-center`}
          >
            <Text style={[tw`text-white text-base`, { fontFamily: 'Nunito-ExtraBold' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MoreSettingsModal; 