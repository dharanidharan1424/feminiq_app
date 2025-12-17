import React from "react";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";

interface PaginatorProps {
  data: { id: string }[];
  scrollX: Animated.Value;
  color: string;
}

const Paginator: React.FC<PaginatorProps> = ({ data, scrollX, color }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={{ flexDirection: "row", height: 30 }}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
        });

        return (
          <Animated.View
            key={i.toString()}
            style={[
              styles.dot,
              { width: dotWidth, opacity, backgroundColor: color },
            ]}
          />
        );
      })}
    </View>
  );
};

export default Paginator;

const styles = StyleSheet.create({
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
});
