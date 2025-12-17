import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface LoadingIndicatorProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  seconds?: number; // countdown seconds
  onComplete?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 100,
  strokeWidth = 8,
  color = "#FF5ACC",
  bgColor = "#f2f2f2",
  seconds = 30,
  onComplete,
}) => {
  const rotation = useSharedValue(0);
  const [countdown, setCountdown] = useState(seconds);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    setCountdown(seconds);
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>

      {/* Animated Foreground Arc */}
      <AnimatedView
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
          },
          animatedStyle,
        ]}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference / 3}
            strokeLinecap="round"
          />
        </Svg>
      </AnimatedView>

      {/* Countdown Text in center */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={[styles.countdownText, { fontSize: size / 3, color }]}>
          {countdown}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontWeight: "bold",
  },
});
