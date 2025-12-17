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
    router.push({
      pathname: "/Details",
      params: { ...staffData, backPath: backPath },
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
  }

  const { isDarkMode, showToast } = useAuth();

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const nameColor = isDarkMode ? "#eee" : "#222";
  const addressColor = isDarkMode ? "#bbb" : "#777";
  const valueColor = isDarkMode ? "#ccc" : "#333";
  const iconColor = "#FF5ACC";
  const borderColor = isDarkMode ? "#444" : "transparent";

  const showTick = data && tickStaffIds.includes(data.id);

  // Tick color based on type
  const tickColor =
    data?.type === "solo"
      ? "#3B82F6"
      : data?.type === "studio"
        ? "#10B981"
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
