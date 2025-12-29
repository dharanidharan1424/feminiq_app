import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ToggleKeys =
  | "general"
  | "sound"
  | "vibrate"
  | "special"
  | "promo"
  | "payments"
  | "cashback"
  | "updates"
  | "newService";

const notificationItems: {
  key: ToggleKeys;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
    { key: "general", label: "General Notification", icon: "notifications-outline" },
    { key: "sound", label: "Sound", icon: "volume-high-outline" },
    { key: "vibrate", label: "Vibrate", icon: "notifications-outline" },
    { key: "special", label: "Special Offers", icon: "gift-outline" },
    { key: "promo", label: "Promo & Discount", icon: "pricetag-outline" },
    { key: "payments", label: "Payments", icon: "card-outline" },
    { key: "cashback", label: "Cashback", icon: "wallet-outline" },
    { key: "updates", label: "App Updates", icon: "cloud-download-outline" },
    { key: "newService", label: "New Service Available", icon: "add-circle-outline" },
  ];

const initialToggleState: Record<ToggleKeys, boolean> = {
  general: true,
  sound: true,
  vibrate: false,
  special: true,
  promo: false,
  payments: true,
  cashback: false,
  updates: true,
  newService: false,
};

const Notification: React.FC = () => {
  const { isDarkMode } = useAuth();
  const [toggles, setToggles] =
    React.useState<Record<ToggleKeys, boolean>>(initialToggleState);

  const handleToggle = (key: ToggleKeys) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#222";

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={textColor}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Poppins_600SemiBold",
              color: textColor,
            }}
          >
            Notification
          </Text>
        </View>

        <View style={{ gap: 4 }}>
          {notificationItems.map((item) => (
            <View key={item.key} style={styles.row}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isDarkMode ? "#FF85C3" : "#FF5ACC"}
                  style={{ marginRight: 12 }}
                />
                <Text style={[styles.label, { color: textColor }]}>{item.label}</Text>
              </View>
              <Switch
                value={toggles[item.key]}
                onValueChange={() => handleToggle(item.key)}
                trackColor={{ false: "#ddd", true: "#ff5acc" }}
                thumbColor={toggles[item.key] ? "#fff" : "#ccc"}
                ios_backgroundColor="#eee"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    flex: 1,
  },
  notifCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#fff", // white background for card
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  notifMessage: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    marginTop: 8,
  },
});

export default Notification;
