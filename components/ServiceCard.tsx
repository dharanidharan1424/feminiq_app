/* eslint-disable no-unused-expressions */
import { useAuth } from "@/context/UserContext";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ServiceData {
  id: number;
  category_id: number;
  name: string;
  image: string;
  booked: number;
  price: any;
  original_price: string | null;
  discount_price: string | null;
  procedure: string;
  description: string;
  duration: string;
  mobile_url: string;
  staff_id: number;
}

interface ServiceCardProps {
  service: ServiceData;
  isBookmarked: boolean;
  onBookmarkPress: () => void;
  staffView: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isBookmarked,
  onBookmarkPress,
  staffView,
}) => {
  const { token, showToast, isDarkMode } = useAuth();
  const [isInCart, setIsInCart] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [staffData, setStaffData] = useState<any | null>(null);

  useEffect(() => {
    async function loadCart() {
      if (!token) return;
      try {
        const cartJSON = await AsyncStorage.getItem(
          `selectedServices_${token}`
        );
        const cart = cartJSON ? JSON.parse(cartJSON) : [];
        setIsInCart(cart.some((item: ServiceData) => item.id === service.id));
      } catch (e) {
        console.error(e);
      }
    }
    loadCart();
  }, [service.id, token]);

  // Fetch staff name by staff_id
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(
          `https://femiiniq-backend.onrender.com/api/get-staffs/${service.staff_id}`
        );
        if (res.ok) {
          const json = await res.json();
          setStaffData(json.data ?? null);
          setStaffName(json.data?.name ?? null);
        } else {
          setStaffName(null);
        }
      } catch {
        setStaffName(null);
      }
    }

    fetchStaff();
  }, [modalVisible, service.staff_id]);

  async function addToCart() {
    if (!token) {
      showToast("Please login to add to cart", "info", "bottom");
      return;
    }
    if (isInCart) {
      showToast("Service already in cart", "info", "bottom");
      return;
    }
    try {
      const cartKey = `selectedServices_${token}`;
      const cartJSON = await AsyncStorage.getItem(cartKey);
      const cart = cartJSON ? JSON.parse(cartJSON) : [];
      cart.push(service);
      await AsyncStorage.setItem(cartKey, JSON.stringify(cart));
      setIsInCart(true);
      showToast("Service added to cart", "success", "bottom");
    } catch {
      showToast("Failed to add to cart", "remove", "bottom");
    }
  }

  const calculateDiscountPercent = () => {
    const original = Number(service.original_price);
    if (original && original > service.price) {
      return Math.round(((original - service.price) / original) * 100);
    }
    return null;
  };

  const discount = calculateDiscountPercent();

  return (
    <TouchableOpacity
      onPress={() => {
        if (staffView && staffData) {
          const params: Record<string, string> = {
            id: String(staffData.id || ''),
            name: String(staffData.name || ''),
            address: String(staffData.address || ''),
            latitude: String(staffData.latitude || ''),
            longitude: String(staffData.longitude || ''),
            rating: String(staffData.rating || '0'),
            distance: String(staffData.distance || '0'),
            service_id: String(staffData.service_id || ''),
            image: String(staffData.image || ''),
            mobile_image_url: String(staffData.mobile_image_url || ''),
            type: 'service',
            average_rating: String(staffData.average_rating || staffData.rating || '0'),
            hourly_rate: String(staffData.hourly_rate || ''),
            reviews: String(staffData.reviews || '0'),
            price: String(staffData.price || ''),
            city: String(staffData.city || ''),
            backPath: 'explore',
          };
          router.push({
            pathname: "/Details",
            params: params,
          });
        } else {
          setModalVisible(true);
        }
      }}
    >
      <ScrollView
        className="mb-4 rounded-xl shadow p-4"
        style={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}
      >
        <View className="relative">
          <TouchableOpacity
            onPress={onBookmarkPress}
            className="absolute top-2 right-1"
            style={{ zIndex: 2 }}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isDarkMode ? "#f5f5f5" : "#FF5ACC"}
            />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Image
              source={{ uri: service.mobile_url }}
              className="w-16 h-16 rounded-lg mr-4"
              style={{ backgroundColor: isDarkMode ? "#333" : "#e5e5e5" }}
              resizeMode="cover"
            />

            <View className="flex-1">
              <Text
                className="text-lg font-poppins-semibold"
                style={{ color: isDarkMode ? "#f5f5f5" : "#000" }}
              >
                {service.name}
              </Text>
              {staffView && (
                <Text>
                  <Text className="text-gray-500 font-poppins-regular text-sm">
                    by{" "}
                  </Text>
                  <Text className="text-primary font-poppins-medium text-sm">
                    {staffName}
                  </Text>
                </Text>
              )}

              <View className="flex-row items-end my-1">
                <Text className="text-base font-poppins-semibold  text-primary">
                  ₹{service.price}
                </Text>
                {discount !== null && (
                  <>
                    <Text
                      className="font-poppins-semibold text-sm ml-1 line-through"
                      style={{ color: isDarkMode ? "#777" : "#A3A3A3" }}
                    >
                      ₹{service.original_price}
                    </Text>
                    <View
                      className={`ml-2 px-2 py-1 rounded-xl ${isDarkMode ? "bg-[#332233]" : "bg-[#FFF0F7]"}`}
                    >
                      <Text
                        className={`font-semibold text-[10px] ${isDarkMode ? "text-pink-400" : "text-primary"}`}
                      >
                        {discount}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          <View className="flex-row justify-end gap-4 mt-4">
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="flex-row items-center rounded-full border px-3 py-1"
              style={{
                borderColor: isDarkMode ? "#bbb" : "#FF5ACC",
              }}
            >
              <MaterialCommunityIcons
                name="information"
                size={16}
                color={isDarkMode ? "#f5f5f5" : "#FF5ACC"}
                style={{ marginRight: 4 }}
              />
              <Text
                className="text-xs font-poppins-medium"
                style={{ color: isDarkMode ? "#f5f5f5" : "#FF5ACC" }}
              >
                View Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={addToCart}
              className={`px-3 py-1 rounded-full border flex-row items-center ${isInCart
                ? "bg-green-100 border-green-500"
                : "bg-pink-100 border-primary"
                }`}
            >
              <MaterialCommunityIcons
                name={isInCart ? "cart-check" : "cart-plus"}
                size={18}
                color={isInCart ? "#006400" : "#FF5ACC"}
                style={{ marginRight: 5 }}
              />
              <Text
                className="text-xs font-poppins-medium"
                style={{ color: isInCart ? "#006400" : "#FF5ACC" }}
              >
                {isInCart ? "Added to cart" : "Add to cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-4">
          <View
            className="w-full max-w-md rounded-xl p-6"
            style={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}
          >
            <Image
              source={{ uri: service.mobile_url }}
              style={{
                width: "100%",
                height: 140,
                borderRadius: 12,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />
            <View className="border-b border-gray-200 pb-2 mb-3">
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  marginBottom: 2,
                  color: isDarkMode ? "#f5f5f5" : "#000",
                }}
                numberOfLines={1}
              >
                {service.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,

                  fontFamily: "Poppins_400Regular",
                  color: isDarkMode ? "#ddd" : "#333",
                }}
              >
                {service.description}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              {staffName && (
                <View className="flex-row items-center gap-1">
                  <Text className="font-poppins-semibold text-base text-black ">
                    Artist:
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 1,
                      fontFamily: "Poppins_500Medium",
                      color: isDarkMode ? "#bbb" : "#555",
                    }}
                  >
                    {staffName}
                  </Text>
                </View>
              )}
              {staffView && (
                <TouchableOpacity
                  onPress={() => {
                    if (staffData) {
                      const params: Record<string, string> = {
                        id: String(staffData.id || ''),
                        name: String(staffData.name || ''),
                        address: String(staffData.address || ''),
                        latitude: String(staffData.latitude || ''),
                        longitude: String(staffData.longitude || ''),
                        rating: String(staffData.rating || '0'),
                        distance: String(staffData.distance || '0'),
                        service_id: String(staffData.service_id || ''),
                        image: String(staffData.image || ''),
                        mobile_image_url: String(staffData.mobile_image_url || ''),
                        type: 'service',
                        average_rating: String(staffData.average_rating || staffData.rating || '0'),
                        hourly_rate: String(staffData.hourly_rate || ''),
                        reviews: String(staffData.reviews || '0'),
                        price: String(staffData.price || ''),
                        city: String(staffData.city || ''),
                        backPath: 'explore',
                      };
                      router.push({
                        pathname: "/Details",
                        params: params,
                      });
                    }
                  }}
                  className="mb-1"
                >
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color={"#FF5ACC"}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row items-end my-1">
              <Text className="font-poppins-semibold text-base text-black ">
                Price :
              </Text>
              <Text className="text-base font-poppins-regular ml-2 text-primary">
                ₹{service.price}
              </Text>
              {discount !== null && (
                <>
                  <Text
                    className="font-poppins-regular text-sm ml-1 line-through"
                    style={{ color: isDarkMode ? "#777" : "#A3A3A3" }}
                  >
                    ₹{service.original_price}
                  </Text>
                  <View
                    className={`ml-2 px-2 py-1 rounded-xl ${isDarkMode ? "bg-[#332233]" : "bg-[#FFF0F7]"}`}
                  ></View>
                </>
              )}
            </View>

            <View>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  marginBottom: 4,
                  color: isDarkMode ? "#eee" : "#222",
                }}
              >
                Procedure:
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_400Regular",
                  color: isDarkMode ? "#aaa" : "#555",
                }}
              >
                {service.procedure}
              </Text>
              <View className="flex-row items-center justify-between pr-3 my-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" color={"#ff5acc"} size={16} />
                  <View className="flex-row items-center mt-1">
                    <Text className="font-poppins-semibold">Duration: </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_400Regular",
                        color: isDarkMode ? "#888" : "#777",
                      }}
                    >
                      {service.duration} mins
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <FontAwesome6
                    name="calendar-check"
                    size={16}
                    color={"#ff5acc"}
                  />
                  <View className="flex-row items-center mt-1">
                    <Text className="font-poppins-semibold">Booked: </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_400Regular",
                        color: isDarkMode ? "#888" : "#777",
                      }}
                    >
                      {service.booked}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => setModalVisible(false)}
              className="mt-6 bg-primary rounded-xl py-3"
            >
              <Text className="text-white text-center font-poppins-semibold">
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default ServiceCard;
