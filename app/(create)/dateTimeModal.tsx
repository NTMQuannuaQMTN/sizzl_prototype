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
  // Track if user has chosen a date
  const [startDateChosen, setStartDateChosen] = useState(false);
  const [endDateChosen, setEndDateChosen] = useState(false);
  // Refs for scroll
  const scrollRef = useRef<ScrollView>(null);
  // Helper to get/set selected time index
  const getSelectedTimeIdx = (tab: 'start' | 'end') => {
    const val = tab === 'start' ? locStartTime : locEndTime;
    return timeOptions.findIndex(t => t === val);
  };
  const setSelectedTimeByIdx = (tab: 'start' | 'end', idx: number) => {
    if (idx >= 0 && idx < timeOptions.length) {
      handleTimeChange(tab, timeOptions[idx]);
    }
  };

  // Animation logic (copied from imageModal)
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = hidden, 0 = visible
  const [shouldRender, setShouldRender] = useState(visible);

  // Track previous visible state
  const prevVisibleRef = useRef(visible);
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      // Modal just opened: sync local state with props
      setLocalStart(startDate);
      setLocalEnd(endDate);
      setLocStartTime(startTime);
      setLocEndTime(endTime);
      setEndAvailable(endSet);
      setStartDateChosen(!!startDate);
      setEndDateChosen(!!(endSet && endDate));
      setActiveTab('start');
      setShouldRender(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (!visible && prevVisibleRef.current) {
      // Modal just closed
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
    prevVisibleRef.current = visible;
  }, [visible, startDate, endDate, startTime, endTime, endSet]);

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
            { backgroundColor: '#080B32', marginBottom: 0, paddingHorizontal: 20, paddingBottom: 0, height: 750 },
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
            <View style={{ flex: 1 }}>
              <View style={[tw`mb-4 flex-row items-center`, { minHeight: 24 }]}> 
                <TouchableOpacity
                  style={[tw`px-4 py-1`, { minWidth: 50, alignItems: 'flex-start', justifyContent: 'center' }]}
                  onPress={() => {
                    setLocalStart(startDate);
                    setLocalEnd(endDate);
                    setEndAvailable(false);
                    setLocStartTime(startTime);
                    setLocEndTime(endTime);
                    setStartDateChosen(false);
                    setEndDateChosen(false);
                    setActiveTab('start');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[tw`text-[#7A5CFA] text-[13px]`, { fontFamily: 'Nunito-Bold' }]}>Clear</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[tw`text-white -ml-3 text-[15px]`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Set date and time</Text>
                </View>
                {/* Spacer for symmetry */}
                <View style={{ minWidth: 50 }} />
              </View>
              {/* Tabs */}
              <View style={tw`flex-row px-3 mb-2`}>
                <TouchableOpacity
                  style={tw`${activeTab === 'start' ? 'bg-[#7A5CFA]' : 'bg-white/10'} justify-center items-center flex-1 rounded-l-xl py-2.5`}
                  onPress={() => setActiveTab('start')}
                >
                  {!startDateChosen ? (
                    <Text style={[tw`text-white text-center text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>Select date</Text>
                  ) : (
                    <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>{localStart.toDateString()}</Text>
                  )}
                  <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>{locStartTime}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`${activeTab === 'end' ? 'bg-[#7A5CFA]' : 'bg-white/10'} justify-center items-center flex-1 rounded-r-xl py-2.5`}
                  onPress={() => {
                    setActiveTab('end');
                    setEndAvailable(true);
                    // Only auto-set end time if end date is same as start date and end time is invalid
                    const sameDay =
                      localStart.getFullYear() === localEnd.getFullYear() &&
                      localStart.getMonth() === localEnd.getMonth() &&
                      localStart.getDate() === localEnd.getDate();
                    const parseTime = (dateObj: Date, timeStr: string): Date | null => {
                      const match = String(timeStr).match(/(\d+):(\d+)(am|pm)/i);
                      if (!match) return null;
                      let [_, hourStr, minStr, ampm] = match;
                      let hour = Number(hourStr);
                      let minute = Number(minStr);
                      if (ampm === 'pm' && hour !== 12) hour += 12;
                      if (ampm === 'am' && hour === 12) hour = 0;
                      const d = new Date(dateObj);
                      d.setHours(hour, minute, 0, 0);
                      return d;
                    };
                    const startDT = parseTime(localStart, String(locStartTime));
                    const endDT = parseTime(localEnd, String(locEndTime));
                    if (
                      sameDay &&
                      startDT &&
                      endDT &&
                      endDT.getTime() - startDT.getTime() < 30 * 60000
                    ) {
                      // Only update end time if it's not at least 30min after start
                      let minEnd = new Date(startDT.getTime() + 30 * 60000);
                      let newHour = minEnd.getHours();
                      let newMinute = minEnd.getMinutes();
                      let newAmpm = newHour < 12 ? 'am' : 'pm';
                      let displayHour = newHour % 12 === 0 ? 12 : newHour % 12;
                      let displayMinute = String(newMinute).padStart(2, '0');
                      let minEndTime = `${displayHour}:${displayMinute}${newAmpm}`;
                      let idx = timeOptions.findIndex(t => t === minEndTime);
                      // If minEnd is on the next day, update end date as well
                      if (
                        minEnd.getFullYear() !== localEnd.getFullYear() ||
                        minEnd.getMonth() !== localEnd.getMonth() ||
                        minEnd.getDate() !== localEnd.getDate()
                      ) {
                        setLocalEnd(new Date(minEnd));
                        setEndDateChosen(true);
                      }
                      if (idx === -1) {
                        idx = timeOptions.findIndex(t => {
                          const tMatch = t.match(/(\d+):(\d+)(am|pm)/i);
                          if (!tMatch) return false;
                          let [__, h, m, ap] = tMatch;
                          let th = Number(h);
                          let tm = Number(m);
                          if (ap === 'pm' && th !== 12) th += 12;
                          if (ap === 'am' && th === 12) th = 0;
                          return th > newHour || (th === newHour && tm >= newMinute);
                        });
                      }
                      if (idx !== -1) {
                        setLocEndTime(timeOptions[idx]);
                        setEndDateChosen(true);
                        setTimeout(() => {
                          const ITEM_HEIGHT = 43.33;
                          if (scrollRef.current) {
                            scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
                          }
                        }, 0);
                      }
                    }
                    // Otherwise, do not auto-update end time
                  }}
                >
                  {!endAvailable ? (
                    <>
                      <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>Optional</Text>
                      <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>End</Text>
                    </>
                  ) : (
                    <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>{localEnd.toDateString()}</Text>
                  )}
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
                      setStartDateChosen(true);

                      // Update end date if needed
                      if (localEnd < newDate) {
                        setLocalEnd(newDate);
                        setEndDateChosen(false); // force user to re-pick end date
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
                      setEndDateChosen(true);

                      // Update start date if needed
                      if (localStart > newDate) {
                        setLocalStart(newDate);
                        setStartDateChosen(false); // force user to re-pick start date
                      }
                    }
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
                  markedDates={{
                    [currentDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#7A5CFA' }
                  }}
                  minDate={activeTab === 'start' ? getMinStartDate() : getMinEndDate()}
                  maxDate={activeTab === 'start' ? getMaxStartDate() : getMaxEndDate()}
                  dayComponent={({ date, state, marking, onPress }) => {
                    const isSelected = marking && marking.selected;
                    const isDisabled = state === 'disabled';
                    // Reduce height to make week rows closer together, but keep selected day a perfect circle
                    const cellSize = 28;
                    // Determine if this is today
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isToday = date && date.dateString === todayStr;
                    return (
                      <TouchableOpacity
                        disabled={isDisabled || !date}
                        onPress={() => {
                          if (onPress && date) onPress(date);
                        }}
                        activeOpacity={0.7}
                        style={[
                          {
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
                {/* For 3 visible items, each item is ~43.33px tall (130/3) */}
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
                      setSelectedTimeByIdx(activeTab, idx);
                    }}
                    onScrollEndDrag={e => {
                      // fallback for some Androids
                      const ITEM_HEIGHT = 43.33;
                      const offsetY = e.nativeEvent.contentOffset.y;
                      const idx = Math.round(offsetY / ITEM_HEIGHT);
                      setSelectedTimeByIdx(activeTab, idx);
                    }}
                    scrollEventThrottle={16}
                    // initialScrollIndex is not valid for ScrollView; use scrollTo in onLayout
                    onLayout={() => {
                      // Scroll to selected time on open
                      setTimeout(() => {
                        const ITEM_HEIGHT = 43.33;
                        const idx = getSelectedTimeIdx(activeTab);
                        if (scrollRef.current && idx >= 0) {
                          scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
                        }
                      }, 0);
                    }}
                  >
                    {timeOptions.map((t, idx) => {
                      const isSelected = (activeTab === 'start' ? locStartTime : locEndTime) === t;
                      return (
                        <View
                          key={t}
                          style={[tw`px-4`, { height: 43.33, justifyContent: 'center', alignItems: 'center' }]}
                        >
                          <Text
                            style={[
                              isSelected
                                ? tw`text-white`
                                : tw`text-white/20`,
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
                {/* Custom warning moved below */}
              </View>
            </View>
            {/* Custom warning for end time/date < 30 mins after start, now above Save button */}
            {activeTab === 'end' && endAvailable && (() => {
              // Calculate start and end Date objects with selected times
              const parseTime = (dateObj: Date, timeStr: string): Date | null => {
                const match = String(timeStr).match(/(\d+):(\d+)(am|pm)/i);
                if (!match) return null;
                let [_, hourStr, minStr, ampm] = match;
                let hour = Number(hourStr);
                let minute = Number(minStr);
                if (ampm === 'pm' && hour !== 12) hour += 12;
                if (ampm === 'am' && hour === 12) hour = 0;
                const d = new Date(dateObj);
                d.setHours(hour, minute, 0, 0);
                return d;
              };
              const startDT = parseTime(localStart, String(locStartTime));
              const endDT = parseTime(localEnd, String(locEndTime));
              if (startDT && endDT && (endDT.getTime() - startDT.getTime() < 30 * 60000)) {
                return (
                  <View style={tw`w-full px-3`}>
                    <View style={tw`bg-rose-600 rounded-lg p-2.5 items-center`}>
                      <Text style={[tw`text-white text-[13px]`, { fontFamily: 'Nunito-Bold', textAlign: 'center' }]}>⚠️ The end must be at least 30 minutes after the start.</Text>
                    </View>
                  </View>
                );
              }
              return null;
            })()}
            {/* Save/Cancel always at bottom */}
            <View style={tw`py-3 px-4`}>
              <TouchableOpacity
                style={[
                  tw`bg-[#7A5CFA] rounded-full flex-row justify-center py-2.5 items-center gap-1.5`,
                  {
                    opacity: (() => {
                      if (!startDateChosen || (endAvailable && !endDateChosen)) return 0.3;
                      if (endAvailable) {
                        const parseTime = (dateObj: Date, timeStr: string): Date | null => {
                          const match = String(timeStr).match(/(\d+):(\d+)(am|pm)/i);
                          if (!match) return null;
                          let [_, hourStr, minStr, ampm] = match;
                          let hour = Number(hourStr);
                          let minute = Number(minStr);
                          if (ampm === 'pm' && hour !== 12) hour += 12;
                          if (ampm === 'am' && hour === 12) hour = 0;
                          const d = new Date(dateObj);
                          d.setHours(hour, minute, 0, 0);
                          return d;
                        };
                        const startDT = parseTime(localStart, String(locStartTime));
                        const endDT = parseTime(localEnd, String(locEndTime));
                        if (startDT && endDT && (endDT.getTime() - startDT.getTime() < 30 * 60000)) return 0.3;
                      }
                      return 1;
                    })()
                  }
                ]}
                onPress={() => {
                  // Only rely on custom UI and Save button disabling; do not show default alert
                  if (!startDateChosen || (endAvailable && !endDateChosen)) return;
                  // No need to check 30-min rule here, button is already disabled if not met
                  onSave({ start: localStart, end: localEnd, startTime: locStartTime, endTime: locEndTime, endSet: endAvailable });
                }}
                activeOpacity={0.7}
                disabled={(() => {
                  if (!startDateChosen || (endAvailable && !endDateChosen)) return true;
                  if (endAvailable) {
                    const parseTime = (dateObj: Date, timeStr: string): Date | null => {
                      const match = String(timeStr).match(/(\d+):(\d+)(am|pm)/i);
                      if (!match) return null;
                      let [_, hourStr, minStr, ampm] = match;
                      let hour = Number(hourStr);
                      let minute = Number(minStr);
                      if (ampm === 'pm' && hour !== 12) hour += 12;
                      if (ampm === 'am' && hour === 12) hour = 0;
                      const d = new Date(dateObj);
                      d.setHours(hour, minute, 0, 0);
                      return d;
                    };
                    const startDT = parseTime(localStart, String(locStartTime));
                    const endDT = parseTime(localEnd, String(locEndTime));
                    if (startDT && endDT && (endDT.getTime() - startDT.getTime() < 30 * 60000)) return true;
                  }
                  return false;
                })()}
              >
                <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-white/5 rounded-full py-2.5 items-center mt-2`}
                onPress={() => {
                  setLocalStart(startDate);
                  setLocalEnd(endDate);
                  setEndAvailable(endSet);
                  setLocStartTime(startTime);
                  setLocEndTime(endTime);
                  setStartDateChosen(false);
                  setEndDateChosen(false);
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text style={[tw`text-white text-[14px]`, { fontFamily: 'Nunito-ExtraBold' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
} 