import ProfileCard from "@/components/CustomCard";
import { useAuth } from "@/context/UserContext";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Wave } from "react-native-animated-spinkit";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

interface Staff {
  type: any;
  id: number;
  name: string;
  address: string;
  distance: number;
  average_rating: number;
  hourly_rate: number;
  image: string;
  rating: any;
  reviews: number;
  city: string;
  service_id: number;
  price: number;
  mobile_image_url: string;
}

const STAFFS_API = "https://femiiniq-backend.onrender.com/api/get-staffs";

const PRIMARY_LIGHT = "#FF5ACC";

const PROFESSIONAL_TYPES = ["All", "Solo", "Studio"];
const RATINGS = ["All", "5", "4", "3", "2"];
const DISTANCE_OPTIONS = ["All", "< 1 km", "1 - 5 km", "5 - 10 km", "> 10 km"];
const SORT_OPTIONS = [
  "Relevance",
  "Distance (Low to High)",
  "Distance (High to Low)",
  "Rating (Low to High)",
  "Rating (High to Low)",
];

const Index: React.FC = () => {
  const { service_id } = useGlobalSearchParams<{ service_id: string }>();
  const { toggleBookmark, bookmarkedStaffs } = useAuth();
  const { isDarkMode } = useAuth();

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSortOption, setSelectedSortOption] = useState(SORT_OPTIONS[0]);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const [sortButtonLayout, setSortButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [filters, setFilters] = useState({
    service: "", // you can adjust this per logic
    rating: "All",
    radius: "All",
    prof_type: "All",
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const parseRadius = (radius: string) => {
    if (!radius || radius === "All") return { min: 0, max: Infinity };
    if (radius.includes(">")) {
      const num = parseFloat(radius.replace("> ", "").replace(" km", ""));
      return { min: num, max: Infinity };
    }
    if (radius.includes("<")) {
      const num = parseFloat(radius.replace("< ", "").replace(" km", ""));
      return { min: 0, max: num };
    }
    const parts = radius.split(" - ");
    const min = parseFloat(parts[0]) || 0;
    const max = parts[1] ? parseFloat(parts[1].replace(" km", "")) : Infinity;
    return { min, max };
  };

  useEffect(() => {
    if (!service_id) return;
    const serviceIdNum = Number(service_id);

    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const resp = await fetch(STAFFS_API);
        const json = await resp.json();
        let staffsData: Staff[] = [];
        if (json.status === "success" && Array.isArray(json.data)) {
          staffsData = json.data;
        }
        const radiusRange = parseRadius(filters.radius);

        let filtered = staffsData.filter((staff) => {
          if (staff.service_id !== serviceIdNum) return false;

          if (
            filters.prof_type &&
            filters.prof_type.toLowerCase() !== "all" &&
            (!staff.type ||
              staff.type.toLowerCase() !== filters.prof_type.toLowerCase())
          )
            return false;

          const staffRating =
            typeof staff.average_rating === "number"
              ? staff.average_rating
              : parseFloat(staff.rating) || 0;
          if (filters.rating !== "All" && staffRating < Number(filters.rating))
            return false;

          const staffDistance =
            typeof staff.distance === "number"
              ? staff.distance
              : parseFloat(staff.distance) || -1;
          if (
            staffDistance < radiusRange.min ||
            staffDistance > radiusRange.max
          )
            return false;

          if (
            filters.service &&
            filters.service !== "All" &&
            staff.service_id !== Number(filters.service)
          )
            return false;

          return true;
        });

        // Add sorting
        if (selectedSortOption) {
          switch (selectedSortOption) {
            case "Distance (Low to High)":
              filtered = filtered.sort((a, b) => a.distance - b.distance);
              break;
            case "Distance (High to Low)":
              filtered = filtered.sort((a, b) => b.distance - a.distance);
              break;
            case "Rating (Low to High)":
              filtered = filtered.sort((a, b) => a.rating - b.rating);
              break;
            case "Rating (High to Low)":
              filtered = filtered.sort((a, b) => b.rating - a.rating);
              break;
            case "Relevance":
            default:
              break;
          }
        }

        setStaffs(filtered);
      } catch (error) {
        console.error("Error fetching staffs:", error);
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, [service_id, filters, selectedSortOption]);

  const handleSelectFilter = (type: string, value: string) => {
    setTempFilters((prev) => ({ ...prev, [type]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterModalVisible(false);
  };

  const cancelFilters = () => {
    setTempFilters(filters);
    setFilterModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Wave size={60} color={PRIMARY_LIGHT} />
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#222" : "#fff" }}
    >
      <View className="absolute bottom-20 right-5 z-10">
        <TouchableOpacity
          className="p-4 bg-primary rounded-full "
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={25} color={"white"} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="absolute bottom-40 right-5 bg-primary rounded-full z-10"
        style={{
          borderColor: "#FF5ACC",
          borderWidth: 2,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
        onPress={() => setOpenSortDropdown(!openSortDropdown)}
        onLayout={(event) => {
          setSortButtonLayout(event.nativeEvent.layout);
        }}
        activeOpacity={0.8}
      >
        <Feather name="filter" size={20} color={"#fff"} />
      </TouchableOpacity>
      {openSortDropdown && (
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
          onPress={() => setOpenSortDropdown(false)}
        />
      )}

      {openSortDropdown && sortButtonLayout && (
        <View
          style={{
            position: "absolute",
            top: sortButtonLayout.y - 230,
            left: sortButtonLayout.x - 180,
            minWidth: sortButtonLayout.width,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: PRIMARY_LIGHT,
            backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
            paddingVertical: 6,
            elevation: 8,
            zIndex: 1000,
            shadowColor: isDarkMode ? "#fff" : "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = selectedSortOption === option;
            return (
              <TouchableOpacity
                key={option}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? "#2a1f38"
                      : "#F9ECF6"
                    : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => {
                  setSelectedSortOption(option);
                  setOpenSortDropdown(false);
                }}
                activeOpacity={0.8}
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
                      selectedSortOption === option
                        ? isDarkMode
                          ? "#2a1f38"
                          : "#F9ECF6"
                        : "transparent",
                  }}
                >
                  {selectedSortOption === option && (
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
                    fontSize: 14,
                    fontFamily: isSelected
                      ? "Poppins_600SemiBold"
                      : "Poppins_400Regular",
                    color: isSelected
                      ? PRIMARY_LIGHT
                      : isDarkMode
                        ? "#ddd"
                        : "#222",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FlatList
        data={staffs}
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

      <Modal
        isVisible={filterModalVisible}
        style={{ justifyContent: "flex-end", margin: 0, padding: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        statusBarTranslucent
        onBackdropPress={() => setFilterModalVisible(false)}
        backdropColor={isDarkMode ? "#000000dd" : "#000000dd"}
        backdropOpacity={0.6}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? "#333" : "#fff",
            padding: 20,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            minHeight: 400,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Poppins_600SemiBold",
              marginBottom: 10,
              textAlign: "center",
              color: isDarkMode ? "#eee" : "#222",
            }}
          >
            Filter
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#eee" : "#222" },
            ]}
          >
            Service At
          </Text>
          <View style={styles.row}>
            {["Your Location", "Provider's Location"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.selectBtn,
                  tempFilters.service === opt && {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                  { borderColor: PRIMARY_LIGHT },
                ]}
                onPress={() => handleSelectFilter("service", opt)}
              >
                <Text
                  style={{
                    color: tempFilters.service === opt ? "#fff" : PRIMARY_LIGHT,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#eee" : "#222" },
            ]}
          >
            Professionals Type
          </Text>
          <View style={styles.row}>
            {PROFESSIONAL_TYPES.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.selectBtn,
                  tempFilters.prof_type === opt && {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                  { borderColor: PRIMARY_LIGHT },
                ]}
                onPress={() => handleSelectFilter("prof_type", opt)}
              >
                <Text
                  style={{
                    color:
                      tempFilters.prof_type === opt ? "#fff" : PRIMARY_LIGHT,
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
                    className="ml-2 mb-1"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#eee" : "#222" },
            ]}
          >
            Rating
          </Text>
          <View style={styles.row}>
            {RATINGS.map((rat) => (
              <TouchableOpacity
                key={rat}
                style={[
                  styles.selectBtn,
                  tempFilters.rating === rat && {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                  { borderColor: PRIMARY_LIGHT },
                ]}
                className="flex-row items-center justify-center gap-2"
                onPress={() => handleSelectFilter("rating", rat)}
              >
                <Ionicons
                  name="star"
                  size={16}
                  color={tempFilters.rating === rat ? "white" : PRIMARY_LIGHT}
                />
                <Text
                  style={{
                    color: tempFilters.rating === rat ? "#fff" : PRIMARY_LIGHT,
                    fontFamily: "Poppins_400Regular",
                    marginTop: 2,
                  }}
                >
                  {rat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#eee" : "#222" },
            ]}
          >
            Radius
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DISTANCE_OPTIONS.map((rad) => (
              <TouchableOpacity
                key={rad}
                style={[
                  styles.selectBtn,
                  tempFilters.radius === rad && {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                  { borderColor: PRIMARY_LIGHT },
                ]}
                onPress={() => handleSelectFilter("radius", rad)}
              >
                <Text
                  style={{
                    color: tempFilters.radius === rad ? "#fff" : PRIMARY_LIGHT,
                    fontFamily: "Poppins_400Regular",
                    fontSize: 12,
                  }}
                >
                  {rad}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.actionRow]}>
            <TouchableOpacity
              className="flex-1 py-3 rounded-full border border-[#FF5ACC] items-center bg-transparent"
              onPress={() => {
                handleSelectFilter("service", "All");
                handleSelectFilter("prof_type", "All");
                handleSelectFilter("rating", "All");
                handleSelectFilter("radius", "All");
              }}
            >
              <Text className="text-[#FF5ACC] text-base font-poppins-semibold">
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: PRIMARY_LIGHT }]}
              onPress={applyFilters}
            >
              <Text style={[styles.applyBtnTxt, { color: "white" }]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  selectBtn: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  cancelBtnTxt: {
    fontFamily: "Poppins_600SemiBold",
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: 8,
  },
  applyBtnTxt: {
    fontFamily: "Poppins_600SemiBold",
  },
});

export default Index;
