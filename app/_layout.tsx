/* eslint-disable react-hooks/rules-of-hooks */
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import "./globals.css";

import { AuthProvider } from "@/context/UserContext";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Wave } from "react-native-animated-spinkit";

const _layout = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Clear corrupted navigation state
  useEffect(() => {
    const clearNavigationState = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const navKeys = keys.filter(key =>
          key.includes('NAVIGATION') ||
          key.includes('navigation') ||
          key.includes('@react-navigation')
        );

        if (navKeys.length > 0) {
          await AsyncStorage.multiRemove(navKeys);
          console.log('✅ Cleared navigation states:', navKeys);
        }
      } catch (error) {
        console.error('❌ Failed to clear navigation state:', error);
      }
    };

    // Run once on app start
    clearNavigationState();
  }, []);

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