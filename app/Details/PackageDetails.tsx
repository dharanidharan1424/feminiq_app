import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/UserContext";
import { Flow } from "react-native-animated-spinkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Services = [
  "Glow Facial",
  "Face & Neck DeTan",
  "Body Polishing",
  "Classic Manicure",
  "Rice Waxing",
  "Full Face Threading",
];

const PackageDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, profile, isDarkMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const staffData: any = params.data ? JSON.parse(params.data as string) : null;

  const packageData: any = params
    ? {
        name: params.name,
        description: params.description,
        process: params.process,
        mobile_url: params.mobile_url,
        price: params.price,
        original_price: params.original_price,
        duration: params.duration,
        booked: params.booked,
        category_id: params.category_id,
      }
    : null;

  const checkProfileAndBook = () => {
    if (
      !profile?.fullname?.trim() ||
      !profile?.mobile?.trim() ||
      !profile?.address?.trim()
    ) {
      setModalVisible(true);
      return;
    }
    handleBookNow();
  };

  const handleBookNow = async () => {
    try {
      setLoading(true);
      const storageKey = `user_package_${token}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(packageData));

      router.push({
        pathname: "/Booking",
        params: {
          data: JSON.stringify(staffData),
        },
      });
    } catch (error) {
      console.error("Failed to save package data or navigate:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          backgroundColor: isDarkMode ? "#121212" : "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDarkMode ? "#fff" : "#232323"}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: params.mobile_url as string }}
          style={styles.largeImage}
          resizeMode="cover"
        />

        <Text
          style={[
            styles.detailName,
            { color: isDarkMode ? "#fff" : "#1a1a1a" },
          ]}
        >
          {params.name}
        </Text>
        <Text
          style={[
            styles.detailSubtitle,
            { color: isDarkMode ? "#aaa" : "#888" },
          ]}
        >
          {params.description}
        </Text>

        <View>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: 16,
              color: isDarkMode ? "#fff" : "#232323",
            }}
          >
            Process
          </Text>
          <Text
            style={[
              styles.detailDescription,
              { color: isDarkMode ? "#ccc" : "#555" },
            ]}
          >
            {params.process}
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginVertical: 10, gap: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons
              name="time"
              size={20}
              color={isDarkMode ? "#fff" : "#000"}
            />
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                color: isDarkMode ? "#fff" : "#232323",
              }}
            >
              Duration:{" "}
            </Text>
            <Text
              style={{
                color: "#FF5ACC",
                fontFamily: "Poppins_400Regular",
              }}
            >
              {params.duration} mins
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons
              name="people"
              size={20}
              color={isDarkMode ? "#fff" : "#000"}
            />
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                color: isDarkMode ? "#fff" : "#232323",
              }}
            >
              Booked:{" "}
            </Text>
            <Text
              style={{
                color: "#FF5ACC",
                fontFamily: "Poppins_400Regular",
              }}
            >
              {params.booked}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? "#fff" : "#232323" },
          ]}
        >
          Services
        </Text>
        <View style={styles.servicesRow}>
          {Services.map((service) => (
            <View
              key={service}
              style={[
                styles.serviceItem,
                {
                  backgroundColor: isDarkMode ? "#1E1E1E" : "#f7f0fa",
                },
              ]}
            >
              <Text style={styles.checkIcon}>✔</Text>
              <Text
                style={[
                  styles.serviceText,
                  { color: isDarkMode ? "#fff" : "#232323" },
                ]}
              >
                {service}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.detailBookButton, loading && { opacity: 0.7 }]}
          onPress={checkProfileAndBook}
          disabled={loading}
        >
          {loading ? (
            <Flow size={50} color="#fff" />
          ) : (
            <Text style={styles.detailBookButtonText}>
              Book Now - ₹ {params.price}
            </Text>
          )}
        </TouchableOpacity>

        {/* Profile Verification Modal */}
        <Modal
          visible={modalVisible}
          transparent
          statusBarTranslucent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: isDarkMode ? "#1E1E1E" : "white",
                borderRadius: 20,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  marginBottom: 12,
                  textAlign: "center",
                  color: "#FF5ACC",
                }}
              >
                Complete Your Profile
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Poppins_400Regular",
                  textAlign: "center",
                  marginBottom: 24,
                  color: isDarkMode ? "#ccc" : "#232323",
                }}
              >
                Please update your profile with your name, mobile number, and
                address to continue booking.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#FF5ACC",
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                  borderRadius: 30,
                }}
                onPress={() => {
                  setModalVisible(false);
                  router.push({
                    pathname: "/Tabs/Profile/Update",
                    params: {
                      from: "package",
                      staff: JSON.stringify(staffData),
                    },
                  });
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontFamily: "Poppins_600SemiBold",
                  }}
                >
                  Update Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  largeImage: {
    width: "100%",
    height: 170,
    borderRadius: 18,
    marginBottom: 15,
  },
  detailName: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  detailSubtitle: {
    color: "#888",
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },
  detailDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    marginTop: 9,
    marginBottom: 7,
    color: "#232323",
  },
  servicesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f0fa",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 13,
    marginBottom: 8,
  },
  checkIcon: {
    color: "#FF5ACC",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    marginRight: 6,
  },
  serviceText: {
    fontSize: 13,
    color: "#232323",
    fontFamily: "Poppins_400Regular",
  },
  detailBookButton: {
    backgroundColor: "#FF5ACC",
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: "center",
  },
  detailBookButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
});

export default PackageDetails;
