import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

interface DateTimeModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  onSave: (val: { start: Date; end: Date }) => void;
}

function getTimeOptions() {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'am' : 'pm';
      const min = m.toString().padStart(2, '0');
      options.push(`${hour}:${min}${ampm}`);
    }
  }
  return options;
}

const timeOptions = getTimeOptions();

export default function DateTimeModal({ visible, onClose, startDate, endDate, onSave }: DateTimeModalProps) {
  const [localStart, setLocalStart] = useState<Date>(startDate);
  const [localEnd, setLocalEnd] = useState<Date>(endDate);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) return;
    const [_, hourStr, minStr, ampm] = match;
    let hour = Number(hourStr);
    let minute = Number(minStr);
    if (ampm === 'pm' && hour !== 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (type === 'start') {
      const newDate = new Date(localStart);
      newDate.setHours(hour, minute, 0, 0);
      setLocalStart(newDate);
    } else {
      const newDate = new Date(localEnd);
      newDate.setHours(hour, minute, 0, 0);
      setLocalEnd(newDate);
    }
  };

  const currentDate = activeTab === 'start' ? localStart : localEnd;
  const setCurrentDate = activeTab === 'start' ? setLocalStart : setLocalEnd;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#0B1A2A', padding: 20, paddingBottom: 32 }}>
          <Text style={[tw`text-white text-lg font-bold mb-4`, { textAlign: 'center' }]}>Select Event Date & Time</Text>
          {/* Tabs */}
          <View style={tw`flex-row mb-4`}> 
            <TouchableOpacity
              style={tw`${activeTab === 'start' ? 'bg-[#7A5CFA]' : 'bg-[#16263A]'} flex-1 rounded-l-full py-2`}
              onPress={() => setActiveTab('start')}
            >
              <Text style={tw`text-white text-center font-bold`}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`${activeTab === 'end' ? 'bg-[#7A5CFA]' : 'bg-[#16263A]'} flex-1 rounded-r-full py-2`}
              onPress={() => setActiveTab('end')}
            >
              <Text style={tw`text-white text-center font-bold`}>End</Text>
            </TouchableOpacity>
          </View>
          {/* Date Picker */}
          <TouchableOpacity style={tw`bg-[#16263A] rounded-lg px-4 py-3 mb-2`} onPress={() => setShowDate(true)}>
            <Text style={tw`text-white`}>{currentDate.toDateString()}</Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={currentDate}
              mode="date"
              display="calendar"
              onChange={(_, date) => {
                setShowDate(false);
                if (date) setCurrentDate(new Date(date.setHours(currentDate.getHours(), currentDate.getMinutes())));
              }}
            />
          )}
          {/* Time Picker */}
          <TouchableOpacity style={tw`bg-[#16263A] rounded-lg px-4 py-3 mb-4`} onPress={() => setShowTime(true)}>
            <Text style={tw`text-white`}>{timeOptions.find(t => {
              const h = currentDate.getHours();
              const m = currentDate.getMinutes();
              const hour = h % 12 === 0 ? 12 : h % 12;
              const ampm = h < 12 ? 'am' : 'pm';
              const min = m.toString().padStart(2, '0');
              return t === `${hour}:${min}${ampm}`;
            })}</Text>
          </TouchableOpacity>
          {showTime && (
            <View style={{ maxHeight: 200, backgroundColor: '#16263A', borderRadius: 8, marginBottom: 8 }}>
              <ScrollView>
                {timeOptions.map((t, idx) => (
                  <TouchableOpacity key={t} style={tw`px-4 py-2`} onPress={() => { handleTimeChange(activeTab, t); setShowTime(false); }}>
                    <Text style={tw`text-white`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Save/Cancel */}
          <TouchableOpacity
            style={{ backgroundColor: '#7A5CFA', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginBottom: 10 }}
            onPress={() => { onSave({ start: localStart, end: localEnd }); onClose(); }}
            activeOpacity={0.8}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#1A2636', borderRadius: 999, paddingVertical: 12, alignItems: 'center' }}
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