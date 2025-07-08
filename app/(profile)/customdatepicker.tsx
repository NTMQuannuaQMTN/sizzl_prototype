
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface CustomDatePickerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  onCancel?: () => void;
  onSave?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  initialDate = new Date(),
  onDateChange,
  onCancel,
  onSave,
  minimumDate,
  maximumDate,
  textColor = '#FFFFFF',
  style = {},
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  
  // Generate arrays for months, days, and years
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Calculate year range based on min/max dates
  const currentYear = new Date().getFullYear();
  const minYear = minimumDate ? minimumDate.getFullYear() : currentYear - 100;
  const maxYear = maximumDate ? maximumDate.getFullYear() : currentYear;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(selectedDate.getDate());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  
  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);
  
  const monthScrollRef = useRef<ScrollView | null>(null);
  const dayScrollRef = useRef<ScrollView | null>(null);
  const yearScrollRef = useRef<ScrollView | null>(null);
  
  const ITEM_HEIGHT = 50;
  
  useEffect(() => {
    // Validate the date against min/max constraints
    let newDate = new Date(selectedYear, selectedMonth, selectedDay);
    
    // Check if date is within bounds
    if (minimumDate && newDate < minimumDate) {
      newDate = new Date(minimumDate);
      setSelectedYear(newDate.getFullYear());
      setSelectedMonth(newDate.getMonth());
      setSelectedDay(newDate.getDate());
    } else if (maximumDate && newDate > maximumDate) {
      newDate = new Date(maximumDate);
      setSelectedYear(newDate.getFullYear());
      setSelectedMonth(newDate.getMonth());
      setSelectedDay(newDate.getDate());
    }
    
    setSelectedDate(newDate);
    onDateChange && onDateChange(newDate);
  }, [selectedMonth, selectedDay, selectedYear, minimumDate, maximumDate]);
  
  const renderPickerItem = (
    item: string | number,
    index: number,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={index}
      style={{
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: isSelected ? 1 : 0.6,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{
        color: textColor,
        fontSize: isSelected ? 18 : 16,
        fontWeight: isSelected ? 'bold' : 'normal',
        fontFamily: 'Nunito-Medium',
      }}>
        {item}
      </Text>
    </TouchableOpacity>
  );
  
  const renderPicker = (
    data: (string | number)[],
    selectedValue: string | number,
    onValueChange: (value: any) => void,
    scrollRef: RefObject<ScrollView | null>
  ) => (
    <View style={{ flex: 1, height: 250 }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: 100,
        }}
        onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
          onValueChange(data[clampedIndex]);
        }}
      >
        {data.map((item, index) =>
          renderPickerItem(
            item,
            index,
            item === selectedValue,
            () => {
              onValueChange(item);
              scrollRef.current?.scrollTo({
                y: index * ITEM_HEIGHT,
                animated: true,
              });
            }
          )
        )}
      </ScrollView>

      {/* Selection indicator */}
      <View style={{
        position: 'absolute',
        top: 125,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: textColor,
        opacity: 0.3,
      }} />
    </View>
  );
  
  // Initialize scroll positions when component mounts
  useEffect(() => {
    setTimeout(() => {
      const monthIndex = selectedMonth;
      const dayIndex = selectedDay - 1;
      const yearIndex = years.indexOf(selectedYear);
      
      monthScrollRef.current?.scrollTo({ y: monthIndex * ITEM_HEIGHT, animated: false });
      dayScrollRef.current?.scrollTo({ y: dayIndex * ITEM_HEIGHT, animated: false });
      yearScrollRef.current?.scrollTo({ y: yearIndex * ITEM_HEIGHT, animated: false });
    }, 100);
  }, []);
  
  // Update days when month or year changes
  useEffect(() => {
    const newDaysCount = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > newDaysCount) {
      setSelectedDay(newDaysCount);
    }
  }, [selectedMonth, selectedYear]);
  
  return (
    <View
      style={[
        {
          flexDirection: 'column',
          backgroundColor: 'rgba(30, 32, 44, 0.98)',
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: 18,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 8,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', height: 270 }}>
        {/* Month Picker */}
        <View style={{ flex: 2, marginRight: 12, alignItems: 'center' }}>
          <Text style={{ color: textColor, fontSize: 13, marginBottom: 8, letterSpacing: 1, fontFamily: 'Nunito-Bold', opacity: 0.7 }}>MONTH</Text>
          {renderPicker(
            months,
            months[selectedMonth],
            (month) => {
              const monthIndex = months.indexOf(month);
              setSelectedMonth(monthIndex);
            },
            monthScrollRef
          )}
        </View>

        {/* Day Picker */}
        <View style={{ flex: 1, marginRight: 12, alignItems: 'center' }}>
          <Text style={{ color: textColor, fontSize: 13, marginBottom: 8, letterSpacing: 1, fontFamily: 'Nunito-Bold', opacity: 0.7 }}>DAY</Text>
          {renderPicker(
            days,
            selectedDay,
            setSelectedDay,
            dayScrollRef
          )}
        </View>

        {/* Year Picker */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: textColor, fontSize: 13, marginBottom: 8, letterSpacing: 1, fontFamily: 'Nunito-Bold', opacity: 0.7 }}>YEAR</Text>
          {renderPicker(
            years,
            selectedYear,
            setSelectedYear,
            yearScrollRef
          )}
        </View>
      </View>

      {/* Decorative gradient overlay */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 32,
          backgroundColor: 'rgba(30,32,44,0.98)',
          zIndex: 2,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          opacity: 0.85,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 32,
          backgroundColor: 'rgba(30,32,44,0.98)',
          zIndex: 2,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          opacity: 0.85,
        }}
      />

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
        <TouchableOpacity
          onPress={onCancel}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 22,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginRight: 12,
          }}
        >
          <Text style={{ color: textColor, fontFamily: 'Nunito-Bold', fontSize: 16, letterSpacing: 1 }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSave && onSave(new Date(selectedYear, selectedMonth, selectedDay))}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 22,
            borderRadius: 16,
            backgroundColor: '#6C47FF',
          }}
        >
          <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16, letterSpacing: 1 }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDatePicker;