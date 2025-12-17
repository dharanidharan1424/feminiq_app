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
  | "newService"
  | "tips";

const notificationItems: { key: ToggleKeys; label: string }[] = [
  { key: "general", label: "General Notification" },
  { key: "sound", label: "Sound" },
  { key: "vibrate", label: "Vibrate" },
  { key: "special", label: "Special Offers" },
  { key: "promo", label: "Promo & Discount" },
  { key: "payments", label: "Payments" },
  { key: "cashback", label: "Cashback" },
  { key: "updates", label: "App Updates" },
  { key: "newService", label: "New Service Available" },
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
  tips: false,
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
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ padding: 20 }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
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

      {notificationItems.map((item) => (
        <View key={item.key} style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>{item.label}</Text>
          <Switch
            value={toggles[item.key]}
            onValueChange={() => handleToggle(item.key)}
            trackColor={{ false: "#eee", true: "#ff5acc" }}
            thumbColor={toggles[item.key] ? "#fff" : "#ccc"}
            ios_backgroundColor="#eee"
          />
        </View>
      ))}
    </ScrollView>
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
