import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type DatePickerProps = {
  value?: Date;
  onDateChange?: (date: Date) => void;
  placeholder?: string;
  style?: object;
  textStyle?: object;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  mode?: "date" | "datetime" | "time";
};

const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onDateChange, 
  placeholder = "Select Date",
  style,
  textStyle,
  minimumDate,
  maximumDate,
  disabled = false,
  mode = "date" // "date", "datetime", "time"
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);


const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined
): void => {
    setShowDatePicker(false);
    
    // Only update if user didn't cancel (event.type !== 'dismissed')
    if (event.type !== 'dismissed' && selectedDate && onDateChange) {
        onDateChange(selectedDate);
    }
};

interface FormatDateOptions {
    year: 'numeric';
    month: 'long';
    day: 'numeric';
}

const formatDate = (date: Date | undefined, placeholder?: string): string => {
    if (!date) return placeholder ?? '';
    
    const options: FormatDateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString([], options);
};

interface FormatDateTimeOptions {
    year: 'numeric';
    month: 'short';
    day: 'numeric';
}

interface FormatTimeOptions {
    hour: '2-digit';
    minute: '2-digit';
}

const formatDateTime = (date: Date | undefined, placeholder?: string): string => {
    if (!date) return placeholder ?? '';

    const dateOptions: FormatDateTimeOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    const timeOptions: FormatTimeOptions = { 
        hour: '2-digit', 
        minute: '2-digit' 
    };

    return `${date.toLocaleDateString([], dateOptions)} at ${date.toLocaleTimeString([], timeOptions)}`;
};

  const getDisplayText = () => {
    if (mode === "datetime") {
      return formatDateTime(value, placeholder);
    }
    return formatDate(value), placeholder;
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
          {getDisplayText()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
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