import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';

interface DateTimeModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date;
  startTime: string;
  endSet: boolean;
  endDate: Date;
  endTime: string;
  onSave: (val: { start: Date; end: Date; startTime: String; endTime: String; endSet: boolean }) => void;
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


export default function DateTimeModal({ visible, onClose, startDate, startTime, endSet, endDate, endTime, onSave }: DateTimeModalProps) {
  const [localStart, setLocalStart] = useState<Date>(startDate);
  const [localEnd, setLocalEnd] = useState<Date>(endDate);
  const [locStartTime, setLocStartTime] = useState<String>(startTime);
  const [locEndTime, setLocEndTime] = useState<String>(endTime);
  const [endAvailable, setEndAvailable] = useState<boolean>(endSet);
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  // Animation logic (copied from imageModal)
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
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

  // Get current date and time for validation
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Validation functions
  const getMinStartDate = () => today; // Start date can't be before today
  const getMaxStartDate = () => {
    if (!endAvailable) {
      const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      return maxDate.toISOString().split('T')[0];
    }
    return localEnd.toISOString().split('T')[0]; // Start date can't be after end date
  };
  const getMinEndDate = () => localStart.toISOString().split('T')[0]; // End date can't be before start date
  const getMaxEndDate = () => {
    const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) return;
    const [_, hourStr, minStr, ampm] = match;
    let hour = Number(hourStr);
    let minute = Number(minStr);
    if (ampm === 'pm' && hour !== 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    if (type === 'start') {
      setLocStartTime(timeStr);
    } else {
      setLocEndTime(timeStr);
    }
  };

  const currentDate = activeTab === 'start' ? localStart : localEnd;
  const setCurrentDate = activeTab === 'start' ? setLocalStart : setLocalEnd;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Overlay to close modal on tap */}
        <TouchableOpacity
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            { backgroundColor: '#080B32', marginBottom: 0, paddingHorizontal: 20, paddingBottom: 32, height: 750 },
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
          <Text style={[tw`text-white text-[15px] mb-4`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Set date and time</Text>
          {/* Tabs */}
          <View style={tw`flex-row px-3 mb-4`}>
            <TouchableOpacity
              style={tw`${activeTab === 'start' ? 'bg-[#7A5CFA]' : 'bg-white/10'} justify-center items-center flex-1 rounded-l-xl py-2`}
              onPress={() => setActiveTab('start')}
            >
              {(!localStart || !locStartTime) ? (
                <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Start</Text>
              ) : null}
              <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>{localStart.toDateString()}</Text>
              <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>{locStartTime}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`${activeTab === 'end' ? 'bg-[#7A5CFA]' : 'bg-white/10'} justify-center items-center flex-1 rounded-r-xl py-2`}
              onPress={() => { setActiveTab('end'); setEndAvailable(true); }}
            >
              {(!endAvailable || !localEnd || !locEndTime) ? (
                <>
                  <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>Optional</Text>
                  <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>End</Text>
                </>
              ) : null}
              {endAvailable && <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>{localEnd.toDateString()}</Text>}
              {endAvailable && <Text style={[tw`text-white text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>{locEndTime}</Text>}
            </TouchableOpacity>
          </View>
          {/* Date Picker */}
            <View style={[tw`mx-3 mb-2 rounded-xl overflow-hidden`]}>
            <Calendar
              current={currentDate.toISOString().split('T')[0]}
              onDayPress={day => {
                const [year, month, date] = day.dateString.split('-').map(Number);
                const newDate = new Date(currentDate);
                newDate.setFullYear(year, month - 1, date);

                // Apply validation based on active tab
                if (activeTab === 'start') {
                  // For start date: min = today, max = end date
                  const minDate = new Date(getMinStartDate());
                  const maxDate = new Date(getMaxStartDate());

                  if (newDate < minDate) {
                    newDate.setTime(minDate.getTime());
                  } else if (newDate > maxDate) {
                    newDate.setTime(maxDate.getTime());
                  }

                  setLocalStart(newDate);

                  // Update end date if needed
                  if (localEnd < newDate) {
                    setLocalEnd(newDate);
                  }
                } else {
                  // For end date: min = start date, max = 1 year from today
                  const minDate = new Date(getMinEndDate());
                  const maxDate = new Date(getMaxEndDate());

                  if (newDate < minDate) {
                    newDate.setTime(minDate.getTime());
                  } else if (newDate > maxDate) {
                    newDate.setTime(maxDate.getTime());
                  }

                  setLocalEnd(newDate);

                  // Update start date if needed
                  if (localStart > newDate) {
                    setLocalStart(newDate);
                  }
                }
              }}
              theme={{
                // backgroundColor: '#FFFFFF1A',
                calendarBackground: '#14173C',
                textSectionTitleColor: '#ffffff',
                selectedDayBackgroundColor: '#7A5CFA',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#7A5CFA',
                dayTextColor: '#ffffff',
                textDisabledColor: '#3A4A5A',
                monthTextColor: '#ffffff',
                arrowColor: '#7A5CFA',
              }}
              markedDates={{
                [currentDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#7A5CFA' }
              }}
              minDate={activeTab === 'start' ? getMinStartDate() : getMinEndDate()}
              maxDate={activeTab === 'start' ? getMaxStartDate() : getMaxEndDate()}
            />
          </View>
          {/* Time Picker */}
          <View style={{ maxHeight: 100, backgroundColor: '#16263A', borderRadius: 8, marginBottom: 8 }}>
            <ScrollView>
              {(timeOptions).map((t, idx) => (
                <TouchableOpacity key={t} style={tw`px-4 py-2`} onPress={() => { handleTimeChange(activeTab, t) }}>
                  <Text style={tw`text-white`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Save/Cancel */}
          <View style={tw`py-3 px-4`}>
            <TouchableOpacity
              style={tw`bg-[#7A5CFA] rounded-full flex-row justify-center py-2.5 items-center gap-1.5`}
              onPress={() => { onSave({ start: localStart, end: localEnd, startTime: locStartTime, endTime: locEndTime, endSet: endAvailable }); }}
              activeOpacity={0.8}
            >
              <Text style={[tw`text-white text-[14px]`, { fontWeight: 'bold' }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-white/5 rounded-full py-2.5 items-center mt-2`}
              onPress={() => {
                setLocalStart(startDate);
                setLocalEnd(endDate);
                setEndAvailable(endSet);
                setLocStartTime(startTime);
                setLocEndTime(endTime);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={[tw`text-white text-[14px]`, { fontWeight: 'bold' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
} 