import ProfileCard from "@/components/CustomCard"; // Adjust import path
import { useAuth } from "@/context/UserContext";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Pulse } from "react-native-animated-spinkit";

type Service = { title: string; categoryId: string | null };

const services: Service[] = [
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

const filterOptions = [
  "Relevance",
  "Distance (Low to High)",
  "Distance (High to Low)",
  "Rating (Low to High)",
  "Rating (High to Low)",
];

interface Staff {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  service_id: string;
  image: string;
  mobile_image_url: string;
  type: string;
}

const SERVICES = [
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
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toggleBookmark, bookmarkedStaffs, isDarkMode } = useAuth();
  const [selectedServiceButton, setSelectedServiceButton] =
    useState<string>("All");
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [filterButtonLayout, setFilterButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string>(
    filterOptions[0]
  );
  // ... Within NearbyLocation component, before return
  const [typeFilter, setTypeFilter] = useState("All");

  const [openDropdown, setOpenDropdown] = useState<"type" | "filter" | null>(
    null
  );

  const filterTypes = ["All", "Solo", "Studio"];

  // In memo, include typeFilter dependency

  const getColor = (light: any, dark: any) => (isDarkMode ? dark : light);

  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://feminiq-backend.onrender.com/api/get-staffs"
        );
        const json = await response.json();
        const data = json.data;
        if (json.status === "success" && Array.isArray(json.data)) {
          data.sort((a: any, b: any) => Number(b.rating) - Number(a.rating));
          setStaffs(data);
        } else {
          setStaffs([]);
        }
      } catch (error) {
        console.error("Failed to fetch staffs:", error);
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, []);

  const filteredStaffs = useMemo(() => {
    let filtered = staffs;
    if (selectedServiceButton !== "All") {
      const selectedCategory = services.find(
        (s) => s.title === selectedServiceButton
      );
      filtered = filtered.filter(
        (staff) =>
          String(staff.service_id) === String(selectedCategory?.categoryId)
      );
    }
    if (typeFilter !== "All") {
      filtered = filtered.filter(
        (staff) => staff.type === typeFilter.toLowerCase()
      );
    }
    switch (selectedFilter) {
      case "Distance (Low to High)":
        filtered = filtered.slice().sort((a, b) => a.distance - b.distance);
        break;
      case "Distance (High to Low)":
        filtered = filtered.slice().sort((a, b) => b.distance - a.distance);
        break;
      case "Rating (Low to High)":
        filtered = filtered.slice().sort((a, b) => a.rating - b.rating);
        break;
      case "Rating (High to Low)":
        filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
        break;
    }
    return filtered.slice(0, 3);
  }, [selectedServiceButton, selectedFilter, staffs, typeFilter]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: getColor("#fff", "#222"),
        }}
      >
        <Pulse size={60} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: 40,
        backgroundColor: getColor("#fff", "#222"),
      }}
    >
      <ScrollView>
        {openDropdown && (
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 96, // less than button's zIndex 98
              backgroundColor: "transparent",
            }}
            onPress={() => setOpenDropdown(null)}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_600SemiBold",
              color: getColor("#222", "#eee"),
            }}
          >
            Most popular
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#FF5ACC",
                borderWidth: 2,
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor: getColor("#fff", "#222"),
                minWidth: 70,
                marginRight: 8,
              }}
              onPress={() => {
                setOpenDropdown(openDropdown === "type" ? null : "type");
              }}
              onLayout={(event) => {
                setDropdownLayout(event.nativeEvent.layout);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 11,
                  color: getColor("#222", "#fff"),
                  flex: 1,
                }}
              >
                {typeFilter}
              </Text>
              <Feather name="chevron-down" size={14} color="#FF5ACC" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderColor: "#FF5ACC",
                borderWidth: 2,
                borderRadius: 8,
                padding: 8,
                backgroundColor: getColor("#fff", "#222"),
                marginLeft: 6,
              }}
              onPress={() => {
                setOpenDropdown(openDropdown === "filter" ? null : "filter");
              }}
              onLayout={(event) => {
                setFilterButtonLayout(event.nativeEvent.layout);
              }}
            >
              <Feather name="filter" size={14} color="#FF5ACC" />
            </TouchableOpacity>

            {openDropdown === "type" && dropdownLayout && (
              <View
                style={{
                  position: "absolute",
                  top: dropdownLayout.y + dropdownLayout.height + 4,
                  left: dropdownLayout.x - 80,
                  minWidth: dropdownLayout.width,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#FF5ACC",
                  backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
                  elevation: 8,
                  zIndex: 99,
                  paddingVertical: 6,
                  shadowColor: isDarkMode ? "#fff" : "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                {filterTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.85}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 8,
                      marginVertical: 4,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor:
                        typeFilter === type
                          ? isDarkMode
                            ? "#2a1f38"
                            : "#F9ECF6"
                          : "transparent",
                    }}
                    onPress={() => {
                      setTypeFilter(type);
                      setOpenDropdown(null);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color:
                          typeFilter === type
                            ? "#FF5ACC"
                            : isDarkMode
                              ? "#ddd"
                              : "#222",
                        fontFamily:
                          typeFilter === type
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                      }}
                    >
                      {type}
                    </Text>
                    {type !== "All" && (
                      <MaterialIcons
                        name="verified"
                        size={16}
                        color={
                          type === "Solo"
                            ? "#2196F3" // Blue
                            : type === "Studio"
                              ? "#4CAF50" // Green
                              : "black" // fallback
                        }
                        className="ml-2 mb-1"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {openDropdown === "filter" && filterButtonLayout && (
              <View
                style={{
                  position: "absolute",
                  top: filterButtonLayout.y + filterButtonLayout.height + 4,
                  right: filterButtonLayout.x - 80,
                  minWidth: filterButtonLayout.width,
                  borderRadius: 15,
                  borderWidth: 2,
                  borderColor: "#FF5ACC",
                  backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
                  paddingVertical: 10,
                  elevation: 8,
                  zIndex: 99,
                  shadowColor: isDarkMode ? "#fff" : "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      backgroundColor:
                        selectedFilter === option
                          ? isDarkMode
                            ? "#2a1f38"
                            : "#F9ECF6"
                          : "transparent",
                      borderRadius: 10,
                      marginHorizontal: 4,
                      marginVertical: 2,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedFilter(option);
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
                          selectedFilter === option
                            ? isDarkMode
                              ? "#2a1f38"
                              : "#F9ECF6"
                            : "transparent",
                      }}
                    >
                      {selectedFilter === option && (
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
                        fontFamily:
                          selectedFilter === option
                            ? "Poppins_600SemiBold"
                            : "Poppins_400Regular",
                        color:
                          selectedFilter === option
                            ? "#FF5ACC"
                            : isDarkMode
                              ? "#ddd"
                              : "#222",
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className="my-5">
          <FlatList
            data={SERVICES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.title}
            contentContainerStyle={{
              paddingHorizontal: 8,
              alignItems: "center",
              gap: 8,
            }}
            renderItem={({ item }) => {
              const isSelected = selectedServiceButton === item.title;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedServiceButton(item.title)}
                  style={{
                    borderWidth: 2,
                    marginHorizontal: 4,
                    paddingVertical: 2,
                    paddingHorizontal: 18,
                    borderRadius: 99,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected
                      ? "#FF5ACC"
                      : getColor("#fff", "#222"),
                    borderColor: "#FF5ACC",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins_400Regular",
                      color: isSelected ? "#fff" : "#FF5ACC",
                    }}
                  >
                    {item.title === "Makeup" ? "Make up" : item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View>
          {filteredStaffs.length === 0 ? (
            <Text
              style={{
                color: getColor("#999", "#aaa"),
                marginTop: 32,
                textAlign: "center",
                fontFamily: "Poppins_400Regular",
              }}
            >
              No Artists found for this category.
            </Text>
          ) : (
            <FlatList
              data={filteredStaffs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ProfileCard
                  data={item}
                  avatar={{ uri: item.mobile_image_url }}
                  name={item.name}
                  address={item.address}
                  distance={
                    item.distance ? Number(item.distance).toFixed(1) : "N/A"
                  }
                  rating={item.rating ? Number(item.rating).toFixed(1) : "N/A"}
                  bookmarked={bookmarkedStaffs.some(
                    (staff) => staff.id === item.id
                  )}
                  onBookmarkPress={() => toggleBookmark(item)}
                />
              )}
              scrollEnabled={false}
            />
          )}
          <TouchableOpacity
            className="my-3 flex-row gap-2 justify-center items-center border-b border-gray-300 pb-3"
            onPress={() => router.push("/Popular")}
          >
            <Text className="text-primary font-poppins-regular">See All</Text>
            <Ionicons name="chevron-forward" color={"#FF5ACC"} size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Popular;
