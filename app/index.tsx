/* eslint-disable react-hooks/rules-of-hooks */
import { useAuth } from "@/context/UserContext";
import WelcomeScreen from "@/screens/WelcomeScreen";
import * as Notifications from "expo-notifications";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { Wave } from "react-native-animated-spinkit";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const index = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      }).catch(console.error);
    }
  }, []);

  // Wait a brief moment for the token to load from AsyncStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Wave size={60} color="#FF5ACC" />
      </View>
    );
  }

  // If user is logged in, redirect to main app
  if (token) {
    return <Redirect href="/Tabs" />;
  }

  // Otherwise, show welcome screen
  return (
    <View className="flex-1">
      <WelcomeScreen />
    </View>
  );
};

export default index;
