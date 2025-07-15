import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

  // Animation logic (slide up/down)
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

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Tap outside to close */}
        <TouchableOpacity
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            { backgroundColor: '#080B32', marginBottom: 0, paddingHorizontal: 0, paddingBottom: 0, height: 670 },
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
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={[tw`flex-row items-center mb-4`, { position: 'relative', minHeight: 0 }]}> 
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(initialDate);
                  setSelectedTime(defaultTime);
                }}
                style={tw`px-4 py-1`}
                activeOpacity={0.7}
              >
                <Text style={[tw`text-[#7A5CFA] text-[13px]`, { fontFamily: 'Nunito-Bold' }]}>Clear</Text>
              </TouchableOpacity>
              <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
                <Text style={[tw`text-white text-[15px]`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Set RSVP Deadline</Text>
              </View>
            </View>
            <View style={[tw`mx-3 mb-2 rounded-xl overflow-hidden`]}>
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
                    selectedColor: '#7A5CFA',
                  },
                }}
                theme={{
                  calendarBackground: '#212346',
                  textSectionTitleColor: '#ffffff',
                  selectedDayBackgroundColor: '#7A5CFA',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#7A5CFA',
                  dayTextColor: '#ffffff',
                  textDisabledColor: '#3A4A5A',
                  monthTextColor: '#ffffff',
                  arrowColor: '#7A5CFA',
                  textDayFontFamily: 'Nunito-Medium',
                  textMonthFontFamily: 'Nunito-ExtraBold',
                  textDayHeaderFontFamily: 'Nunito-Medium',
                  textDayFontSize: 13,
                  textMonthFontSize: 14,
                  textDayHeaderFontSize: 13,
                }}
                dayComponent={({ date, state, marking, onPress }) => {
                  const isSelected = marking && marking.selected;
                  const isDisabled = state === 'disabled';
                  const cellSize = 28;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isToday = date && date.dateString === todayStr;
                  return (
                    <TouchableOpacity
                      disabled={isDisabled || !date}
                      onPress={() => {
                        if (onPress && date) onPress(date);
                      }}
                      activeOpacity={0.7}
                      style={[{
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        width: cellSize,
                        height: cellSize,
                      },
                      isSelected && {
                        backgroundColor: '#7A5CFA',
                        borderRadius: cellSize / 2,
                      },
                      ]}
                    >
                      {date ? (
                        <Text
                          style={[
                            { fontFamily: isSelected ? 'Nunito-ExtraBold' : 'Nunito-Medium', fontSize: 13 },
                            isSelected
                              ? { color: '#fff' }
                              : isDisabled
                                ? { color: '#3A4A5A' }
                                : isToday
                                  ? { color: '#7A5CFA' }
                                  : { color: '#fff' },
                            { textAlign: 'center' },
                          ]}
                        >
                          {date.day}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            {/* Time Picker */}
            <View style={tw`mx-3 items-center bg-white/10 rounded-xl mb-2`}>
              <View style={{ height: 130, justifyContent: 'center' }}>
                {/* Center indicator overlay */}
                <View
                  pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: 43.33, // 1 item height
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
                            isSelected ? tw`text-white` : tw`text-white/20`,
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
          </View>
          {/* Custom warning for RSVP deadline not before event start time */}
          {(() => {
            // Calculate RSVP deadline Date object
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
            return { combined };
          })().combined && (() => {
            // Consider start date unset if maxDate is missing, invalid, epoch, or today
            const isUnsetStart =
              !maxDate ||
              isNaN(maxDate.getTime()) ||
              maxDate.getTime() === 0;
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
            if (isUnsetStart) {
              return (
                <View style={tw`mb-2 w-full px-3`}>
                  <View style={tw`bg-yellow-600 rounded-lg p-2.5 items-center`}>
                    <Text style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Bold', textAlign: 'center' }]}>
                      📢 It's recommended you choose the start date first!
                    </Text>
                  </View>
                </View>
              );
            }
            if (combined.getTime() > maxDate.getTime()) {
              return (
                <View style={tw`mb-2 w-full px-3`}>
                  <View style={tw`bg-rose-600 rounded-lg p-2.5 items-center`}>
                    <Text style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Bold', textAlign: 'center' }]}>
                    ⚠️ The deadline must be before the event's start time
                    </Text>
                  </View>
                </View>
              );
            }
            return null;
          })()}
          {/* Save/Cancel buttons always at the bottom */}
          <View style={[tw`flex-row px-3 pb-4`, { marginTop: 'auto' }]}> 
            <View style={{ flex: 1, flexDirection: 'column'}}>
              <TouchableOpacity
                style={[
                  tw`bg-[#7A5CFA] rounded-full py-3 items-center mb-2`,
                  (() => {
                    // Disable and fade if RSVP deadline is after event start time
                    const isUnsetStart =
                      !maxDate ||
                      isNaN(maxDate.getTime()) ||
                      maxDate.getTime() === 0 ||
                      (maxDate.toDateString && maxDate.toDateString() === new Date().toDateString());
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
                    if (isUnsetStart || combined.getTime() > maxDate.getTime()) {
                      return { opacity: 0.3 };
                    }
                    return {};
                  })(),
                ]}
                onPress={() => {
                  // Disable and fade if RSVP deadline is after event start time
                  const isUnsetStart =
                    !maxDate ||
                    isNaN(maxDate.getTime()) ||
                    maxDate.getTime() === 0;
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
                  if (isUnsetStart || combined.getTime() > maxDate.getTime()) {
                    return;
                  }
                  onSave(combined, selectedTime);
                }}
                activeOpacity={0.7}
                disabled={(() => {
                  const isUnsetStart =
                  !maxDate ||
                  isNaN(maxDate.getTime()) ||
                  maxDate.getTime() === 0;
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
                  return isUnsetStart || combined.getTime() > maxDate.getTime();
                })()}
              >
                <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tw`bg-white/5 rounded-full py-3 items-center`]}
                onPress={() => {
                  setSelectedDate(initialDate);
                  setSelectedTime(defaultTime);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default RSVPDeadlineModal; 