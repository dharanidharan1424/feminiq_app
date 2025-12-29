import { Slot } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const _layout = () => {
  return (
    <View className="flex-1">
      
      <Slot />
    </View>
  );
};

export default _layout;
