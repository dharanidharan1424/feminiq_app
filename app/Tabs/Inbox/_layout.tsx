/* eslint-disable react-hooks/rules-of-hooks */
import { Slot, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import "../../globals.css";

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
  const router = useRouter();
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
    <>
      <View
        className="flex-1"
        style={{ backgroundColor: isDarkMode ? "#222" : "white" }}
      >
        <Slot />
      </View>
    </>
  );
};

export default _layout;
