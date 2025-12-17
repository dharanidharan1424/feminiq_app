import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Pulse } from "react-native-animated-spinkit";

interface ServiceCategory {
  id: number;
  name: string;
  typeCount?: number;
}

const Services: React.FC = () => {
  const { isDarkMode } = useAuth();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCardPress = (serviceId: number, name: string) => {
    router.push({
      pathname: "/Details/ServiceType",
      params: { serviceId, name },
    });
  };

  useEffect(() => {
    fetch("https://feminiq-backend.onrender.com/api/service-categories")
      .then((res) => res.json())
      .then((json) => {
        setServices(json.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setServices([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Pulse size={50} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
      <View
        style={{ marginBottom: 20 }}
        className={`flex-row justify-between items-center border-b pb-3 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Poppins_600SemiBold",
            color: isDarkMode ? "#f5f5f5" : "#232323",
          }}
        >
          Our Services
        </Text>
        <TouchableOpacity onPress={() => router.push("/Details/ServicesView")}>
          <Text
            className={`text-md font-poppins-medium ${
              isDarkMode ? "text-pink-400" : "text-primary"
            }`}
          >
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {services.length === 0 && (
        <Text
          className="font-poppins-semibold"
          style={{ color: isDarkMode ? "#aaa" : "#888" }}
        >
          No services available.
        </Text>
      )}

      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          className={`border-[1px] ${
            isDarkMode ? "border-gray-700" : "border-gray-100"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
            paddingVertical: 18,
            paddingHorizontal: 16,
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            elevation: isDarkMode ? 0 : 2,
          }}
          onPress={() => {
            handleCardPress(service.id, service.name);
          }}
        >
          <Text
            className="font-poppins-semibold"
            style={{
              fontSize: 16,
              color: isDarkMode ? "#f5f5f5" : "#232323",
            }}
          >
            {service.name}
          </Text>
          <View className="flex-row">
            <Text
              className={`font-poppins-regular ${
                isDarkMode ? "text-pink-400" : "text-primary"
              }`}
              style={{ fontSize: 15 }}
            >
              {service.typeCount ? `${service.typeCount} types` : "4 Types"}
            </Text>
            <Ionicons
              name="chevron-forward"
              color={isDarkMode ? "#f472b6" : "#FF5ACC"}
              size={20}
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Services;
