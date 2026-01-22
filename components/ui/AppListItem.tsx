import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/ScppThemeContext';

type AppListItemProps = {
  title: string;
  description?: string;
  onPress?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
};

export const AppListItem: React.FC<AppListItemProps> = ({
  title,
  description,
  onPress,
  left,
  right,
  leftIcon,
  rightIcon,
  style,
}) => {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { borderBottomColor: colors.outlineVariant },
        style,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {left || (leftIcon && (
        <MaterialCommunityIcons
          name={leftIcon}
          size={24}
          color={colors.onSurfaceVariant}
          style={styles.leftIcon}
        />
      ))}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        {description && (
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {description}
          </Text>
        )}
      </View>
      {right || (rightIcon && (
        <MaterialCommunityIcons
          name={rightIcon}
          size={24}
          color={colors.onSurfaceVariant}
          style={styles.rightIcon}
        />
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftIcon: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  rightIcon: {
    marginLeft: 16,
  },
});

export default AppListItem;
