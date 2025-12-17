/* eslint-disable react-hooks/rules-of-hooks */
import { Slot, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../globals.css";

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

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Wave size={60} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          <Slot />
        </View>
      </SafeAreaView>
    </>
  );
};

export default _layout;
