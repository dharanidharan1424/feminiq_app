import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView, View } from "react-native";

const _layout = () => {
  return (
    <SafeAreaView className="flex-1">
      <Slot />
    </SafeAreaView>
  );
};

export default _layout;
