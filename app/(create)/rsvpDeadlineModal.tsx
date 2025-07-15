import React, { useRef, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';

interface RSVPDeadlineModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate: Date;
  minDate: Date;
  maxDate: Date;
  onSave: (date: Date, time: string) => void;
}

const RSVPDeadlineModal: React.FC<RSVPDeadlineModalProps> = ({ visible, onClose, initialDate, minDate, maxDate, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  // Time picker logic (15-min intervals)
  const getTimeOptions = () => {
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
  };
  const timeOptions = getTimeOptions();
  // Default to closest future time
  const now = new Date();
  let defaultTime = timeOptions[0];
  for (const t of timeOptions) {
    const match = t.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) continue;
    let [_, hourStr, minStr, ampm] = match;
    let hour = Number(hourStr);
    let minute = Number(minStr);
    if (ampm === 'pm' && hour !== 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (hour > now.getHours() || (hour === now.getHours() && minute > now.getMinutes())) {
      defaultTime = t;
      break;
    }
  }
  const [selectedTime, setSelectedTime] = useState(defaultTime);
  const scrollRef = useRef<ScrollView>(null);
  const getSelectedTimeIdx = () => timeOptions.findIndex(t => t === selectedTime);
  const setSelectedTimeByIdx = (idx: number) => {
    if (idx >= 0 && idx < timeOptions.length) setSelectedTime(timeOptions[idx]);
  };
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
          {/* Time Picker */}
          <View style={tw`items-center bg-white/10 rounded-xl mt-4 mb-2`}>
            <View style={{ height: 130, justifyContent: 'center' }}>
              {/* Center indicator overlay */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 43.33,
                  left: 0,
                  right: 0,
                  height: 43.33,
                  borderRadius: 10,
                  backgroundColor: 'rgba(122,92,250,0.15)',
                  borderWidth: 1,
                  borderColor: '#7A5CFA',
                  zIndex: 10,
                }}
              />
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={43.33}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: 43.33 }}
                style={{ maxHeight: 130 }}
                onMomentumScrollEnd={e => {
                  const ITEM_HEIGHT = 43.33;
                  const offsetY = e.nativeEvent.contentOffset.y;
                  const idx = Math.round(offsetY / ITEM_HEIGHT);
                  setSelectedTimeByIdx(idx);
                }}
                onScrollEndDrag={e => {
                  const ITEM_HEIGHT = 43.33;
                  const offsetY = e.nativeEvent.contentOffset.y;
                  const idx = Math.round(offsetY / ITEM_HEIGHT);
                  setSelectedTimeByIdx(idx);
                }}
                scrollEventThrottle={16}
                onLayout={() => {
                  setTimeout(() => {
                    const ITEM_HEIGHT = 43.33;
                    const idx = getSelectedTimeIdx();
                    if (scrollRef.current && idx >= 0) {
                      scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
                    }
                  }, 0);
                }}
              >
                {timeOptions.map((t, idx) => {
                  const isSelected = selectedTime === t;
                  return (
                    <View
                      key={t}
                      style={[tw`px-4`, { height: 43.33, justifyContent: 'center', alignItems: 'center' }]}
                    >
                      <Text
                        style={[
                          isSelected ? tw`text-black` : tw`text-gray-400`,
                          { fontFamily: isSelected ? 'Nunito-ExtraBold' : 'Nunito-Medium', fontSize: 14 },
                        ]}
                      >
                        {t}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
          <View style={tw`flex-row gap-3 mt-6`}>
            <TouchableOpacity
              style={tw`flex-1 bg-gray-300 rounded-lg py-3`}
              onPress={() => {
                setSelectedDate(initialDate);
                setSelectedTime(defaultTime);
                onClose();
              }}
            >
              <Text style={[tw`text-black text-center`, { fontFamily: 'Nunito-Bold' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-[#7b61ff] rounded-lg py-3`}
            onPress={() => {
                // Combine selectedDate and selectedTime into a Date object
                const match = selectedTime.match(/(\d+):(\d+)(am|pm)/i);
                let hour = 0, minute = 0;
                if (match) {
                  hour = Number(match[1]);
                  minute = Number(match[2]);
                  const ampm = match[3];
                  if (ampm === 'pm' && hour !== 12) hour += 12;
                  if (ampm === 'am' && hour === 12) hour = 0;
                }
                const combined = new Date(selectedDate);
                combined.setHours(hour, minute, 0, 0);
                onSave(combined, selectedTime);
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