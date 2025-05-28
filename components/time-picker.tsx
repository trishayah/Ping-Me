import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { StyleProp, TextStyle, ViewStyle } from 'react-native';

type TimePickerProps = {
  value?: Date;
  onTimeChange?: (date: Date) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  is24Hour?: boolean;
  disabled?: boolean;
};

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onTimeChange, 
  placeholder = "Select Time",
  style,
  textStyle,
  is24Hour = false,
  disabled = false 
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);



const handleTimeChange = (
    event: DateTimePickerEvent, 
    selectedTime?: Date | undefined
): void => {
    setShowTimePicker(false);

    // Only update if user didn't cancel (event.type !== 'dismissed')
    if (event.type === 'set' && selectedTime && onTimeChange) {
        onTimeChange(selectedTime);
    }
};

interface FormatTime {
    (time: Date | undefined): string;
}

const formatTime: FormatTime = (time) => {
    if (!time) return placeholder;

    return time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: !is24Hour 
    });
};

  return (
    <View>
      <TouchableOpacity 
        style={[styles.container, style, disabled && styles.disabled]} 
        onPress={() => !disabled && setShowTimePicker(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[
          styles.text, 
          textStyle,
          !value && styles.placeholder,
          disabled && styles.disabledText
        ]}>
          {formatTime(value)}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          is24Hour={is24Hour}
          display="default"
          onChange={handleTimeChange}
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

export default TimePicker;