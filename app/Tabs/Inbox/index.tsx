import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/context/UserContext";
import Calls from "./Calls";
import Chats from "./Chats";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Index: React.FC = () => {
  const { isDarkMode } = useAuth();
  const [activeTab, setActiveTab] = useState<"Chats" | "Calls">("Chats");

  return (
    <View className="flex-1 pt-5">
      <View
        className="flex-row items-center justify-between px-5 mb-8"
        style={{
          borderBottomColor: isDarkMode ? "#444" : "#eee",
        }}
      >
        <View className="flex-row">
          <Text
            style={{
              color: isDarkMode ? "#eee" : "#000",
            }}
            className="font-poppins-semibold text-2xl gap-10"
          >
            Inbox
          </Text>
        </View>
        <Ionicons
          name="search"
          size={20}
          onPress={() => router.replace("/Tabs")}
          style={{ color: isDarkMode ? "#eee" : "#000" }}
        />
      </View>
      <View
        style={{
          borderBottomColor: isDarkMode ? "#444" : "#eee",
          borderBottomWidth: 1,
          paddingBottom: 20,
        }}
        className="flex-row justify-between gap-5 rounded-2xl mx-4"
      >
        <TouchableOpacity
          onPress={() => setActiveTab("Chats")}
          className={`flex-row items-center justify-center flex-1 py-2 gap-2 rounded-full border-2 border-primary ${
            activeTab === "Chats" ? "bg-primary" : "bg-primary/20"
          }`}
        >
          <Ionicons
            name="chatbox-ellipses"
            size={16}
            color={activeTab === "Chats" ? "white" : "#FF5ACC"}
          />
          <Text
            className={`text-center font-poppins-semibold text-base ${
              activeTab === "Chats" ? "text-white" : "text-primary"
            }`}
          >
            Chats
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Chats" ? <Chats /> : <Calls />}

      {/* Show token for debugging */}
    </View>
  );
};

export default Index;
