import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { StyleProp, TextStyle, ViewStyle } from 'react-native';

type DatePickerProps = {
  value?: Date;
  onDateChange?: (date: Date) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'datetime' | 'time';
  disabled?: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onDateChange, 
  placeholder = "Select Date",
  style,
  textStyle,
  minimumDate,
  maximumDate,
  mode = "date",
  disabled = false 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (
    event: DateTimePickerEvent, 
    selectedDate?: Date | undefined
  ): void => {
    setShowDatePicker(false);

    // Only update if user didn't cancel (event.type !== 'dismissed')
    if (event.type === 'set' && selectedDate && onDateChange) {
      onDateChange(selectedDate);
    }
  };

  interface FormatDate {
    (date: Date | undefined): string;
  }

  const formatDate: FormatDate = (date) => {
    if (!date) return placeholder;

    if (mode === 'datetime') {
      return date.toLocaleString([], { 
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } else if (mode === 'time') {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <View>
      <TouchableOpacity 
        style={[styles.container, style, disabled && styles.disabled]} 
        onPress={() => !disabled && setShowDatePicker(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[
          styles.text, 
          textStyle,
          !value && styles.placeholder,
          disabled && styles.disabledText
        ]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
  placeholder: {
    color: "#9ca3af",
  },
  disabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  disabledText: {
    color: "#9ca3af",
  },
});

export default DatePicker;