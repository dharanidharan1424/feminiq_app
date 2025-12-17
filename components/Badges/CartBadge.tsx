import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartBadge = ({ token, isDarkMode }) => {
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!token) {
        setTotalCount(0);
        return;
      }
      try {
        const selectedServicesData = await AsyncStorage.getItem(
          `selectedServices_${token}`
        );
        const selectedServices = selectedServicesData
          ? JSON.parse(selectedServicesData)
          : [];

        const cartPackagesData = await AsyncStorage.getItem(
          `cart_packages_${token}`
        );
        const cartPackages = cartPackagesData
          ? JSON.parse(cartPackagesData)
          : [];

        setTotalCount(selectedServices.length + cartPackages.length);
      } catch (e) {
        console.error("Error fetching cart count:", e);
      }
    };

    fetchCartCount();
  }, [token]);

  if (totalCount === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        right: -6,
        top: -3,
        backgroundColor: "red",
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
        {totalCount}
      </Text>
    </View>
  );
};

export default CartBadge;
