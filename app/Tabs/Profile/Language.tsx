import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SUGGESTED = ["English (IN)"];
// const LANGUAGES = [
//   // "Tamil",
//   // "Hindi",
//   // "Malayalam",
//   // "Telugu",
//   // "Arabic",
//   // "Urdu",
//   // "Kannada",
//   // "Marati",
// ];

const Language = () => {
  const { language, setLanguage, isDarkMode } = useAuth();

  const groups = [
    { title: "Suggested", items: SUGGESTED },
    // { title: "Language", items: LANGUAGES },
  ];

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#222";
  const borderColor = isDarkMode ? "#444" : "#f0f0f0";

  return (
    <View style={{ flex: 1, backgroundColor, padding: 16 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={textColor} />
      </TouchableOpacity>

      <Text style={[styles.header, { color: textColor }]}>Language</Text>

      {groups.map((group) => (
        <View key={group.title} style={{ marginTop: 20 }}>
          <Text style={[styles.section, { color: textColor }]}>
            {group.title}
          </Text>
          {group.items.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.row, { borderBottomColor: borderColor }]}
              onPress={() => {
                setLanguage(item);
                router.back();
              }}
            >
              <Text style={[styles.text, { color: textColor }]}>{item}</Text>
              <Ionicons
                name={
                  language === item ? "radio-button-on" : "radio-button-off"
                }
                size={22}
                color="#e75486"
              />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  section: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});

export default Language;
