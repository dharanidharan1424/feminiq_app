import { useAuth } from "@/context/UserContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileCardProps {
  data?: any;
  avatar?: any;
  name?: string;
  address?: string;
  distance?: string;
  rating?: string;
  bookmarked?: boolean;
  onBookmarkPress?: () => void;
  suppressToast?: boolean;
  onPress?: () => void;
  backPath?: string;
}

const tickStaffIds = [
  1, 2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 22, 24, 27, 30, 33, 35, 38, 40, 42,
];

const ProfileCard: React.FC<ProfileCardProps> = ({
  data,
  avatar,
  name,
  address,
  distance,
  rating,
  bookmarked,
  onBookmarkPress,
  suppressToast = false,
  backPath,
}) => {
  const handlePress = () => {
    if (onBookmarkPress) {
      onBookmarkPress();
      if (!suppressToast && showToast) {
        showToast(
          bookmarked ? "Bookmark removed" : "Bookmark added",
          bookmarked ? "remove" : "success",
          "bottom"
        );
      }
    }
  };

  const handleCardPress = (staffData: any) => {
    if (!staffData || !staffData.id) {
      console.error("Invalid staff data");
      return;
    }

    // Convert all values to strings for safe navigation
    const params: Record<string, string> = {
      id: String(staffData.id),
      name: String(staffData.name || ''),
      address: String(staffData.address || ''),
      latitude: String(staffData.latitude || ''),
      longitude: String(staffData.longitude || ''),
      rating: String(staffData.rating || '0'),
      distance: String(staffData.distance || '0'),
      service_id: String(staffData.service_id || ''),
      image: String(staffData.image || ''),
      mobile_image_url: String(staffData.mobile_image_url || ''),
      type: String(staffData.type || ''),
      average_rating: String(staffData.average_rating || staffData.rating || '0'),
      hourly_rate: String(staffData.hourly_rate || ''),
      reviews: String(staffData.reviews || '0'),
      price: String(staffData.price || ''),
      city: String(staffData.city || ''),
      backPath: String(backPath || 'explore'),
    };

    router.push({
      pathname: "/Details",
      params: params,
    });
  };
  // Address masking logic
  let displayedAddress = address;
  if (data?.type === "solo" && address) {
    const parts = address.split(",");
    if (parts.length > 1) {
      // Remove unwanted whitespace
      let mainPart = parts.slice(1).join(",").trim();
      const city = data?.city;
      // Append city if it's present and not already included
      if (city && !mainPart.toLowerCase().includes(city.toLowerCase())) {
        mainPart = `${mainPart}, ${city}`;
      }
      displayedAddress = mainPart;
    }
  } else if (data?.type === "parlour" && address) {
    const city = data?.city;
    if (city && !address.toLowerCase().includes(city.toLowerCase())) {
      displayedAddress = `${address}, ${city}`;
    }
  }

  const { isDarkMode, showToast } = useAuth();

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const nameColor = isDarkMode ? "#eee" : "#222";
  const addressColor = isDarkMode ? "#bbb" : "#777";
  const valueColor = isDarkMode ? "#ccc" : "#333";
  const iconColor = "#FF5ACC";
  const borderColor = isDarkMode ? "#444" : "transparent";

  // Show tick for all solo and parlour staff
  const showTick = data && (data.type === "solo" || data.type === "parlour");

  // Tick color based on type
  const tickColor =
    data?.type === "solo"
      ? "#3B82F6" // Blue for Solo
      : data?.type === "parlour"
        ? "#10B981" // Green for Parlour
        : null;

  return (
    <TouchableOpacity
      onPress={() => handleCardPress(data)}
      style={[
        styles.card,
        { backgroundColor, borderColor, borderWidth: isDarkMode ? 1 : 0 },
      ]}
    >
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.name, { color: nameColor }]}>{name}</Text>
          {showTick && tickColor && (
            <MaterialIcons
              name="verified"
              color={tickColor}
              size={20}
              className="ml-1 mb-1"
            />
          )}
        </View>
        <Text style={[styles.address, { color: addressColor }]}>
          {displayedAddress}
        </Text>
        <View style={styles.row}>
          <MaterialIcons name="location-pin" size={16} color={iconColor} />
          <Text style={[styles.value, { color: valueColor }]}>
            {distance} km
          </Text>
          <MaterialIcons
            name={Number(rating) < 5 ? "star-half" : "star"}
            size={16}
            color={iconColor}
            style={styles.starIcon}
          />
          <Text style={[styles.value, { color: valueColor }]}>
            {rating}({data.reviews} reviews)
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Ionicons
          name={bookmarked ? "bookmark" : "bookmark-outline"}
          size={26}
          color={iconColor}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  address: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  value: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    marginRight: 12,
    marginLeft: 3,
  },
  starIcon: {
    marginLeft: 2,
    marginRight: 3,
  },
});

export default ProfileCard;
