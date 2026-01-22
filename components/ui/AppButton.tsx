import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/ScppThemeContext';

type ButtonMode = 'contained' | 'contained-tonal' | 'outlined' | 'text';

type AppButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  mode?: ButtonMode;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  contentStyle?: ViewStyle;
};

export const AppButton: React.FC<AppButtonProps> = ({
  onPress,
  children,
  mode = 'contained',
  icon,
  disabled = false,
  loading = false,
  style,
  labelStyle,
  contentStyle,
}) => {
  const theme = useTheme();
  const colors = theme.colors;

  const getButtonStyles = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (mode) {
      case 'contained':
        return {
          ...base,
          backgroundColor: disabled ? colors.onSurface + '1F' : colors.primary,
        };
      case 'contained-tonal':
        return {
          ...base,
          backgroundColor: disabled ? colors.onSurface + '1F' : colors.secondaryContainer,
        };
      case 'outlined':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.onSurface + '1F' : colors.outline,
        };
      case 'text':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      default:
        return base;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.onSurface + '61';

    switch (mode) {
      case 'contained':
        return colors.onPrimary;
      case 'contained-tonal':
        return colors.onSecondaryContainer;
      case 'outlined':
      case 'text':
        return colors.primary;
      default:
        return colors.onPrimary;
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={textColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, { color: textColor }, labelStyle]}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

export default AppButton;
