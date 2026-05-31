import React, { useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from "../../app/ScppThemeContext"
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DonutChart = ({
  percentage = 0,
  size = 200,
  strokeWidth = 20,
  duration = 700,
  label = 'Progress',
  animationDelay = 0
}) => {
  const validPercentage = Math.max(0, Math.min(parseFloat(percentage) || 0, 100));
  const animatedPercentage = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const theme = useTheme();

  const animateChart = useCallback(() => {
    animatedPercentage.value = animatedPercentage.value - 5; // backup a bit, dont go to 0 looks ugly
    animatedPercentage.value = withDelay(animationDelay, withTiming(validPercentage, {
      duration,
      easing: Easing.out(Easing.cubic),
    }));
  }, [validPercentage, duration, animatedPercentage, animationDelay]);

  useEffect(() => {
    animateChart();

    return () => {
      cancelAnimation(animatedPercentage);
    };
  }, [animateChart]);

  // Re-animate when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      animateChart();

      return () => {
        cancelAnimation(animatedPercentage);
      };
    }, [animateChart])
  );

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return {
      strokeDashoffset: circumference * (1 - animatedPercentage.value / 100),
    };
  });

  const progressColor = useMemo(() => {
    // Matte green: rgb(76, 175, 80)
    // Matte yellow: rgb(255, 235, 59)
    // Matte red: rgb(211, 47, 47)
    const value = validPercentage;

    if (value <= 50) {
      // Interpolate between matte green and matte yellow
      const r = Math.round(76 + (255 - 76) * (value / 50));
      const g = Math.round(175 + (235 - 175) * (value / 50));
      const b = Math.round(80 + (59 - 80) * (value / 50));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (value <= 100) {
      // Interpolate between matte yellow and matte red
      const factor = (value - 50) / 50;
      const r = Math.round(255 + (211 - 255) * factor);
      const g = Math.round(235 + (47 - 235) * factor);
      const b = Math.round(59 + (47 - 59) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    }
    // For values over 100%, return matte red
    return 'rgb(211, 47, 47)';
  }, [validPercentage]);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.onSecondary}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentageText, { color: theme.colors.onBackground }]}>{`${Math.round(percentage)}%`}</Text>
        <Text style={[styles.labelText, { color: theme.colors.onBackground }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 16,
  },
});

export default DonutChart;