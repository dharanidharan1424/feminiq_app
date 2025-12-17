import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/UserContext";

const SERVICE_DESCRIPTIONS: any = {
  "1": "Hair Styling",
  "2": "Makeup Artist",
  "3": "Manicure",
  "4": "Bridal Makeup",
  "5": "Mehndi Artist",
  "6": "Saree Draping",
  "8": "Pedicure",
  "9": "Skincare Specialist",
  "10": "Threading Expert",
};

const Specialist = () => {
  const { isDarkMode } = useAuth();
  const staffData = useLocalSearchParams();
  const specialists = Array.isArray(staffData) ? staffData : [staffData];

  const getServiceName = (id: any) =>
    SERVICE_DESCRIPTIONS[String(id)] || "Service";

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <View
        className={`flex-row items-center pt-4 pb-3 px-4 border-b ${
          isDarkMode
            ? "border-gray-700 bg-gray-900"
            : "border-gray-100 bg-white"
        }`}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDarkMode ? "white" : "black"}
          style={{ marginRight: 10 }}
          onPress={() => router.back()}
        />
        <Text
          className={`flex-1 text-lg font-poppins-semibold ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Our Specialist
        </Text>
      </View>

      {/* Specialists List */}
      <FlatList
        data={specialists}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-center px-4 py-3 mx-2 mt-3 rounded-xl shadow-sm border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <Image
              source={{ uri: item.mobile_image_url || item.image }}
              className="w-14 h-14 rounded-full mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <View className="flex-row items-center mt-0.5">
                <Text
                  className={`font-poppins-semibold text-base ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  {item.name}
                </Text>
              </View>
              <Text className="text-[#FF5ACC] font-poppins-regular text-[13px]">
                {getServiceName(item.service_id)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text
            className={`text-center mt-6 font-poppins-regular ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No specialists found.
          </Text>
        }
      />
    </View>
  );
};

export default Specialist;
