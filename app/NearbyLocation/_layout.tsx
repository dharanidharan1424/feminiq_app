/* eslint-disable react-hooks/rules-of-hooks */
import { View, Text } from "react-native";
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/UserContext";

const _layout = () => {
  const { isDarkMode } = useAuth();
  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: isDarkMode ? "#222" : "white",
        paddingVertical: 20,
      }}
    >
      <View className="flex-1">
        <Slot />
      </View>
    </SafeAreaView>
  );
};

export default _layout;
