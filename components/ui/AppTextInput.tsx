import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/ScppThemeContext';

type InputMode = 'flat' | 'outlined';

type AppTextInputProps = TextInputProps & {
  label?: string;
  mode?: InputMode;
  dense?: boolean;
  error?: boolean;
  disabled?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
};

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  mode = 'outlined',
  dense = false,
  error = false,
  disabled = false,
  left,
  right,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const theme = useTheme();
  const colors = theme.colors;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = (): string => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.outline;
  };

  const getLabelColor = (): string => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.onSurfaceVariant;
  };

  const containerStyle: ViewStyle = {
    borderRadius: mode === 'outlined' ? 4 : 0,
    borderWidth: mode === 'outlined' ? (isFocused ? 2 : 1) : 0,
    borderBottomWidth: mode === 'flat' ? (isFocused ? 2 : 1) : undefined,
    borderColor: getBorderColor(),
    backgroundColor: mode === 'flat' ? colors.surfaceVariant : 'transparent',
    paddingHorizontal: 12,
    paddingTop: label ? (dense ? 20 : 24) : (dense ? 8 : 12),
    paddingBottom: dense ? 8 : 12,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={containerStyle}>
        {label && (
          <Text style={[styles.label, { color: getLabelColor() }]}>
            {label}
          </Text>
        )}
        <View style={styles.inputRow}>
          {left}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            style={[
              styles.input,
              { color: colors.onSurface },
              inputStyle,
            ]}
            placeholderTextColor={colors.onSurfaceVariant}
            {...textInputProps}
          />
          {right}
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons
                name={rightIcon}
                size={24}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  label: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default AppTextInput;
