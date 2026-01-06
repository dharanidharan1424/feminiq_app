import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import "../globals.css";

import { useAuth } from "@/context/UserContext";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Wave } from "react-native-animated-spinkit";

const _layout = () => {
  const { isDarkMode } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: isDarkMode ? "#222" : "white" }}
      >
        <Wave size={60} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDarkMode ? "#222" : "white"
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ReviewDetials" />
      <Stack.Screen name="Specialist" />
    </Stack>
  );
};

export default _layout;