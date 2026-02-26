import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Path, Skia, Circle, interpolateColors } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../app/ScppThemeContext';

// Pre-define colors outside component for performance
const GREEN = Skia.Color('#4CAF50');
const YELLOW = Skia.Color('#FFEB3B');
const RED = Skia.Color('#D32F2F');

const DonutChart = ({
  percentage = 0,
  size = 200,
  strokeWidth = 20,
  duration = 700,
  label = 'Progress',
  animationDelay = 0,
}) => {
  const validPercentage = Math.max(0, Math.min(parseFloat(percentage) || 0, 100));
  const animatedPercentage = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const theme = useTheme();

  useEffect(() => {
    // Small backup for visual effect
    animatedPercentage.value = Math.max(0, animatedPercentage.value - 5);
    animatedPercentage.value = withDelay(
      animationDelay,
      withTiming(validPercentage, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [validPercentage, animationDelay, duration]);

  // Create animated path for the progress arc
  const progressPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const sweepAngle = (animatedPercentage.value / 100) * 360;

    if (sweepAngle > 0) {
      path.addArc(
        {
          x: strokeWidth / 2,
          y: strokeWidth / 2,
          width: size - strokeWidth,
          height: size - strokeWidth,
        },
        -90, // Start from top
        sweepAngle
      );
    }
    return path;
  });

  // Animated color using Skia's interpolateColors
  const progressColor = useDerivedValue(() => {
    return interpolateColors(
      animatedPercentage.value,
      [0, 50, 100],
      [GREEN, YELLOW, RED]
    );
  });

  // Background circle color
  const bgColor = useMemo(() => Skia.Color(theme.colors.onSecondary || '#E0E0E0'), [theme.colors.onSecondary]);

  return (
    <View style={styles.container}>
      <Canvas style={{ width: size, height: size }}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={strokeWidth}
          color={bgColor}
        />
        {/* Animated progress arc */}
        <Path
          path={progressPath}
          style="stroke"
          strokeWidth={strokeWidth}
          color={progressColor}
          strokeCap="round"
        />
      </Canvas>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentageText, { color: theme.colors.onBackground }]}>
          {`${Math.round(percentage)}%`}
        </Text>
        <Text style={[styles.labelText, { color: theme.colors.onBackground }]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  labelText: {
    fontSize: 16,
    lineHeight: 18,
    marginTop: -2,
  },
});

export default DonutChart;
