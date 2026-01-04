import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Pulse } from "react-native-animated-spinkit";

interface ServiceCategory {
  id: number;
  name: string;
  typeCount?: number;
  mobile_images_url: string;
}

const ServicesView = () => {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(false);
  const { isDarkMode } = useAuth();

  const handleCardPress = (serviceId: number, name: string) => {
    router.push({
      pathname: "/Details/ServiceType",
      params: { serviceId, name },
    });
  };

  useEffect(() => {
    fetch("https://femiiniq-backend.onrender.com/api/service-categories")
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#121212" : "#fff",
        }}
      >
        <Pulse size={50} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: isDarkMode ? "#121212" : "#fff",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={26}
            color={isDarkMode ? "#fff" : "#232323"}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: 22,
            color: isDarkMode ? "#fff" : "#232323",
          }}
        >
          Our Services
        </Text>

        <TouchableOpacity
          onPress={() => setIsGridView(!isGridView)}
          style={{
            backgroundColor: "#FF5ACC",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons
            name={isGridView ? "list" : "grid"}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isGridView ? (
        <FlatList
          data={services}
          key={"GRID"}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 15,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCardPress(item.id, item.name)}
              style={{
                backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                borderRadius: 12,
                padding: 12,
                width: "48%",
                elevation: 2,
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: item.mobile_images_url }}
                style={{
                  width: 80,
                  height: 70,
                  borderRadius: 4,
                  marginBottom: 6,
                  backgroundColor: "#eee",
                }}
                resizeMode="cover"
              />

              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 16,
                  color: isDarkMode ? "#fff" : "#232323",
                  marginBottom: 4,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 14,
                  color: "#FF5ACC",
                }}
              >
                {item.typeCount ? `${item.typeCount} types` : "4 Types"}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={{
                backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                paddingVertical: 18,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                elevation: 2,
                borderWidth: 1,
                borderColor: isDarkMode ? "#333" : "#eee",
              }}
              onPress={() => handleCardPress(service.id, service.name)}
            >
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 16,
                  color: isDarkMode ? "#fff" : "#232323",
                }}
              >
                {service.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: 15,
                    color: "#FF5ACC",
                    marginRight: 5,
                  }}
                >
                  {service.typeCount ? `${service.typeCount} types` : "4 Types"}
                </Text>
                <Ionicons name="chevron-forward" color={"#FF5ACC"} size={20} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ServicesView;
