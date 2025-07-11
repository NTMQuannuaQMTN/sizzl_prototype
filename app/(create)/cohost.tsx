import React, { useEffect, useState } from 'react';
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#0B1A2A', padding: 20, paddingBottom: 32 }}>
          {/* Drag bar */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#fff', opacity: 0.2 }} />
          </View>
          <Text style={[tw`text-white text-lg font-bold`, { textAlign: 'center', marginBottom: 16 }]}>Manage hosts</Text>

          {/* Cohost input */}
          <View style={{ marginBottom: 18, backgroundColor: '#16263A', borderRadius: 8, paddingHorizontal: 12, paddingTop: 14}}>
            <View style={tw`mb-3 flex-row justify-start items-center gap-2`}>
              <Host></Host>
              <TextInput style={tw`text-white w-72`} placeholder='Cohosts (club, organization, person, etc.)'
                placeholderTextColor={'#9CA3AF'}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={e => {
                  if (input != '') {
                    setLocalCohosts([...localCohosts, input])
                  }
                  setInput('');
                }}
                ></TextInput>
            </View>
            {localCohosts.length > 0 ? (
              <View style={tw`mb-2 flex-row flex-wrap gap-2`}>
                {localCohosts.map((cohost, idx) => {
                  if (typeof cohost === 'string') {
                    return (
                      <View key={`cohost-string-${idx}`} style={tw`flex-row items-center bg-[#000000] rounded-full px-3 py-2 gap-2`}>
                        <TouchableOpacity onPress={() => setLocalCohosts(localCohosts.filter(c => !(typeof c === 'string' && c === cohost)))}>
                          <Text style={tw`text-white`}>x</Text>
                        </TouchableOpacity>
                        <Text style={tw`text-white`}>{cohost}</Text>
                      </View>
                    );
                  } else if (cohost && typeof cohost === 'object') {
                    return (
                      <View key={cohost.id} style={tw`flex-row items-center bg-[#000000] rounded-full px-3 py-2 gap-2`}>
                        <TouchableOpacity onPress={() => setLocalCohosts(localCohosts.filter(c => !(typeof c === 'object' && c.id === cohost.id)))}>
                          <Text style={tw`text-white`}>x</Text>
                        </TouchableOpacity>
                        <Image
                          source={cohost.profile_image ? { uri: cohost.profile_image } : require('../../assets/icons/pfpdefault.svg')}
                          style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#222' }}
                          resizeMode="cover"
                          defaultSource={require('../../assets/icons/pfpdefault.svg')}
                        />
                        <Text style={tw`text-white`}>{cohost.firstname} {cohost.lastname}</Text>
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
          <Text style={tw`text-white font-bold mb-2`}>Your friends</Text>
          <View style={{ marginBottom: 10 }}>
            {friends && friends.length > 0 ? friends.map((friend: Friend) => (
              <View key={friend?.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#16263A', borderRadius: 12, marginBottom: 10, padding: 10 }}>
                <Image
                  source={
                    friend?.profile_image
                      ? { uri: friend.profile_image }
                      : require('../../assets/icons/pfpdefault.svg')
                  }
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#222' }}
                  resizeMode="cover"
                  defaultSource={require('../../assets/icons/pfpdefault.svg')}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[tw`text-white font-bold`, { fontSize: 16 }]}>{friend?.firstname} {friend?.lastname}</Text>
                  <Text style={[tw`text-white/60`, { fontSize: 13 }]}>{friend?.username}</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#7A5CFA', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 7 }}
                  onPress={() => handleAddCohost(friend)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Add cohost</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={tw`text-white text-center mt-4 mb-2`}>Oops, you gotta add some friends before having them cohorting events with you!</Text>
            )}
          </View>
          {/* Save and Cancel buttons */}
          <TouchableOpacity
            style={{ backgroundColor: '#7A5CFA', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginBottom: 10, opacity: localCohosts === cohosts ? 0.5 : 1 }}
            onPress={() => { onSave(localCohosts); onClose(); }}
            activeOpacity={0.8}
            disabled={JSON.stringify(localCohosts) === JSON.stringify(cohosts)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#1A2636', borderRadius: 999, paddingVertical: 12, alignItems: 'center' }}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#B0B8C1', fontWeight: 'bold', fontSize: 17 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 