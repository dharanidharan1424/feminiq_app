import { View, Text } from "react-native";
import React from "react";
import { Slot } from "expo-router";

const _layout = () => {
  return (
    <View className="flex-1">
      <Slot />
    </View>
  );
};

export default _layout;
