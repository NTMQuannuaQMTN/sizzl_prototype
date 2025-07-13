import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';

interface DateTimeModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date;
  endSet: boolean;
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

export default function DateTimeModal({ visible, onClose, startDate, endSet, endDate, onSave }: DateTimeModalProps) {
  const [localStart, setLocalStart] = useState<Date>(startDate);
  const [localEnd, setLocalEnd] = useState<Date>(endDate);
  const [endAvailable, setEndAvailable] = useState<boolean>(endSet);
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

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

  // Check if start date is today
  const isStartDateToday = localStart.toISOString().split('T')[0] === today;

  // Get minimum start time (if start date is today, use closest future time from options)
  const getMinStartTime = () => {
    if (isStartDateToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Find the closest future time from timeOptions
      for (const timeStr of timeOptions) {
        const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
        if (!match) continue;
        
        const [_, hourStr, minStr, ampm] = match;
        let hour = Number(hourStr);
        let minute = Number(minStr);
        
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        
        // Check if this time is in the future
        if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
          const minTime = new Date(localStart);
          minTime.setHours(hour, minute, 0, 0);
          return minTime;
        }
      }
      
      // If no future time found today, use tomorrow at 12:00am
      const tomorrow = new Date(localStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }
    return new Date(localStart.getFullYear(), localStart.getMonth(), localStart.getDate(), 0, 0, 0);
  };

  // Filter time options for start time if start date is today
  // Returns valid start time options (future times if today)
  const getValidStartTimeOptions = () => {
    if (!isStartDateToday) return timeOptions;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let found = false;
    return timeOptions.filter(timeStr => {
      const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
      if (!match) return false;
      let [_, hourStr, minStr, ampm] = match;
      let hour = Number(hourStr);
      let minute = Number(minStr);
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      if (!found && (hour > currentHour || (hour === currentHour && minute > currentMinute))) {
        found = true;
        return true;
      }
      return found;
    });
  };

  // Returns valid end time options (at least 30 minutes after localStart)
  const getValidEndTimeOptions = () => {
    // Always filter based on localStart
    const startHour = localStart.getHours();
    const startMinute = localStart.getMinutes();
    return timeOptions.filter(timeStr => {
      const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
      if (!match) return false;
      let [_, hourStr, minStr, ampm] = match;
      let hour = Number(hourStr);
      let minute = Number(minStr);
      if (ampm === 'pm' && hour !== 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      // Calculate the difference in minutes
      const diff = (hour * 60 + minute) - (startHour * 60 + startMinute);
      return diff >= 30;
    });
  };

  // Get minimum end time (start time + 1 hour)
  const getMinEndTime = () => {
    const minTime = new Date(localStart);
    minTime.setHours(minTime.getHours() + 1);
    return minTime;
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
      const newDate = new Date(localStart);
      newDate.setHours(hour, minute, 0, 0);
      
      // Validate start time
      const minStartTime = getMinStartTime();
      if (newDate < minStartTime) {
        newDate.setTime(minStartTime.getTime());
      }
      
      setLocalStart(newDate);
      
      // Update end time if needed
      const minEndTime = getMinEndTime();
      if (localEnd < minEndTime) {
        setLocalEnd(minEndTime);
      }
    } else {
      const newDate = new Date(localEnd);
      newDate.setHours(hour, minute, 0, 0);
      
      // Validate end time
      const minEndTime = getMinEndTime();
      if (newDate < minEndTime) {
        newDate.setTime(minEndTime.getTime());
      }
      
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
              onPress={() => {setActiveTab('end'); setEndAvailable(true)}}
            >
              <Text style={tw`text-white text-center font-bold`}>End</Text>
            </TouchableOpacity>
          </View>
          {/* Date Picker */}
          <View style={{ backgroundColor: '#16263A', borderRadius: 8, marginBottom: 8 }}>
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
                backgroundColor: '#16263A',
                calendarBackground: '#16263A',
                textSectionTitleColor: '#B0B8C1',
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
              {(activeTab === 'start' ? getValidStartTimeOptions() : getValidEndTimeOptions()).map((t, idx) => (
                <TouchableOpacity key={t} style={tw`px-4 py-2`} onPress={() => { handleTimeChange(activeTab, t) }}>
                  <Text style={tw`text-white`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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