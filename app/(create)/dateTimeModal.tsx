import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Modal, PanResponder, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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

// Helper function to generate time options (e.g., "1:00am", "1:15am", etc.)
function getTimeOptions() {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h % 12 === 0 ? 12 : h % 12; // Convert 24-hour to 12-hour format
      const ampm = h < 12 ? 'am' : 'pm'; // Determine AM/PM
      const min = m.toString().padStart(2, '0'); // Pad minutes with leading zero if needed
      options.push(`${hour}:${min}${ampm}`);
    }
  }
  return options;
}

const timeOptions = getTimeOptions(); // Generate time options once

export default function DateTimeModal({ visible, onClose, startDate, startTime, endSet, endDate, endTime, onSave }: DateTimeModalProps) {
  // Local state to manage date and time selections within the modal
  const [localStart, setLocalStart] = useState<Date>(startDate);
  const [localEnd, setLocalEnd] = useState<Date>(endDate);
  const [locStartTime, setLocStartTime] = useState<String>(startTime);
  const [locEndTime, setLocEndTime] = useState<String>(endTime);
  const [endAvailable, setEndAvailable] = useState<boolean>(endSet);
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start'); // Controls which date/time is currently being edited

  // Track if user has explicitly chosen a date (for enabling save button)
  const [startDateChosen, setStartDateChosen] = useState(false);
  const [endDateChosen, setEndDateChosen] = useState(false);

  // Ref for the ScrollView to enable programmatic scrolling
  const scrollRef = useRef<ScrollView>(null);

  // Helper to get the index of the currently selected time in the timeOptions array
  const getSelectedTimeIdx = (tab: 'start' | 'end') => {
    const val = tab === 'start' ? locStartTime : locEndTime;
    return timeOptions.findIndex(t => t === val);
  };

  // Helper to set the time based on an index in the timeOptions array
  const setSelectedTimeByIdx = (tab: 'start' | 'end', idx: number) => {
    if (idx >= 0 && idx < timeOptions.length) {
      handleTimeChange(tab, timeOptions[idx]);
    }
  };

  // Draggable modal logic (for a pull-down-to-dismiss effect)
  const MODAL_HEIGHT = 760; // Fixed height of the modal
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current; // Animation value for vertical slide
  const pan = useRef(new Animated.ValueXY()).current; // Animation value for pan gesture
  const [shouldRender, setShouldRender] = useState(visible); // Controls modal rendering
  const [isAnimating, setIsAnimating] = useState(false); // Tracks if modal animation is in progress

  // PanResponder for drag-to-dismiss functionality
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Allow pan responder to start
      onStartShouldSetPanResponderCapture: () => false,
      // Only activate pan responder if vertical movement is dominant and downward
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0,
      onPanResponderGrant: () => {
        slideAnim.stopAnimation(); // Stop any ongoing slide animation
        pan.setOffset({ x: 0, y: (slideAnim as any).__getValue() }); // Set offset to current slide position
        pan.setValue({ x: 0, y: 0 }); // Reset pan value
      },
      onPanResponderMove: (evt, gestureState) => {
        const clampedDy = Math.max(0, gestureState.dy); // Only allow downward movement
        pan.setValue({ x: 0, y: clampedDy }); // Update pan value
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset(); // Flatten offset into value
        const currentPosition = (pan.y as any).__getValue ? (pan.y as any).__getValue() : 0; // Get current Y position
        const slideDownThreshold = MODAL_HEIGHT * 0.3; // Threshold to dismiss modal
        const velocityThreshold = 0.5; // Velocity threshold to dismiss modal

        // If dragged down past threshold or flicked quickly, dismiss modal
        if (currentPosition > slideDownThreshold || gestureState.vy > velocityThreshold) {
          Animated.timing(slideAnim, {
            toValue: MODAL_HEIGHT, // Slide down completely
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => {
              setShouldRender(false); // Stop rendering after animation
              pan.setValue({ x: 0, y: 0 }); // Reset pan value
              onClose(); // Call onClose callback
            }, 0);
          });
        } else {
          // Otherwise, snap back to open position
          Animated.spring(slideAnim, {
            toValue: 0, // Slide back up
            useNativeDriver: true,
            bounciness: 0,
            speed: 10,
          }).start(() => {
            setTimeout(() => {
              pan.setValue({ x: 0, y: 0 }); // Reset pan value
            }, 0);
          });
        }
      },
    })
  ).current;

  // Effect for modal open/close animations
  useEffect(() => {
    if (visible) {
      setShouldRender(true); // Start rendering
      setIsAnimating(true); // Indicate animation is active
      Animated.timing(slideAnim, {
        toValue: 0, // Slide up to open
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => setIsAnimating(false), 0); // Animation complete
      });
    } else {
      setIsAnimating(true); // Indicate animation is active
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT, // Slide down to close
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setShouldRender(false); // Stop rendering after animation
          setIsAnimating(false); // Animation complete
          pan.setValue({ x: 0, y: 0 }); // Reset pan value
        }, 0);
      });
    }
  }, [visible]);

  // Sync local state with props when opening the modal
  useEffect(() => {
    if (visible) {
      setLocalStart(startDate);
      setLocalEnd(endDate);
      setLocStartTime(startTime);
      setLocEndTime(endTime);
      setEndAvailable(endSet);
      // Set chosen flags based on initial props
      setStartDateChosen(!!startDate);
      setEndDateChosen(!!(endSet && endDate));
      setActiveTab('start'); // Default to start tab on open
    }
  }, [visible, startDate, endDate, startTime, endTime, endSet]);

  // Effect to scroll the time picker to the selected time when the modal opens or tab changes
  useEffect(() => {
    if (visible && scrollRef.current) {
      // Use a small delay to ensure the ScrollView has rendered its content
      const scrollDelay = setTimeout(() => {
        const ITEM_HEIGHT = 43.33; // Height of each time item
        const idx = getSelectedTimeIdx(activeTab); // Get index of selected time
        if (idx >= 0 && scrollRef.current) {
          scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false }); // Scroll to it
        }
      }, 50); // Increased delay slightly for better reliability
      return () => clearTimeout(scrollDelay); // Clear timeout on unmount or re-run
    }
  }, [visible, activeTab, locStartTime, locEndTime]); // Depend on visible, activeTab, and time strings

  // If modal should not be rendered or is animating out, return null
  if (!shouldRender && !isAnimating) return null;

  // Get current date for validation purposes
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Validation functions for calendar min/max dates
  const getMinStartDate = () => today; // Start date cannot be before today
  const getMaxStartDate = () => {
    if (!endAvailable) {
      // If no end date is set, allow up to 1 year from now
      const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      return maxDate.toISOString().split('T')[0];
    }
    return localEnd.toISOString().split('T')[0]; // Start date cannot be after end date
  };
  const getMinEndDate = () => localStart.toISOString().split('T')[0]; // End date cannot be before start date
  const getMaxEndDate = () => {
    // End date can be up to 1 year from now
    const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  // Handles time string parsing and updates local state for start/end time
  const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) return;
    const [_, hourStr, minStr, ampm] = match;
    let hour = Number(hourStr);
    let minute = Number(minStr);
    if (ampm === 'pm' && hour !== 12) hour += 12; // Convert PM hours (except 12pm)
    if (ampm === 'am' && hour === 12) hour = 0; // Convert 12am to 0 for 24-hour format

    if (type === 'start') {
      setLocStartTime(timeStr);
    } else {
      setLocEndTime(timeStr);
    }
  };

  // Determine which date state variable to use based on active tab
  const currentDate = activeTab === 'start' ? localStart : localEnd;
  // Determine which setter function to use based on active tab
  const setCurrentDate = activeTab === 'start' ? setLocalStart : setLocalEnd;

  return (
    <Modal
      visible={visible}
      animationType="none" // Custom animation handled by Animated.View
      transparent
      onRequestClose={onClose}
      statusBarTranslucent // Allow content to go under status bar
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Tap outside to close the modal */}
        <TouchableOpacity
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            tw`w-full px-0 pt-6 pb-0 rounded-t-2xl`,
            { backgroundColor: '#080B32', marginBottom: 0, paddingHorizontal: 0, paddingBottom: 0, height: MODAL_HEIGHT },
            {
              transform: [
                { translateY: Animated.add(slideAnim, pan.y) }, // Combine slide and pan animations
              ],
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <View style={{ flex: 1 }}>
                {/* Draggable area starts here */}
                <View {...panResponder.panHandlers}>
                  <View style={tw`w-12 h-1.5 bg-gray-500 rounded-full self-center mb-3`} />
                  <View style={[tw`mb-4 flex-row items-center`, { minHeight: 24 }]}>
                    {/* Clear button */}
                    <TouchableOpacity
                      style={[tw`px-4 py-1`, { minWidth: 50, alignItems: 'flex-start', justifyContent: 'center' }]}
                      onPress={() => {
                        // Reset all local state to initial props or default values
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
                    {/* Modal title */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={[tw`text-white -ml-3 text-[15px]`, { fontFamily: 'Nunito-ExtraBold', textAlign: 'center' }]}>Set date and time</Text>
                    </View>
                    {/* Spacer for symmetry (aligns title centrally) */}
                    <View style={{ minWidth: 50 }} />
                  </View>
                  {/* Tabs for Start and End Date/Time */}
                  <View style={tw`flex-row px-3 mb-2`}>
                    {/* Start Date/Time Tab */}
                    <TouchableOpacity
                      style={tw`${activeTab === 'start' ? 'bg-[#7A5CFA]' : 'bg-white/10'} justify-center items-center flex-1 rounded-l-xl py-2.5`}
                      onPress={() => setActiveTab('start')}
                    >
                      {!startDateChosen ? (
                        <Text style={[tw`text-white text-center text-[13px]`, { fontFamily: 'Nunito-Medium' }]}>Select date</Text>
                      ) : (
                        <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>
                          {localStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      )}
                      <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>{locStartTime}</Text>
                    </TouchableOpacity>
                    {/* End Date/Time Tab */}
                    <TouchableOpacity
                      style={tw`${activeTab === 'end' ? 'bg-[#7A5CFA]' : 'bg-white/10'} justify-center items-center flex-1 rounded-r-xl py-2.5`}
                      onPress={() => {
                        setActiveTab('end');
                        setEndAvailable(true); // Make end date/time available when tab is selected

                        // Auto-adjust end time if it's less than 30 mins after start time on the same day
                        const sameDay =
                          localStart.getFullYear() === localEnd.getFullYear() &&
                          localStart.getMonth() === localEnd.getMonth() &&
                          localStart.getDate() === localEnd.getDate();

                        // Helper to parse time string into a Date object
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
                          endDT.getTime() - startDT.getTime() < 30 * 60000 // Less than 30 minutes difference
                        ) {
                          let minEnd = new Date(startDT.getTime() + 30 * 60000); // Calculate 30 mins after start
                          let newHour = minEnd.getHours();
                          let newMinute = minEnd.getMinutes();
                          let newAmpm = newHour < 12 ? 'am' : 'pm';
                          let displayHour = newHour % 12 === 0 ? 12 : newHour % 12;
                          let displayMinute = String(newMinute).padStart(2, '0');
                          let minEndTime = `${displayHour}:${displayMinute}${newAmpm}`;

                          let idx = timeOptions.findIndex(t => t === minEndTime);
                          // If exact time not found, find the next available time slot
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

                          // If minEnd overflows to next day, update end date as well
                          if (
                            minEnd.getFullYear() !== localEnd.getFullYear() ||
                            minEnd.getMonth() !== localEnd.getMonth() ||
                            minEnd.getDate() !== localEnd.getDate()
                          ) {
                            setLocalEnd(new Date(minEnd));
                            setEndDateChosen(true);
                          }

                          if (idx !== -1) {
                            setLocEndTime(timeOptions[idx]);
                            setEndDateChosen(true);
                          }
                        }
                      }}
                    >
                      {!endAvailable ? (
                        <>
                          <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>Optional</Text>
                          <Text style={[tw`text-white text-center text-[15px]`, { fontFamily: 'Nunito-ExtraBold' }]}>End</Text>
                        </>
                      ) : (
                        <Text style={[tw`text-white text-center text-[13px] `, { fontFamily: 'Nunito-Medium' }]}>
                          {localEnd.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      )}
                      {endAvailable && <Text style={[tw`text-white text-center`, { fontFamily: 'Nunito-ExtraBold' }]}>{locEndTime}</Text>}
                    </TouchableOpacity>
                  </View>
                  {/* Date Picker (Calendar) */}
                  <View style={[tw`mx-3 mb-2 rounded-xl overflow-hidden`]}>
                    <Calendar
                      current={currentDate.toISOString().split('T')[0]} // Set current month based on selected date
                      onDayPress={day => {
                        const [year, month, date] = day.dateString.split('-').map(Number);
                        const newDate = new Date(currentDate); // Create a new Date object based on current selected date
                        newDate.setFullYear(year, month - 1, date); // Set year, month (0-indexed), and day

                        // Apply validation based on active tab
                        if (activeTab === 'start') {
                          const minDate = new Date(getMinStartDate());
                          const maxDate = new Date(getMaxStartDate());

                          // Ensure newDate is within valid range for start date
                          if (newDate < minDate) {
                            newDate.setTime(minDate.getTime());
                          } else if (newDate > maxDate) {
                            newDate.setTime(maxDate.getTime());
                          }

                          setLocalStart(newDate);
                          setStartDateChosen(true);

                          // If start date moves past end date, update end date to match
                          if (localEnd < newDate) {
                            setLocalEnd(newDate);
                            setEndDateChosen(false); // Force user to re-pick end date for clarity
                          }
                        } else { // activeTab === 'end'
                          const minDate = new Date(getMinEndDate());
                          const maxDate = new Date(getMaxEndDate());

                          // Ensure newDate is within valid range for end date
                          if (newDate < minDate) {
                            newDate.setTime(minDate.getTime());
                          } else if (newDate > maxDate) {
                            newDate.setTime(maxDate.getTime());
                          }

                          setLocalEnd(newDate);
                          setEndDateChosen(true);

                          // If end date moves before start date, update start date to match
                          if (localStart > newDate) {
                            setLocalStart(newDate);
                            setStartDateChosen(false); // Force user to re-pick start date for clarity
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
                        const cellSize = 28; // Size for each day cell
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
                </View>
                {/* Draggable area ends here */}
                {/* Time Picker */}
                <View style={tw`mx-3 items-center bg-white/10 rounded-xl mb-2`}>
                  {/* Container for the scrollable time list */}
                  <View style={{ height: 130, justifyContent: 'center' }}>
                    {/* Center indicator overlay */}
                    <View
                      pointerEvents="none" // Allows touches to pass through to the ScrollView
                      style={{
                        position: 'absolute',
                        top: 43.33, // Position at the height of one item
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
                      snapToInterval={43.33} // Snap to the height of each item
                      decelerationRate="fast" // Fast deceleration for snapping effect
                      contentContainerStyle={{ paddingVertical: 43.33 }} // Padding to show half of adjacent items
                      style={{ maxHeight: 130 }}
                      // When scrolling ends (either by momentum or drag release)
                      onMomentumScrollEnd={e => {
                        const ITEM_HEIGHT = 43.33;
                        const offsetY = e.nativeEvent.contentOffset.y;
                        const idx = Math.round(offsetY / ITEM_HEIGHT); // Calculate the index of the centered item
                        setSelectedTimeByIdx(activeTab, idx); // Update the selected time
                      }}
                      onScrollEndDrag={e => {
                        // Fallback for some Android devices where onMomentumScrollEnd might not always fire
                        const ITEM_HEIGHT = 43.33;
                        const offsetY = e.nativeEvent.contentOffset.y;
                        const idx = Math.round(offsetY / ITEM_HEIGHT);
                        setSelectedTimeByIdx(activeTab, idx);
                      }}
                      scrollEventThrottle={16} // Optimize scroll event frequency
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
                </View>
              </View>
              {/* Custom warning for end time/date < 30 mins after start, now above Save button */}
              {activeTab === 'end' && endAvailable && (() => {
                // Calculate start and end Date objects with selected times for validation
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
              {/* Save/Cancel buttons always at the bottom */}
              <View style={tw`pb-8 px-3`}>
                <TouchableOpacity
                  style={[
                    tw`bg-[#7A5CFA] rounded-full flex-row justify-center py-2.5 items-center gap-1.5`,
                    {
                      // Opacity based on whether required fields are chosen and validation passes
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
                    // Only save if validation passes (button is disabled otherwise)
                    if (!startDateChosen || (endAvailable && !endDateChosen)) return;
                    onSave({ start: localStart, end: localEnd, startTime: locStartTime, endTime: locEndTime, endSet: endAvailable });
                  }}
                  activeOpacity={0.7}
                  disabled={(() => {
                    // Disable button if required fields are not chosen or validation fails
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
                    // Reset to original props values and close
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
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
}
