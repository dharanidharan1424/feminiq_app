/* eslint-disable react-hooks/rules-of-hooks */
import { Slot, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css";

import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";

const _layout = () => {
  const router = useRouter();
  const { isDarkMode } = useAuth();

  return (
    <>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDarkMode ? "#222" : "white" }}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{
            borderBottomColor: isDarkMode ? "#444" : "#eee",
            borderBottomWidth: 1,
            paddingVertical: 5,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            onPress={() => router.back()}
            style={{ paddingRight: 10, color: isDarkMode ? "#eee" : "#000" }}
          />
          <Ionicons
            name="home"
            size={20}
            onPress={() => router.replace("/Tabs")}
            style={{ color: isDarkMode ? "#eee" : "#000" }}
          />
        </View>

        <View className="flex-1">
          <Slot />
        </View>
      </SafeAreaView>
    </>
  );
};

export default _layout;
