import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import Modal from "react-native-modal";
import ProfileCard from "@/components/CustomCard";
import { useAuth } from "@/context/UserContext";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Wave } from "react-native-animated-spinkit";
import { router } from "expo-router";

const STAFFS_API = "https://feminiq-backend.onrender.com/api/get-staffs";

const PROFESSIONAL_TYPES = ["All", "Solo", "Studio"];
const RATINGS = ["All", "5", "4", "3", "2"];
const DISTANCE_OPTIONS = ["All", "< 1 km", "1 - 5 km", "5 - 10 km", "> 10 km"];
const services = [
  { title: "All", categoryId: null },
  { title: "Hair", categoryId: "1" },
  { title: "Makeup", categoryId: "2" },
  { title: "Manicure", categoryId: "3" },
  { title: "Bridal Makeup", categoryId: "4" },
  { title: "Mehndi", categoryId: "5" },
  { title: "Saree Draping", categoryId: "6" },
  { title: "Pedicure", categoryId: "8" },
  { title: "Skincare", categoryId: "9" },
  { title: "Threading", categoryId: "10" },
];

const Popular: React.FC = () => {
  const { toggleBookmark, bookmarkedStaffs, isDarkMode } = useAuth();
  const [staffs, setStaffs] = useState<any[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const SORT_OPTIONS = [
    "Relevance",
    "Distance (Low to High)",
    "Distance (High to Low)",
    "Rating (Low to High)",
    "Rating (High to Low)",
  ];

  const [sortButtonLayout, setSortButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<"sort" | null>(null);

  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedServiceAt, setSelectedServiceAt] =
    useState("Provider Location");
  const [selectedProfType, setSelectedProfType] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState("All");

  const [selectedServiceButton, setSelectedServiceButton] = useState("All");

  const [selectedSortOption, setSelectedSortOption] = useState(SORT_OPTIONS[0]);
  // Add in component state:

  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const resp = await fetch(STAFFS_API);
        const json = await resp.json();
        let data = [];
        if (json.status === "success" && Array.isArray(json.data)) {
          data = json.data;
        }
        // Sort descending by rating
        data.sort((a: any, b: any) => Number(b.rating) - Number(a.rating));
        setStaffs(data);
        setFilteredStaffs(data);
      } catch (error) {
        console.error("Error fetching staffs:", error);
        setStaffs([]);
        setFilteredStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, []);

  const getColor = (light: any, dark: any) => (isDarkMode ? dark : light);
  // Filtering function
  const parseDistanceRange = (distance: string) => {
    if (distance === "All") return { min: 0, max: Infinity };
    if (distance.startsWith("<")) {
      const max = parseFloat(distance.replace("< ", "").replace(" km", ""));
      return { min: 0, max };
    }
    if (distance.startsWith(">")) {
      const min = parseFloat(distance.replace("> ", "").replace(" km", ""));
      return { min, max: Infinity };
    }
    if (distance.includes("-")) {
      const parts = distance.split("-");
      const min = parseFloat(parts[0].trim());
      const max = parseFloat(parts[1].replace(" km", "").trim());
      return { min, max };
    }
    return { min: 0, max: Infinity };
  };

  // Update filterStaffs to include distance filtering:
  const filterStaffs = () => {
    let filtered = staffs;

    if (selectedProfType !== "All") {
      filtered = filtered.filter(
        (staff) => staff.type?.toLowerCase() === selectedProfType.toLowerCase()
      );
    }

    if (selectedRating !== "All") {
      filtered = filtered.filter(
        (staff) => Number(staff.rating) >= Number(selectedRating)
      );
    }

    if (selectedDistance !== "All") {
      const { min, max } = parseDistanceRange(selectedDistance);

      filtered = filtered.filter((staff) => {
        const dist =
          typeof staff.distance === "number"
            ? staff.distance
            : parseFloat(staff.distance);
        return dist >= min && dist <= max;
      });
    }
    if (selectedServiceButton !== "All") {
      const selectedCategory = services.find(
        (s) => s.title === selectedServiceButton
      );
      filtered = filtered.filter(
        (staff) => staff.service_id === Number(selectedCategory?.categoryId)
      );
    }

    setFilteredStaffs(filtered);
    setFilterModalVisible(false);
  };

  const applySort = () => {
    let sorted = filteredStaffs.slice();

    switch (selectedSortOption) {
      case "Distance (Low to High)":
        sorted.sort((a, b) => a.distance - b.distance);
        break;
      case "Distance (High to Low)":
        sorted.sort((a, b) => b.distance - a.distance);
        break;
      case "Rating (Low to High)":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case "Rating (High to Low)":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "Relevance":
      default:
        break;
    }
    setFilteredStaffs(sorted);
  };

  useEffect(() => {
    filterStaffs();
  }, [
    selectedProfType,
    selectedRating,
    selectedDistance,
    staffs,
    selectedServiceButton,
  ]);

  useEffect(() => {
    applySort();
  }, [selectedSortOption]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Wave size={60} color="#FF5ACC" />
      </View>
    );
  }

  if (staffs.length === 0) {
    return (
      <View style={styles.center}>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 20,
            color: isDarkMode ? "#eee" : "#000",
          }}
        >
          No Artists Found
        </Text>
      </View>
    );
  }

  return (
    <>
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: 10 }}
      >
        <View className="flex-row gap-2 items-center">
          <Ionicons
            name="arrow-back"
            size={24}
            onPress={() => router.back()}
            style={{ paddingRight: 10, color: isDarkMode ? "#fff" : "#000" }}
          />
          <Text
            style={{ color: isDarkMode ? "#fff" : "#000" }}
            className="font-poppins-semibold text-2xl"
          >
            Most Popular
          </Text>
        </View>
      </View>

      <View className="my-3">
        <FlatList
          data={services}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => {
            const isSelected = selectedServiceButton === item.title;
            return (
              <TouchableOpacity
                onPress={() => setSelectedServiceButton(item.title)}
                style={{
                  borderWidth: 2,
                  borderColor: "#FF5ACC",
                  backgroundColor: isSelected ? "#FF5ACC" : "transparent",
                  borderRadius: 20,
                  paddingHorizontal: 18,
                  paddingVertical: 2,
                  marginHorizontal: 5,
                  marginTop: 5,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "white" : "#FF5ACC",
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  {item.title === "Makeup" ? "Make up" : item.title}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredStaffs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProfileCard
            data={item}
            avatar={{ uri: item.mobile_image_url }}
            name={item.name ?? "No Name"}
            address={item.address ?? "No Address"}
            distance={
              item.distance !== undefined && item.distance !== null
                ? Number(item.distance).toFixed(1)
                : "N/A"
            }
            rating={
              item.rating !== undefined && item.rating !== null
                ? Number(item.rating).toFixed(1)
                : "N/A"
            }
            bookmarked={bookmarkedStaffs.some(
              (staff) => Number(staff.id) === Number(item.id)
            )}
            onBookmarkPress={() => toggleBookmark(item)}
          />
        )}
      />

      {/* Filter Modal */}
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        backdropOpacity={0.6}
        statusBarTranslucent
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            minHeight: 300,
          }}
        >
          <Text className="text-[20px] font-poppins-semibold text-center mb-3 text-[#222]">
            Filter
          </Text>

          {/* Divider */}
          <View className="h-px bg-[#EEE] w-full mb-3" />

          <Text className="font-poppins-semibold text-[18px] mt-2.5 mb-2 text-[#222]">
            Service At
          </Text>
          <View className="flex-row justify-between mb-3">
            {["Provider Location", "Your Location"].map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`flex-1 mx-1 py-2 rounded-full border items-center ${
                  selectedServiceAt === opt
                    ? "bg-[#FF5ACC] border-[#FF5ACC]"
                    : "bg-transparent border-[#FF5ACC]"
                }`}
                onPress={() => setSelectedServiceAt(opt)}
              >
                <Text
                  className={`${
                    selectedServiceAt === opt
                      ? "text-white "
                      : "text-[#FF5ACC] "
                  }font-poppins-regular`}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Professionals Type */}
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              marginBottom: 8,
              fontSize: 18,
            }}
          >
            Professionals Type
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {PROFESSIONAL_TYPES.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setSelectedProfType(opt)}
                style={{
                  flex: 1,
                  marginHorizontal: 5,
                  paddingVertical: 2,
                  backgroundColor:
                    selectedProfType === opt ? PRIMARY_LIGHT : "transparent",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: PRIMARY_LIGHT,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    color: selectedProfType === opt ? "white" : PRIMARY_LIGHT,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  {opt}
                </Text>
                {opt !== "All" && (
                  <MaterialIcons
                    name="verified"
                    size={16}
                    color={
                      opt === "Solo"
                        ? "#2196F3" // Blue
                        : opt === "Studio"
                          ? "#4CAF50" // Green
                          : "black" // fallback
                    }
                    className="mb-1"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              marginBottom: 8,
              fontSize: 18,
            }}
          >
            Minimum Rating
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {RATINGS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setSelectedRating(opt)}
                style={{
                  flex: 1,
                  marginHorizontal: 5,
                  paddingVertical: 2,
                  backgroundColor:
                    selectedRating === opt ? PRIMARY_LIGHT : "transparent",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: PRIMARY_LIGHT,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <Ionicons
                  name="star"
                  size={16}
                  color={selectedRating === opt ? "white" : PRIMARY_LIGHT}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: selectedRating === opt ? "white" : PRIMARY_LIGHT,
                    fontFamily: "Poppins_400Regular",
                    marginTop: 2,
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              marginBottom: 8,
              marginTop: 20,
              fontSize: 18,
            }}
          >
            Distance
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: "row" }}
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setSelectedDistance(opt)}
                style={{
                  flex: 1,
                  marginHorizontal: 5,
                  paddingVertical: 2,
                  paddingHorizontal: 10,
                  backgroundColor:
                    selectedDistance === opt ? PRIMARY_LIGHT : "transparent",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: PRIMARY_LIGHT,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selectedDistance === opt ? "white" : PRIMARY_LIGHT,
                    fontFamily: "Poppins_400Regular",
                    fontSize: 14,
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 30,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                marginRight: 10,
                paddingVertical: 12,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: PRIMARY_LIGHT,
                alignItems: "center",
              }}
              onPress={() => {
                setSelectedProfType("All");
                setSelectedRating("All");
              }}
            >
              <Text
                style={{
                  color: PRIMARY_LIGHT,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                marginLeft: 10,
                paddingVertical: 12,
                borderRadius: 25,
                backgroundColor: PRIMARY_LIGHT,
                alignItems: "center",
              }}
              onPress={filterStaffs}
            >
              <Text
                style={{ color: "white", fontFamily: "Poppins_600SemiBold" }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        className="absolute bottom-6 right-5 bg-primary rounded-full"
        style={{
          borderColor: "#FF5ACC",
          borderWidth: 2,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
        onPress={() => setFilterModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="filter" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        className="absolute bottom-24 right-5 bg-primary rounded-full"
        style={{
          borderColor: "#FF5ACC",
          borderWidth: 2,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
        onPress={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
        onLayout={(event) => {
          setSortButtonLayout(event.nativeEvent.layout);
        }}
        activeOpacity={0.8}
      >
        <Feather name="filter" color={"#fff"} size={20} />
      </TouchableOpacity>
      {openDropdown && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 90, // less than button's zIndex 98
            backgroundColor: "transparent",
          }}
          onPress={() => setOpenDropdown(null)}
        />
      )}
      {openDropdown === "sort" && sortButtonLayout && (
        <View
          style={{
            position: "absolute",
            top: sortButtonLayout.y - 200,
            left: sortButtonLayout.x - 180,
            minWidth: sortButtonLayout.width,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#FF5ACC",
            backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
            paddingVertical: 6,
            elevation: 8,
            zIndex: 1000,
            shadowColor: isDarkMode ? "#fff" : "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor:
                  selectedSortOption === opt
                    ? isDarkMode
                      ? "#2a1f38"
                      : "#F9ECF6"
                    : "transparent",
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                setSelectedSortOption(opt);
                setOpenDropdown(null);
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: "#FF5ACC",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                  backgroundColor:
                    selectedSortOption === opt
                      ? isDarkMode
                        ? "#2a1f38"
                        : "#F9ECF6"
                      : "transparent",
                }}
              >
                {selectedSortOption === opt && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 5,
                      backgroundColor: "#FF5ACC",
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color:
                    selectedSortOption === opt
                      ? "#FF5ACC"
                      : isDarkMode
                        ? "#ddd"
                        : "#222",
                  fontFamily:
                    selectedSortOption === opt
                      ? "Poppins_600SemiBold"
                      : "Poppins_400Regular",
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};

const PRIMARY_LIGHT = "#FF5ACC";

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Popular;
