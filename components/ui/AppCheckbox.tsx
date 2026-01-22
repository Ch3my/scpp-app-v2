import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/ScppThemeContext';

type CheckboxStatus = 'checked' | 'unchecked' | 'indeterminate';

type AppCheckboxProps = {
  status: CheckboxStatus;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  uncheckedColor?: string;
  style?: ViewStyle;
};

export const AppCheckbox: React.FC<AppCheckboxProps> = ({
  status,
  onPress,
  disabled = false,
  color,
  uncheckedColor,
  style,
}) => {
  const theme = useTheme();
  const colors = theme.colors;

  const getIconName = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (status) {
      case 'checked':
        return 'checkbox-marked';
      case 'indeterminate':
        return 'minus-box';
      case 'unchecked':
      default:
        return 'checkbox-blank-outline';
    }
  };

  const getIconColor = (): string => {
    if (disabled) return colors.onSurface + '61';
    if (status === 'checked' || status === 'indeterminate') {
      return color || colors.primary;
    }
    return uncheckedColor || colors.onSurfaceVariant;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={getIconName()}
        size={24}
        color={getIconColor()}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});

export default AppCheckbox;
