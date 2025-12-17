/* eslint-disable react-hooks/rules-of-hooks */
import { Slot } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";
import "./globals.css";

import { AuthProvider } from "@/context/UserContext";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Wave } from "react-native-animated-spinkit";
import { SafeAreaView } from "react-native-safe-area-context";

const _layout = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <Wave size={60} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View className="flex-1">
        <Slot />
      </View>
    </AuthProvider>
  );
};

export default _layout;
