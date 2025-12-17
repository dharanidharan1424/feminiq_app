import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Wave } from "react-native-animated-spinkit";
import { useAuth } from "@/context/UserContext";
import ServiceCard from "@/components/ServiceCard";

interface ServiceTypeData {
  id: number;
  category_id: number;
  name: string;
  image: string;
  booked: number;
  price: string;
  original_price: string | null;
  staff_id: number;
  discount_price: string | null;
  duration: string;
  description: string;
  procedure: string;
  mobile_url: string;
}

const ServiceType: React.FC = () => {
  const { token, showToast, isDarkMode } = useAuth();
  const { serviceId, name } = useLocalSearchParams();
  const [services, setServices] = useState<ServiceTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<ServiceTypeData[]>(
    []
  );
  const [bookmarkedServices, setBookmarkedServices] = useState<
    ServiceTypeData[]
  >([]);

  const [modalDetail, setModalDetail] = useState<ServiceTypeData | null>(null);

  useEffect(() => {
    const loadSelectedServices = async () => {
      if (!token) return;
      try {
        const stored = await AsyncStorage.getItem(`selectedServices_${token}`);
        const services = stored ? JSON.parse(stored) : [];
        setSelectedServices(services);
      } catch (e) {
        console.error("Failed to load selected services", e);
      }
    };
    loadSelectedServices();
  }, [token]);

  const toggleBookmark = async (service: ServiceTypeData) => {
    if (!token) return;

    const isBookmarked =
      bookmarkedServices.find((s) => s.id === service.id) !== undefined;

    let updatedBookmarks = [];
    if (isBookmarked) {
      updatedBookmarks = bookmarkedServices.filter((s) => s.id !== service.id);
      showToast("Removed from bookmarks", "remove", "bottom");
    } else {
      updatedBookmarks = [...bookmarkedServices, service];
      showToast("Added to bookmarks", "success", "bottom");
    }

    setBookmarkedServices(updatedBookmarks);
    await AsyncStorage.setItem(
      `bookmarkedServices_${token}`,
      JSON.stringify(updatedBookmarks)
    );
  };

  useEffect(() => {
    if (serviceId) {
      fetch(`https://feminiq-backend.onrender.com/api/get-types`)
        .then((res) => res.json())
        .then((json) => {
          const filteredServices =
            json.data?.filter(
              (data: ServiceTypeData) =>
                Number(data.category_id) === Number(serviceId)
            ) || [];
          setServices(filteredServices);
        })
        .finally(() => setLoading(false));
    }
  }, [serviceId]);

  const goToBookedServices = () => {
    router.push("/Cart");
  };

  BackHandler.addEventListener("hardwareBackPress", () => {
    router.back();
    return true;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <Wave size={50} color="#FF5ACC" />
      </View>
    );
  }

  if (services.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No services found for this category.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#121212" : "#fff",
      }}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            borderBottomColor: isDarkMode ? "#333" : "#eee",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={isDarkMode ? "#f5f5f5" : "#FF5ACC"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? "#f5f5f5" : "#232323" },
          ]}
        >
          {name || "Service Type"}
        </Text>
        <TouchableOpacity
          onPress={goToBookedServices}
          style={{ marginLeft: "auto", paddingRight: 12 }}
          accessibilityRole="button"
        >
          <Ionicons
            name="cart"
            size={28}
            color={isDarkMode ? "#f5f5f5" : "#FF5ACC"}
          />
          {selectedServices.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {selectedServices.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          backgroundColor: isDarkMode ? "#121212" : "#fff",
        }}
      >
        {services.map((service) => {
          const isBookmarked = Boolean(
            bookmarkedServices.find((s) => s.id === service.id)
          );
          return (
            <ServiceCard
              key={service.id}
              service={service}
              isBookmarked={isBookmarked}
              onBookmarkPress={() => toggleBookmark(service)}
              staffView={false}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bookmarkBtn: {
    marginLeft: 12,
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#232323",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#333",
    shadowOpacity: 0.2,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
  },
  modalPrice: {
    fontSize: 16,
    color: "#FF5ACC",
    fontFamily: "Poppins_600SemiBold",
  },
  modalDescription: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#444",
    marginVertical: 6,
  },
  modalProcedureTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  modalProcedure: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#555",
  },
  modalDuration: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#777",
    marginTop: 8,
  },
  modalCloseButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#FF5ACC",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  serviceAdded: {
    borderWidth: 1,
    borderColor: "#FF5ACC",
  },
  serviceNotAdded: {
    borderWidth: 1,
    borderColor: "#eee",
  },
  serviceName: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#232323",
  },
  servicePrice: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#FF5ACC",
  },
  bookedCount: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Poppins_400Regular",
  },
  addToCartButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addedToCartButton: {
    backgroundColor: "#ccc",
  },
  addToCartText: {
    fontSize: 10,
  },
  addedToCartText: {
    color: "#555",
  },
  cartBadge: {
    position: "absolute",
    right: 4,
    top: 2,
    backgroundColor: "#FF5ACC",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default ServiceType;
