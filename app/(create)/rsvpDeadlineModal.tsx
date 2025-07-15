import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';

interface RSVPDeadlineModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate: Date;
  minDate: Date;
  maxDate: Date;
  onSave: (date: Date) => void;
}

const RSVPDeadlineModal: React.FC<RSVPDeadlineModalProps> = ({ visible, onClose, initialDate, minDate, maxDate, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  // Set minDate to today in local time zone, formatted as 'YYYY-MM-DD'
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const localTodayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end bg-black bg-opacity-60`}>
        <View style={tw`bg-white rounded-t-2xl px-6 pt-6 pb-8`}>
          <Text style={[tw`text-black text-lg mb-4`, { fontFamily: 'Nunito-ExtraBold' }]}>Set RSVP Deadline</Text>
          <Calendar
            current={selectedDate.toISOString().split('T')[0]}
            onDayPress={day => {
              // The issue is that new Date(year, month - 1, date) creates a Date in local time,
              // but Calendar's day.dateString is in 'YYYY-MM-DD' (UTC midnight).
              // To avoid timezone offset issues, construct the date as UTC:
              const [year, month, dayNum] = day.dateString.split('-').map(Number);
              const selected = new Date(Date.UTC(year, month - 1, dayNum));
              setSelectedDate(selected);
            }}
            minDate={localTodayStr}
            maxDate={maxDate.toISOString().split('T')[0]}
            markedDates={{
              [selectedDate.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: '#7b61ff',
              },
            }}
            theme={{
              selectedDayBackgroundColor: '#7b61ff',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#7b61ff',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#7b61ff',
              monthTextColor: '#2d4150',
              textDayFontFamily: 'Nunito-Medium',
              textMonthFontFamily: 'Nunito-Bold',
              textDayHeaderFontFamily: 'Nunito-Bold',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
          />
          <View style={tw`flex-row gap-3 mt-6`}>
            <TouchableOpacity
              style={tw`flex-1 bg-gray-300 rounded-lg py-3`}
              onPress={() => {
                setSelectedDate(initialDate);
                onClose();
              }}
            >
              <Text style={[tw`text-black text-center`, { fontFamily: 'Nunito-Bold' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-[#7b61ff] rounded-lg py-3`}
              onPress={() => {
                onSave(selectedDate);
              }}
            >
              <Text style={[tw`text-white text-center`, { fontFamily: 'Nunito-Bold' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RSVPDeadlineModal; 