import React from "react";
import { Slot } from "expo-router";

import { View } from "react-native";

const _layout = () => {
  return (
    <View className="flex-1 bg-white">
      <Slot />
    </View>
  );
};

export default _layout;
