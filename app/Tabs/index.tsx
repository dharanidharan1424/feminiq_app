import ProfileCard from "@/components/CustomCard";
import CustomInput from "@/components/CustomInput";
import HeroCarousel from "@/components/Home/Herocarousel";
import NearbyLocation from "@/components/Home/NearbyLocation";
import Popular from "@/components/Home/Popular";
import ServicesSlider from "@/components/Home/ServicesSlider";
import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  Image,
  LayoutRectangle,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Pulse } from "react-native-animated-spinkit";
import Modal from "react-native-modal";

const STAFFS_API = ("https://femiiniq-backend.onrender.com/api/get-staffs");

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
const PRIMARY = "#FF5ACC";
const PRIMARY_LIGHT = "#FF5ACC";

const Index = () => {
  const { isDarkMode, profile, bookmarkedStaffs, toggleBookmark, token } =
    useAuth();

  const [search, setSearch] = useState<string>("");
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // -- Pill Selection State (default values just like your UI) --
  const [selectedServiceAt, setSelectedServiceAt] =
    useState("Provider Location");
  const [selectedProfType, setSelectedProfType] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState("All");

  const [hasShownUpdateProfileModal, setHasShownUpdateProfileModal] =
    React.useState(false);
  const SORT_OPTIONS = [
    "Relevance",
    "Distance (Low to High)",
    "Distance (High to Low)",
    "Rating (Low to High)",
    "Rating (High to Low)",
  ];
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const [sortButtonLayout, setSortButtonLayout] =
    useState<LayoutRectangle | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState(SORT_OPTIONS[0]);

  const LOCATION_STORAGE_KEY = `location_${token}`;

  useEffect(() => {
    if (!profile?.mobile && !hasShownUpdateProfileModal) {
      setLogoutModalVisible(true);
      setHasShownUpdateProfileModal(true);
    }
  }, [profile, hasShownUpdateProfileModal]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationName("Permission to access location denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      if (location) {
        const [placemark] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (placemark) {
          const nameParts = [
            placemark.name,
            placemark.street,
            placemark.city,
            placemark.region,
            placemark.country,
          ].filter(Boolean);
          const formattedLocation = nameParts.join(", ");
          setLocationName(formattedLocation);

          try {
            if (token) {
              await AsyncStorage.setItem(
                LOCATION_STORAGE_KEY,
                formattedLocation
              );
            }
          } catch (e) {
            console.error("Failed to save location", e);
          }
        } else {
          setLocationName("Unknown Location");
        }
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          Alert.alert(
            "Exit App",
            "Are you sure you want to exit?",
            [
              {
                text: "Cancel",
                onPress: () => { }, // do nothing
                style: "cancel",
              },
              {
                text: "Exit",
                onPress: () => BackHandler.exitApp(),
              },
            ],
            { cancelable: false }
          );
          return true; // prevent default back behavior while alert is showing
        }

        return false; // iOS default behaviour
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  const parseRadius = (distance: string) => {
    if (!distance || distance === "All") return { min: 0, max: Infinity };
    if (distance.includes(">")) {
      const num = parseFloat(distance.replace("> ", "").replace(" km", ""));
      return { min: num, max: Infinity };
    }
    if (distance.includes("<")) {
      const num = parseFloat(distance.replace("< ", "").replace(" km", ""));
      return { min: 0, max: num };
    }
    const parts = distance.split(" - ");
    const min = parseFloat(parts[0]) || 0;
    const max = parts[1] ? parseFloat(parts[1].replace(" km", "")) : Infinity;
    return { min, max };
  };

  const filterStaffs = (staffsData: any[], query: string) => {
    const lowerQuery = query.toLowerCase();
    const matchedServices = SERVICES.filter(
      (service) =>
        service.title.toLowerCase().includes(lowerQuery) &&
        service.categoryId != null
    ).map((service) => service.categoryId);

    const radiusRange = parseRadius(selectedDistance);

    return staffsData.filter((staff) => {
      const matchesName = staff.name?.toLowerCase().includes(lowerQuery);
      const matchesLocation =
        staff.city?.toLowerCase().includes(lowerQuery) ||
        staff.address?.toLowerCase().includes(lowerQuery);

      const staffServiceIdStr = String(staff.service_id);
      const matchesServiceId = matchedServices.some(
        (id) => String(id) === staffServiceIdStr
      );

      if (!matchesName && !matchesLocation && !matchesServiceId) return false;

      // Professionals Type
      if (
        selectedProfType !== "All" &&
        staff.type?.toLowerCase() !== selectedProfType.toLowerCase()
      )
        return false;

      // Rating
      if (
        selectedRating !== "All" &&
        Number(staff.rating ?? 0) < Number(selectedRating)
      )
        return false;

      // Distance
      const staffDistance =
        typeof staff.distance === "number"
          ? staff.distance
          : parseFloat(staff.distance) || -1;
      if (staffDistance < radiusRange.min || staffDistance > radiusRange.max)
        return false;

      // Service At (in your data, if you later want to implement this logic, filter here)
      return true;
    });
  };

  const fetchStaffs = async () => {
    setLoadingSearch(true);
    try {
      const resp = await fetch(STAFFS_API);
      const json = await resp.json();

      let staffsData: any[] = [];
      if (json.status === "success" && Array.isArray(json.data)) {
        staffsData = json.data;
      }

      if (search.trim() === "") {
        setStaffs([]);
      } else {
        const filtered = filterStaffs(staffsData, search);
        setStaffs(filtered);
      }
    } catch (error) {
      console.error("Error fetching staffs:", error);
      setStaffs([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const applySort = (type: any) => {
    let sortedArray = [...staffs]; // or the filtered result array
    switch (type) {
      case "Distance (Low to High)":
        sortedArray.sort((a, b) => Number(a.distance) - Number(b.distance));
        break;
      case "Distance (High to Low)":
        sortedArray.sort((a, b) => Number(b.distance) - Number(a.distance));
        break;
      case "Rating (Low to High)":
        sortedArray.sort((a, b) => Number(a.rating) - Number(b.rating));
        break;
      case "Rating (High to Low)":
        sortedArray.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case "Relevance":
      default:
        break;
    }
    setStaffs(sortedArray);
  };

  // Refilter whenever search or any filter pill changes
  useEffect(() => {
    fetchStaffs();
    // eslint-disable-next-line
  }, [
    search,
    selectedProfType,
    selectedRating,
    selectedDistance,
    selectedServiceAt,
  ]);

  const handleUpdate = () => {
    router.push("/Tabs/Profile/Update");
  };

  // Notifications Handler
  const requestNotificationPermission = async () => {
    console.log("Requesting notification permissions...");
    // On Android 13+ (API level 33+) explicit POST_NOTIFICATIONS permission is needed
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Enable Notifications",
            "Please allow notifications in your device settings to get important alerts.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
        return true;
      }
      return true;
    } else {
      // For iOS and older Android versions (may auto-prompt)
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert("Notification permission denied");
          return false;
        }
        return true;
      }
      return true;
    }
  };

  useEffect(() => {
    console.log("Index screen mounted, checking notification permissions");

    const askNotificationPermissionAndSaveToken = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          console.log("Expo Push Token:", tokenData.data);
          const pushToken = tokenData.data;

          if (profile?.id && pushToken) {
            // Ensure you have user profile and token
            try {
              const response = await fetch(
                "https://femiiniq-backend.onrender.com/login/savePushToken",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    expoPushToken: pushToken,
                    userId: profile.id,
                  }),
                }
              );
              const json = await response.json();
              if (!json.success) {
                console.log("Failed to save token:", json.error);
              }
            } catch (error) {
              console.error("Error saving push token:", error);
            }
          }
        } catch (error) {
          console.error("Failed to get Expo push token:", error);
        }
      }
    };

    askNotificationPermissionAndSaveToken();
  }, []);

  // ---- UI starts here ----
  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? "#222" : "white",
          paddingHorizontal: 10,
          paddingVertical: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row justify-between items-center mb-4">
          <View style={{ flex: 3, marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 16,
                color: isDarkMode ? "#eee" : "#000",
              }}
            >
              Location:
            </Text>
            <Text
              style={{
                color: isDarkMode ? "#FF85C3" : "#FF5ACC",
                fontFamily: "Poppins_400Regular",
              }}
            >
              {locationName ?? "Fetching location..."}
            </Text>
          </View>
        </View>

        {/* Search Input w/ filter */}
        <View style={[styles.searchWrapper, { position: "relative", flexDirection: 'row', alignItems: 'center' }]}>
          <CustomInput
            placeholder="Search by Artist, Service or Location"
            value={search}
            onChangeText={setSearch}
            leftIconName="search"
            isDarkMode={isDarkMode}
            style={{ flex: 1 }}
            isEditing={true}
          />

          <View style={{ flexDirection: 'row', position: 'absolute', right: 10, alignItems: 'center' }}>
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                style={{ marginRight: 10 }}
              >
                <Feather
                  name="x-circle"
                  size={20}
                  color={isDarkMode ? "#fff" : "#333"}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons
                name="filter"
                size={24}
                color={isDarkMode ? "#fff" : "#333"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {search.trim() === "" && (
          <>
            <View
              className=" border-black/10  border-b pb-2"
              style={{ borderBottomWidth: 1 }}
            >
              <HeroCarousel />
            </View>

            <View style={{ marginVertical: 15 }}>
              <ServicesSlider />
            </View>
            <View
              style={{ height: 1, backgroundColor: "#eee", width: "100%" }}
            />
            <NearbyLocation />
            <Popular />
          </>
        )}

        {loadingSearch && (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <Pulse size={60} color="#FF5ACC" />
          </View>
        )}

        {!loadingSearch && search.trim() !== "" && (
          <>
            {staffs.length > 0 ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 16,
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                    marginBottom: 12,
                    paddingBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: 16,
                      color: isDarkMode ? "#eee" : "#000",
                    }}
                  >
                    Results :{" "}
                    <Text style={{ color: "#FF5ACC" }}>
                      &ldquo;{search}&ldquo;
                    </Text>
                  </Text>
                  <Text
                    style={{
                      color: "#FF5ACC",
                      fontFamily: "Poppins_500Medium",
                    }}
                  >
                    {staffs.length} founds
                  </Text>
                </View>
                <FlatList
                  data={staffs}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  renderItem={({ item }) => (
                    <ProfileCard
                      data={item}
                      avatar={{ uri: item.mobile_image_url || item.image }}
                      name={item.name}
                      address={item.address || item.location}
                      distance={
                        item.distance ? Number(item.distance).toFixed(1) : "N/A"
                      }
                      rating={
                        item.rating ? Number(item.rating).toFixed(1) : "N/A"
                      }
                      bookmarked={bookmarkedStaffs.some(
                        (staff) => Number(staff.id) === Number(item.id)
                      )}
                      onBookmarkPress={() => toggleBookmark(item)}
                    />
                  )}
                />
              </>
            ) : (
              <Text
                style={[
                  {
                    fontStyle: "italic",
                    marginTop: 20,
                    textAlign: "center",
                  },
                  { color: isDarkMode ? "#fff" : "#000" },
                ]}
              >
                No results found
              </Text>
            )}
          </>
        )}
      </ScrollView>
      {!loadingSearch && search.trim() !== "" && (
        <>
          {/* Floating Filter Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 25,
              right: 25,
              backgroundColor: "#FF5ACC",
              padding: 14,
              borderRadius: 32,
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              zIndex: 98,
            }}
            onPress={() => setOpenSortDropdown(!openSortDropdown)}
            onLayout={(event) => setSortButtonLayout(event.nativeEvent.layout)}
            activeOpacity={0.85}
          >
            <Feather name="filter" color="#fff" size={20} />
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

          {/* Dropdown Menu */}
          {openSortDropdown && sortButtonLayout && (
            <View
              style={{
                position: "absolute",
                bottom: 85,
                right: 20,
                minWidth: sortButtonLayout.width + 50,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#FF5ACC",
                backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
                paddingVertical: 6,
                elevation: 10,
                zIndex: 1000,
                shadowColor: isDarkMode ? "#fff" : "#000",
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor:
                      selectedSortOption === opt
                        ? isDarkMode
                          ? "#2a1f38"
                          : "#F9ECF6"
                        : "transparent",
                  }}
                  onPress={() => {
                    setSelectedSortOption(opt);
                    setOpenSortDropdown(false);
                    applySort(opt);
                  }}
                >
                  {/* Radio Button */}
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "#FF5ACC",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                      backgroundColor: "transparent",
                    }}
                  >
                    {selectedSortOption === opt && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#FF5ACC",
                        }}
                      />
                    )}
                  </View>

                  {/* Option Label */}
                  <Text
                    style={{
                      fontSize: 13,
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
      )}

      {/* Update Profile Modal */}
      <Modal
        isVisible={isLogoutModalVisible}
        style={{ justifyContent: "flex-end", margin: 0, padding: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        statusBarTranslucent
        onBackdropPress={() => setLogoutModalVisible(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? "#333" : "#fff" },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: isDarkMode ? "#eee" : "#222" }]}
          >
            Update Profile
          </Text>
          <Image
            source={images.update_profile}
            resizeMode="contain"
            style={{ width: 150, height: 150 }}
          />
          <Text
            style={[
              styles.modalMessage,
              { color: isDarkMode ? "#fff" : "#555" },
            ]}
          >
            Update Your profile for better Experience
          </Text>
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setLogoutModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Remind Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.logoutButton]}
              onPress={handleUpdate}
            >
              <Text style={styles.logoutButtonText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Pills Modal */}
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        backdropOpacity={0.6}
        statusBarTranslucent
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View className="bg-black/60 justify-end px-0">
          <View className="bg-white px-6 pt-5 pb-6 rounded-t-[28px] min-h-[400px]">
            {/* Title */}
            <Text className="text-[20px] font-poppins-semibold text-center mb-3 text-[#222]">
              Filter
            </Text>

            <View className="h-px bg-[#EEE] w-full mb-3" />

            {/* Service At */}
            <Text className="font-poppins-semibold text-[18px] mt-2.5 mb-2 text-[#222]">
              Service At
            </Text>
            <View className="flex-row justify-between mb-3">
              {["Provider Location", "Your Location"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className={`flex-1 mx-1 py-1 rounded-full border items-center ${selectedServiceAt === opt
                    ? "bg-[#FF5ACC] border-[#FF5ACC]"
                    : "bg-transparent border-[#FF5ACC]"
                    }`}
                  onPress={() => setSelectedServiceAt(opt)}
                >
                  <Text
                    className={`${selectedServiceAt === opt
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
            <Text className="font-poppins-semibold text-[18px] mt-2.5 mb-2 text-[#222]">
              Professionals Type
            </Text>
            <View className="flex-row justify-between mb-3">
              {["All", "Solo", "Studio"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className={`flex-1 mx-1 py-1 rounded-full border items-center flex-row justify-center ${selectedProfType === opt
                    ? "bg-[#FF5ACC] border-[#FF5ACC]"
                    : "bg-transparent border-[#FF5ACC]"
                    }`}
                  onPress={() => setSelectedProfType(opt)}
                >
                  <Text
                    className={`${selectedProfType === opt
                      ? "text-white"
                      : "text-[#FF5ACC] "
                      } font-poppins-regular`}
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

            {/* Rating */}
            <Text className="font-poppins-semibold text-[18px] mt-2.5 mb-2 text-[#222]">
              Rating
            </Text>
            <View className="flex-row justify-between mb-3">
              {["All", "5", "4", "3", "2"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className={`flex-1 mx-1 py-1 flex-row items-center justify-center rounded-full border ${selectedRating === opt
                    ? "bg-[#FF5ACC] border-[#FF5ACC]"
                    : "bg-transparent border-[#FF5ACC]"
                    }`}
                  onPress={() => setSelectedRating(opt)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      backgroundColor: "transparent",
                    }}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={selectedRating === opt ? "white" : "#FF5ACC"}
                    />
                    <Text
                      className="font-poppins-regular mt-1"
                      style={{
                        color: selectedRating === opt ? "white" : "#FF5ACC",
                        fontWeight: "600",
                        marginLeft: 4,
                      }}
                    >
                      {opt === "All" ? "All" : opt}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Distance */}
            <Text className="font-poppins-semibold text-[18px] mt-2.5 mb-2 text-[#222]">
              Distance
            </Text>
            <ScrollView horizontal className="flex-row mb-3">
              {["< 1 km", "1 - 5 km", "5 - 10 km", "> 10 km"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className={`flex-1 mx-1 py-2 px-4 rounded-full border items-center ${selectedDistance === opt
                    ? "bg-[#FF5ACC] border-[#FF5ACC]"
                    : "bg-transparent border-[#FF5ACC]"
                    }`}
                  onPress={() => setSelectedDistance(opt)}
                >
                  <Text
                    className={`font-poppins-medium text-sm ${selectedDistance === opt
                      ? "text-white"
                      : "text-[#FF5ACC] "
                      }`}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-3 w-full mt-6">
              <TouchableOpacity
                className="flex-1 py-3 rounded-full border border-[#FF5ACC] items-center bg-transparent"
                onPress={() => {
                  setSelectedServiceAt("Provider Location");
                  setSelectedProfType("All");
                  setSelectedRating("All");
                  setSelectedDistance("All");
                  setFilterModalVisible(false);
                }}
              >
                {filterLoading ? (
                  <Pulse size={22} color="#FF5ACC" /> // 👈 loading spinner
                ) : (
                  <Text className="text-[#FF5ACC] text-base font-poppins-semibold">
                    Reset
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-full items-center bg-[#FF5ACC]"
                onPress={() => {
                  setFilterModalVisible(false);
                  fetchStaffs();
                }}
              >
                {filterLoading ? (
                  <Pulse size={22} color="#FFF" />
                ) : (
                  <Text className="text-white text-base font-poppins-semibold">
                    Apply Filter
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  grabber: {
    width: 60,
    height: 5,
    backgroundColor: "#EFE6F2",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 30,
  },
  modalButtonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButtonText: {
    color: "#FF5ACC",
    fontFamily: "Poppins_600SemiBold",
  },
  logoutButton: {
    backgroundColor: "#FF5ACC",
  },
  logoutButtonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: PRIMARY_LIGHT,
    marginRight: 8,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: PRIMARY,
    marginLeft: 8,
  },
  cancelBtnTxt: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  applyBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginVertical: 10,
  },
  filterLabel: {
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
    alignSelf: "flex-start",
  },
  filterDivider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 12,
    width: "100%",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  pill: {
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginRight: 10,
    marginBottom: 8,
  },
  pillSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pillText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#fff",
  },
  btnRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 30,
    marginBottom: 6,
    width: "100%",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterBtn: {
    padding: 6,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 0,
  },
});

export default Index;
