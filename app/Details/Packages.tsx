import { View, Text, FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Wave } from "react-native-animated-spinkit";

import { useAuth } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PackageCard from "@/components/PackageCard";

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

interface PackageProps {
  data: any;
}
const Packages: React.FC<PackageProps> = ({ data }) => {
  const { token, showToast, isDarkMode } = useAuth();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [cartPackages, setCartPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [bookmarkedPackages, setBookmarkedPackages] = useState<PackageType[]>(
    []
  );

  const toggleBookmark = async (service: PackageType) => {
    if (!token) return;

    const isBookmarked =
      bookmarkedPackages.find((s) => s.id === service.id) !== undefined;

    let updatedBookmarks = [];
    if (isBookmarked) {
      updatedBookmarks = bookmarkedPackages.filter((s) => s.id !== service.id);
      showToast("Removed from bookmarks", "remove", "bottom");
    } else {
      updatedBookmarks = [...bookmarkedPackages, service];
      showToast("Added to bookmarks", "success", "bottom");
    }

    setBookmarkedPackages(updatedBookmarks);
    await AsyncStorage.setItem(
      `bookmarkedPackages_${token}`,
      JSON.stringify(updatedBookmarks)
    );
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          `https://feminiq-backend.onrender.com/api/get-package/${data.service_id}`
        );
        const json = await response.json();
        if (response.ok) {
          setPackages(json.data);
        } else {
          setError("Failed to load packages");
        }
      } catch (err) {
        console.log(err);
        setError("Error fetching packages");
      } finally {
        setLoading(false);
      }
    };

    const loadCart = async () => {
      if (!token) return;
      const cartJSON = await AsyncStorage.getItem(`cart_packages_${token}`);
      setCartPackages(cartJSON ? JSON.parse(cartJSON) : []);
    };

    fetchPackages();
    loadCart();
  }, [data, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Wave size={50} color="#FF5ACC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No packages found.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{ marginBottom: 10 }}
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
          Our Packages
        </Text>
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 10 }}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isBookmarked = Boolean(
            bookmarkedPackages.find((s) => s.id === item.id)
          );
          return (
            <PackageCard
              isBookmarked={isBookmarked}
              packageItem={item}
              onBookmarkPress={() => toggleBookmark(item)}
              data={data}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#ccc",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  offBadge: {
    position: "absolute",
    top: 10,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 13,
    zIndex: 2,
  },
  offBadgeText: {
    color: "#FF5ACC",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
  },
  image: {
    width: 74,
    height: 74,
    borderRadius: 13,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  packageName: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#232323",
    marginBottom: 3,
  },
  description: {
    color: "#888",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#FF5ACC",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 12,
    color: "#bbb",
    fontFamily: "Poppins_400Regular",
    textDecorationLine: "line-through",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 6,
    gap: 5,
  },

  errorText: {
    color: "red",
  },
});

export default Packages;
