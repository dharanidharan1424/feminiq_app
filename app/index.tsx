/* eslint-disable react-hooks/rules-of-hooks */
import WelcomeScreen from "@/screens/WelcomeScreen";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform, View } from "react-native";

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



  return (
    <View className="flex-1">
      <WelcomeScreen />
    </View>
  );
};

export default index;
