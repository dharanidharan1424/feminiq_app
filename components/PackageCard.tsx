import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PackageType {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  mobile_url: string;
  staff_id: number;
  booked: string;
  process: string;
  original_price: string;
}

interface PackageCardProps {
  packageItem: PackageType;
  isBookmarked: boolean;
  data?: any;
  staffView?: boolean;
  onBookmarkPress: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  packageItem,
  isBookmarked,
  onBookmarkPress,
  data,
  staffView,
}) => {
  const { token, showToast, isDarkMode } = useAuth();
  const router = useRouter();
  const [staffName, setStaffName] = useState<string | null>(null);
  const [staffData, setStaffData] = useState<any | null>(null);

  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(
          `https://feminiq-backend.onrender.com/api/get-staffs/${packageItem.staff_id}`
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
  }, []);

  useEffect(() => {
    async function loadCartStatus() {
      if (!token) return;
      try {
        const cartJSON = await AsyncStorage.getItem(`cart_packages_${token}`);
        const cart = cartJSON ? JSON.parse(cartJSON) : [];
        setIsInCart(cart.some((p: PackageType) => p.id === packageItem.id));
      } catch (e) {
        console.error("Failed to load cart data", e);
      }
    }
    loadCartStatus();
  }, [packageItem.id, token]);

  const calculateDiscountPercent = () => {
    const original = Number(packageItem.original_price);
    if (original && original > packageItem.price) {
      return Math.round(((original - packageItem.price) / original) * 100);
    }
    return null;
  };

  const discount = calculateDiscountPercent();

  async function addToCart() {
    if (!token) {
      showToast("Please login to add to cart", "info", "bottom");
      return;
    }
    if (isInCart) {
      showToast("Already in cart", "info", "bottom");
      return;
    }
    try {
      const cartKey = `cart_packages_${token}`;
      const cartJSON = await AsyncStorage.getItem(cartKey);
      const cart = cartJSON ? JSON.parse(cartJSON) : [];
      cart.push(packageItem);
      await AsyncStorage.setItem(cartKey, JSON.stringify(cart));
      setIsInCart(true);
      showToast("Added to cart", "success", "bottom");
    } catch {
      showToast("Failed to add to cart", "remove", "bottom");
    }
  }

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/Details",
          params: { ...staffData, type: "package" },
        });
      }}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
        ]}
      >
        <TouchableOpacity
          onPress={onBookmarkPress}
          style={{ position: "absolute", top: 10, right: 15, zIndex: 10 }}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isDarkMode ? "#f472b6" : "#FF5ACC"}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: packageItem.mobile_url }}
          style={[
            styles.image,
            { backgroundColor: isDarkMode ? "#2A2A2A" : "#eee" },
          ]}
        />

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? "#f5f5f5" : "#1E2022" },
            ]}
          >
            {packageItem.name}
          </Text>
          {staffView && (
            <View className="flex-row items-center mb-1">
              <Text className="text-gray-500 font-poppins-regular text-sm">
                by{" "}
              </Text>
              <TouchableOpacity>
                <Text className="text-primary font-poppins-medium text-sm">
                  {staffName}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{packageItem.price}</Text>
            {discount !== null && (
              <>
                <Text
                  style={[
                    styles.originalPrice,
                    { color: isDarkMode ? "#777" : "#A3A3A3" },
                  ]}
                >
                  ₹{packageItem.original_price}
                </Text>
                <View
                  style={[
                    styles.discountBadge,
                    {
                      backgroundColor: isDarkMode ? "#332233" : "#FFF0F7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.discountText,
                      { color: isDarkMode ? "#f472b6" : "#FF5ACC" },
                    ]}
                  >
                    {discount}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/Details/PackageDetails",
                  params: { ...packageItem, data: JSON.stringify(data) },
                })
              }
              style={[
                styles.detailsButton,
                {
                  backgroundColor: isDarkMode ? "#f472b6" : "#FF5ACC",
                  paddingHorizontal: staffView ? 12 : 8,
                },
              ]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color="white"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addToCart}
              style={[
                styles.cartButton,
                {
                  backgroundColor: isDarkMode ? "#2E2E2E" : "#FFF0F7",
                  borderColor: isDarkMode ? "#f472b6" : "#FF5ACC",
                  paddingHorizontal: staffView ? 16 : 8,
                },
                isInCart ? styles.cartButtonActive : null,
              ]}
            >
              <MaterialCommunityIcons
                name={isInCart ? "cart-check" : "cart-plus"}
                size={18}
                color={
                  isInCart ? "#22C55D" : isDarkMode ? "#f472b6" : "#FF5ACC"
                }
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.cartButtonText,
                  {
                    color: isInCart
                      ? "#22C55D"
                      : isDarkMode
                        ? "#f472b6"
                        : "#FF5ACC",
                  },
                ]}
              >
                {isInCart ? "Added to cart" : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#ccc",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 13,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#1E2022",
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  price: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#FF5ACC",
  },
  originalPrice: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#A3A3A3",
    marginLeft: 8,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    marginLeft: 8,
    backgroundColor: "#FFF0F7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    color: "#FF5ACC",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 10,
    justifyContent: "flex-end",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5ACC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 10,
  },
  detailsButtonText: {
    color: "#FFF",
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF5ACC",
    backgroundColor: "#FFF0F7",
  },
  cartButtonActive: {
    borderColor: "#22C55D",
    backgroundColor: "#D1F5DB",
  },
  cartButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 10,
    color: "#FF5ACC",
  },
  cartButtonTextActive: {
    color: "#166D1F",
  },
});

export default PackageCard;
