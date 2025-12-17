// BubbleScatter.js
import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";

const BubbleScatter = ({
  bubbleCount = 8,
  radius = 80,
  size = 15,
  color = "#FF5ACC",
  loop = true,
  duration = 1500,
}) => {
  const animations = useRef(
    Array.from({ length: bubbleCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const anims = animations.map((anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration + Math.random() * 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      )
    );

    if (loop) anims.forEach((a) => a.start());
    else {
      anims.forEach((a: any) =>
        Animated.timing(a, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start()
      );
    }

    return () => {
      anims.forEach((a) => a.stop && a.stop());
    };
  }, []);

  return (
    <View style={[{ position: "absolute" }]}>
      {animations.map((anim, i) => {
        const angle = (i / bubbleCount) * (2 * Math.PI);
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * radius],
        });
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * radius],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        });
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.5],
        });

        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: 999,
              backgroundColor: color,
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

export default BubbleScatter;
