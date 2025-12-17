/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useGlobalSearchParams, Slot } from "expo-router";
import { useAuth } from "@/context/UserContext";
import { Wave } from "react-native-animated-spinkit";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";

const PRIMARY_LIGHT = "#FF5ACC";

const _layout = () => {
  const router = useRouter();
  const { isDarkMode } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { service_name } = useGlobalSearchParams<{ service_name?: string }>();
  const [pageTitle, setPageTitle] = useState("Hair");

  useEffect(() => {
    if (service_name) {
      setPageTitle(service_name);
    }
  }, [service_name]);

  if (!fontsLoaded) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: isDarkMode ? "#222" : "white" }}
      >
        <Wave size={60} color={PRIMARY_LIGHT} />
      </View>
    );
  }

  BackHandler.addEventListener("hardwareBackPress", () => {
    router.push("/Tabs");
    return true;
  });

  return (
    <>
      <View
        className="flex-row items-center justify-between px-4 mt-5"
        style={{
          borderBottomColor: isDarkMode ? "#444" : "#eee",
          borderBottomWidth: 1,
          paddingVertical: 10,
          paddingTop: 20,
          backgroundColor: isDarkMode ? "#222" : "white",
        }}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="arrow-back"
            size={24}
            onPress={() => router.back()}
            style={{ paddingRight: 10, color: isDarkMode ? "#fff" : "#000" }}
          />
          <Text
            style={{ color: isDarkMode ? "#fff" : "#000" }}
            className="font-poppins-semibold text-2xl"
          >
            {pageTitle}
          </Text>
        </View>

        {/* Sort Dropdown Button */}
      </View>

      <View className="flex-1">
        <Slot />
      </View>

      {/* Sort Dropdown List */}
    </>
  );
};

export default _layout;
