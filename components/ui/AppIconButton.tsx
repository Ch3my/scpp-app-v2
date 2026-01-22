import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/ScppThemeContext';

type IconButtonMode = 'contained' | 'contained-tonal' | 'outlined' | 'standard';

type AppIconButtonProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  mode?: IconButtonMode;
  size?: number;
  iconColor?: string;
  containerColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  onPress,
  mode = 'standard',
  size = 24,
  iconColor,
  containerColor,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const colors = theme.colors;

  const getContainerStyle = (): ViewStyle => {
    const buttonSize = size + 16;
    const base: ViewStyle = {
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (containerColor) {
      return { ...base, backgroundColor: containerColor };
    }

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
      case 'standard':
      default:
        return {
          ...base,
          backgroundColor: 'transparent',
        };
    }
  };

  const getIconColor = (): string => {
    if (iconColor) return iconColor;
    if (disabled) return colors.onSurface + '61';

    switch (mode) {
      case 'contained':
        return colors.onPrimary;
      case 'contained-tonal':
        return colors.onSecondaryContainer;
      case 'outlined':
      case 'standard':
      default:
        return colors.onSurfaceVariant;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getContainerStyle(), style]}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={icon}
        size={size}
        color={getIconColor()}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

export default AppIconButton;
