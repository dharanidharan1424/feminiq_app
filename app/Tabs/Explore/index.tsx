import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Animated,
  Linking,
  BackHandler,
  PanResponder,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileCard from "@/components/CustomCard";
import { Chase } from "react-native-animated-spinkit";
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import locations from "@/constants/locations.json";
import { useAuth } from "@/context/UserContext";
import MapViewDirections from "react-native-maps-directions";
import { router, useLocalSearchParams } from "expo-router";

const LOCATION_STORAGE_KEY = "user_location";
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Staff {
  longitude: null | string | number;
  latitude: null | string | number;
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  service_id: string;
  image: string;
  mobile_image_url: string;
  type: string;
  average_rating?: string; // if any
  hourly_rate?: string;
  reviews?: string;
  price?: string; // if 'pricets' is typo for 'price'
  city?: string;
}

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

const SORT_OPTIONS = [
  "Relevance",
  "Distance (Low to High)",
  "Distance (High to Low)",
  "Rating (Low to High)",
  "Rating (High to Low)",
];

export default function NearbyStaffMap() {
  const params = useLocalSearchParams();
  const { toggleBookmark, bookmarkedStaffs, isDarkMode } = useAuth();
  const [locationName, setLocationName] = useState<string>(
    "Loading location..."
  );
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [searchLocation, setSearchLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [routeStaff, setRouteStaff] = useState<Staff | null>(null);
  const [distanceText, setDistanceText] = useState<string>("");
  const [durationText, setDurationText] = useState<string>("");
  const [travelMode, setTravelMode] = useState<string>("DRIVING");
  const [parsedStaff, setParsedStaff] = useState<Staff | null>(null);
  const [distanceLoading, setDistanceLoading] = useState<boolean>(false);
  const [selectedServiceButton, setSelectedServiceButton] = useState("All");
  const mapRef = useRef<MapView>(null);
  const [selectedSortOption, setSelectedSortOption] = useState(SORT_OPTIONS[0]);
  const [sortButtonLayout, setSortButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<"sort" | null>(null);

  const [radiusModal, setRadiusModal] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(1);

  const radiusOptions = [
    { label: "1 km", value: 1 },
    { label: "3 km", value: 3 },
    { label: "5 km", value: 5 },
    { label: ">10 km", value: 10 },
  ];

  const radiusInMeters = selectedRadius === 10 ? 15000 : selectedRadius * 1000;

  const MAP_MAX_HEIGHT = SCREEN_HEIGHT / 2.5;

  // State to store dynamic map height
  const [mapHeight, setMapHeight] = useState(MAP_MAX_HEIGHT);

  // Ref for animated value for smoother transitions (optional)
  const animatedMapHeight = useRef(new Animated.Value(MAP_MAX_HEIGHT)).current;

  // PanResponder to handle vertical drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // User pulls down = positive dy, user pulls up = negative dy
        let newHeight = mapHeight + gestureState.dy;
        if (newHeight < 100) newHeight = 100;
        if (newHeight > MAP_MAX_HEIGHT) newHeight = MAP_MAX_HEIGHT;
        animatedMapHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Stick at the last valid position, don’t reset
        let newHeight = mapHeight + gestureState.dy;
        if (newHeight < 100) newHeight = 100;
        if (newHeight > MAP_MAX_HEIGHT) newHeight = MAP_MAX_HEIGHT;

        setMapHeight(newHeight);
        Animated.timing(animatedMapHeight, {
          toValue: newHeight,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const jitter = (val: any) => val + (Math.random() - 0.5) * 0.001;
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    })();
  }, []);

  useEffect(() => {
    if (!params?.staff) {
      setParsedStaff(null);
      return;
    }
    try {
      const staffString = Array.isArray(params.staff)
        ? params.staff[0]
        : params.staff;
      const parsed =
        typeof staffString === "string" ? JSON.parse(staffString) : staffString;
      setParsedStaff(parsed);
    } catch (e) {
      console.error("Failed to parse staff param", e);
      setParsedStaff(null);
    }
  }, [params?.staff]);

  // Request location and set current location + name
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationName("Permission to access location denied");
        Alert.alert("Permission denied", "Location permission is required.");
        setIsLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      if (location) {
        setCurrentLocation(location.coords);

        // Animate map to current location
        mapRef.current?.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          1000
        );

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
            await AsyncStorage.setItem(LOCATION_STORAGE_KEY, formattedLocation);
          } catch (e) {
            console.error("Failed to save location", e);
          }
        } else {
          setLocationName("Unknown Location");
        }
      }
      setIsLoading(false);
    })();
  }, []);

  // Fetch staffs from API
  const fetchStaffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://feminiq-backend.onrender.com/api/get-staffs"
      );
      const json = await response.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        const validStaffs = json.data.filter(
          (s: Staff) =>
            s.latitude !== null &&
            s.longitude !== null &&
            s.latitude !== "null" &&
            s.longitude !== "null" &&
            s.latitude !== undefined &&
            s.longitude !== undefined
        );
        setStaffs(validStaffs);
        setFilteredStaffs(validStaffs);
      }
    } catch (error) {
      console.error("Failed to fetch staffs", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const fetchSuggestions = (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    const lower = text.toLowerCase();
    const results: string[] = [];

    Object.entries(locations).forEach(([state, districts]) => {
      // Check state name match
      if (state.toLowerCase().includes(lower)) {
        results.push(state);
      }
      // districts is an object of { districtName: {latitude, longitude}, ... }
      if (
        districts &&
        typeof districts === "object" &&
        !Array.isArray(districts)
      ) {
        Object.keys(districts).forEach((district) => {
          if (district.toLowerCase().includes(lower)) {
            results.push(`${district}, ${state}`);
          }
        });
      }
    });

    setSuggestions(results.slice(0, 10));
  };

  // Geocode search city name to get lat/lng
  const handleSearch = async (searchTerm?: string) => {
    let query = searchTerm ?? search;
    if (query.includes(",")) {
      const parts = query.split(",").map((p) => p.trim());
      query = parts[0]; // Use district name for lookup
    }

    if (!query) {
      setSearch("");
      setSearchLocation(null);
      setSelectedStaff(null);
      return;
    }
    let foundCoords: { latitude: number; longitude: number } | null = null;

    const lowerQuery = query.toLowerCase();

    // Search in locations.json
    for (const [state, districts] of Object.entries(locations)) {
      if (state.toLowerCase() === lowerQuery) {
        if (
          districts &&
          typeof districts === "object" &&
          !Array.isArray(districts)
        ) {
          const firstDistrict = Object.values(districts)[0] as {
            latitude: number;
            longitude: number;
          };
          if (firstDistrict) {
            foundCoords = firstDistrict;
            break;
          }
        }
      }

      if (
        districts &&
        typeof districts === "object" &&
        !Array.isArray(districts)
      ) {
        for (const [district, coord] of Object.entries(districts)) {
          if (district.toLowerCase() === lowerQuery) {
            foundCoords = coord as { latitude: number; longitude: number };
            break;
          }
        }
        if (foundCoords) break;
      }
    }
    console.log(
      "Search term:",
      query,
      "Matched coordinates:",
      foundCoords,
      "staffs",

      "Filtered staffs latitudes and longitudes:",
      filteredStaffs.map((staff) => ({
        latitude:
          typeof staff.latitude === "string"
            ? parseFloat(staff.latitude)
            : staff.latitude,
        longitude:
          typeof staff.longitude === "string"
            ? parseFloat(staff.longitude)
            : staff.longitude,
      }))
    );
    if (foundCoords) {
      const locationObj = {
        latitude: foundCoords.latitude,
        longitude: foundCoords.longitude,
        altitude: 0,
        accuracy: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      };

      setSearch(query);
      setSearchLocation(locationObj);
      setSelectedStaff(null);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: foundCoords.latitude,
            longitude: foundCoords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          1000
        );
      }
      const updated = [
        query,
        ...recentSearches.filter((r) => r !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem("recent_searches", JSON.stringify(updated));
    } else {
      Alert.alert(
        "Location not found",
        "Please enter a valid state or district."
      );
      setSearchLocation(null);
      setSelectedStaff(null);
    }
  };

  // Handle suggestion click

  // Calculate distance between two lat/lng points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in km
  };

  const centerLocation = searchLocation ?? currentLocation;

  const previousFilteredStaffs = useRef<Staff[]>([]);

  useEffect(() => {
    if (parsedStaff) {
      setFilteredStaffs([parsedStaff]);
      setSelectedStaff(parsedStaff);
      setShowRoute(true);
      setRouteStaff(parsedStaff); // use parsed staff from params
      return; // stop further filtering
    }

    if (!centerLocation) return;

    let filtered: Staff[];

    if (searchLocation) {
      filtered = staffs.filter((s) => {
        if (s.latitude == null || s.longitude == null) return false;
        const latNum =
          typeof s.latitude === "string" ? parseFloat(s.latitude) : s.latitude;
        const lonNum =
          typeof s.longitude === "string"
            ? parseFloat(s.longitude)
            : s.longitude;

        const dist = calculateDistance(
          centerLocation.latitude,
          centerLocation.longitude,
          latNum,
          lonNum
        );
        return dist <= 10;
      });
    } else if (currentLocation) {
      filtered = staffs.filter((s) => {
        if (s.latitude == null || s.longitude == null) return false;
        const latNum =
          typeof s.latitude === "string" ? parseFloat(s.latitude) : s.latitude;
        const lonNum =
          typeof s.longitude === "string"
            ? parseFloat(s.longitude)
            : s.longitude;
        const dist = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          latNum,
          lonNum
        );
        return dist <= 10;
      });
    } else {
      return null;
    }
    const selectedService = services.find(
      (svc) => svc.title === selectedServiceButton
    );
    if (selectedService && selectedService.categoryId != null) {
      filtered = filtered.filter(
        (staff) =>
          String(staff.service_id) === String(selectedService.categoryId)
      );
    }

    // --- 3. Sort option ---
    switch (selectedSortOption) {
      case "Distance (Low to High)":
        filtered = [...filtered].sort((a, b) => a.distance - b.distance);
        break;
      case "Distance (High to Low)":
        filtered = [...filtered].sort((a, b) => b.distance - a.distance);
        break;
      case "Rating (Low to High)":
        filtered = [...filtered].sort(
          (a, b) =>
            (typeof a.rating === "number" ? a.rating : parseFloat(a.rating)) -
            (typeof b.rating === "number" ? b.rating : parseFloat(b.rating))
        );
        break;
      case "Rating (High to Low)":
        filtered = [...filtered].sort(
          (a, b) =>
            (typeof b.rating === "number" ? b.rating : parseFloat(b.rating)) -
            (typeof a.rating === "number" ? a.rating : parseFloat(a.rating))
        );
        break;
      case "Relevance":
      default:
        break;
    }

    setFilteredStaffs(filtered);
  }, [
    staffs,
    searchLocation,
    parsedStaff,
    centerLocation,
    currentLocation,
    search,
    selectedSortOption,
    selectedServiceButton,
  ]);
  const getColor = (light: any, dark: any) => (isDarkMode ? dark : light);

  const renderStaffCard = ({ item }: { item: Staff }) => (
    <ProfileCard
      data={item}
      avatar={{ uri: item.mobile_image_url }}
      name={item.name}
      address={item.address}
      distance={item.distance ? Number(item.distance).toFixed(1) : "N/A"}
      rating={item.rating ? Number(item.rating).toFixed(1) : "N/A"}
      bookmarked={bookmarkedStaffs.some((staff) => staff.id === item.id)}
      onBookmarkPress={() => toggleBookmark(item)}
      backPath="explore"
    />
  );
  const handleViewDetails = (staffData: any) => {
    router.push({
      pathname: "/Details",
      params: { ...staffData, backPath: "explore" },
    });
    setShowDirectionsModal(false);
  };

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Optionally close app when no back route:
        // BackHandler.exitApp();
      }
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={[
          styles.container,
          isDarkMode
            ? { backgroundColor: "#121212" }
            : { backgroundColor: "#fff" },
        ]}
      >
        <Animated.View
          style={[styles.mapContainer, { height: animatedMapHeight }]}
        >
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 10.379663,
              longitude: 78.820847,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation={false}
          >
            {currentLocation && !searchLocation && (
              <>
                <Circle
                  center={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  radius={radiusInMeters}
                  fillColor="rgba(135, 206, 250, 0.3)"
                  strokeColor="rgba(135, 206, 250, 0.7)"
                />
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                >
                  <View style={styles.userLocationMarker}>
                    <View style={styles.userLocationCore} />
                  </View>
                </Marker>
              </>
            )}
            {showRoute && routeStaff && (currentLocation || searchLocation) && (
              <MapViewDirections
                origin={{
                  latitude:
                    currentLocation?.latitude ?? searchLocation?.latitude ?? 0,
                  longitude:
                    currentLocation?.longitude ??
                    searchLocation?.longitude ??
                    0,
                }}
                destination={{
                  latitude:
                    typeof routeStaff.latitude === "string"
                      ? parseFloat(routeStaff.latitude)
                      : (routeStaff.latitude ?? 0),
                  longitude:
                    typeof routeStaff.longitude === "string"
                      ? parseFloat(routeStaff.longitude)
                      : (routeStaff.longitude ?? 0),
                }}
                apikey="AIzaSyCZ-OMkJfjg--0GLY91S3az8hVf17kh3S4"
                strokeWidth={4}
                strokeColor="#FF5ACC"
                mode={travelMode.toUpperCase() as "DRIVING" | "WALKING"}
                onReady={(result) => {
                  setDistanceLoading(false);
                  if (
                    result.coordinates &&
                    result.legs &&
                    result.legs.length > 0
                  ) {
                    const totalDistanceMeters = result.legs.reduce(
                      (sum, leg) => sum + (leg.distance?.value ?? 0),
                      0
                    );
                    const totalDurationSeconds = result.legs.reduce(
                      (sum, leg) => sum + (leg.duration?.value ?? 0),
                      0
                    );
                    const distanceKm = totalDistanceMeters / 1000;
                    const durationMin = totalDurationSeconds / 60;
                    setDistanceText(distanceKm.toFixed(1) + " km");
                    setDurationText(durationMin.toFixed(0) + " mins");
                  }
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
                    animated: true,
                  });
                }}
                onStart={() => setDistanceLoading(true)}
                onError={(errorMessage) => {
                  setDistanceLoading(false);
                  console.error("Directions error:", errorMessage);
                }}
              />
            )}
            {filteredStaffs.map(
              (staff) =>
                staff.latitude != null &&
                staff.longitude != null && (
                  <Marker
                    key={staff.id}
                    coordinate={{
                      latitude: jitter(
                        typeof staff.latitude === "string"
                          ? parseFloat(staff.latitude)
                          : staff.latitude
                      ),
                      longitude: jitter(
                        typeof staff.longitude === "string"
                          ? parseFloat(staff.longitude)
                          : staff.longitude
                      ),
                    }}
                    onPress={() => {
                      setSelectedStaff(staff);
                      setRouteStaff(null);
                      setShowRoute(false);
                      setShowDirectionsModal(true);
                    }}
                  >
                    <Image
                      source={{ uri: staff.mobile_image_url }}
                      style={styles.markerImage}
                    />
                  </Marker>
                )
            )}
          </MapView>
          {/* Floating locate button */}
          <TouchableOpacity
            style={[
              styles.locateButton,
              isDarkMode
                ? { backgroundColor: "#1e1e1e" }
                : { backgroundColor: "#fff" },
            ]}
            onPress={() => {
              if (currentLocation) {
                mapRef.current?.animateToRegion(
                  {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  },
                  1000
                );
              }
              setSearch("");
              setSearchLocation(null);
              setSelectedStaff(null);
            }}
          >
            <Ionicons
              name="locate"
              size={24}
              color={isDarkMode ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          {/* Search bar */}
          <View
            style={[
              styles.searchContainer,
              isDarkMode
                ? { backgroundColor: "#1e1e1e" }
                : { backgroundColor: "#fff" },
            ]}
          >
            <View className="flex-row items-center">
              <MaterialIcons
                name="my-location"
                size={20}
                color={isDarkMode ? "#999" : "gray"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  { flex: 1 },
                  isDarkMode ? { color: "#fff" } : { color: "#000" },
                ]}
                placeholder="Search by locations..."
                placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  fetchSuggestions(text);
                }}
                clearButtonMode="while-editing"
                autoCorrect={false}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearch("");
                    setSearchLocation(null);
                    setSelectedStaff(null);
                    setSuggestions([]);
                  }}
                  style={{ marginRight: 8 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={isDarkMode ? "#999" : "gray"}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleSearch()}>
                <Ionicons
                  name="search"
                  size={22}
                  color={isDarkMode ? "#999" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Suggestions/Recent Searches dropdown */}
          {isInputFocused &&
            (search.length > 0
              ? suggestions.length > 0
              : recentSearches.length > 0) && (
              <View
                style={[
                  styles.suggestionsContainer,
                  isDarkMode
                    ? { backgroundColor: "#1e1e1e" }
                    : { backgroundColor: "#fff" },
                ]}
              >
                <FlatList
                  data={search.length > 0 ? suggestions : recentSearches}
                  keyExtractor={(item, index) => item + index}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.suggestionItem,
                        isDarkMode
                          ? { borderBottomColor: "#333" }
                          : { borderBottomColor: "#eee" },
                      ]}
                      onPress={() => {
                        if (search.length > 0) {
                          handleSearch(item);
                        } else {
                          handleSearch(item);
                        }
                        setIsInputFocused(false);
                        Keyboard.dismiss();
                      }}
                    >
                      <Ionicons
                        name={
                          search.length > 0
                            ? "location-outline"
                            : "time-outline"
                        }
                        size={18}
                        color={isDarkMode ? "#999" : "gray"}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={
                          isDarkMode ? { color: "#fff" } : { color: "#000" }
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
        </Animated.View>
        <Animated.View
          style={[
            styles.listContainer,
            isDarkMode
              ? { backgroundColor: "#121212" }
              : { backgroundColor: "#fff" },
          ]}
          className="border border-gray-300 border-b-white"
          {...panResponder.panHandlers}
        >
          <View
            style={{
              width: 40,
              height: 6,
              backgroundColor: "#ccc",
              borderRadius: 3,
              alignSelf: "center",
              marginVertical: 10,
            }}
          />
          {!parsedStaff && !selectedStaff && (
            <View
              style={styles.headingContainer}
              className="border-b border-gray-300 mb-2 "
            >
              <View className="flex-row items-center gap-2">
                <Text
                  style={[
                    styles.heading,
                    isDarkMode ? { color: "#fff" } : { color: "#000" },
                  ]}
                >
                  {selectedStaff ? "Selected Staff" : "Nearby Locations"}
                </Text>
                {!selectedStaff && (
                  <Text
                    style={[
                      styles.staffCount,
                      isDarkMode ? { color: "#FF5ACC" } : { color: "#FF5ACC" },
                    ]}
                  >
                    ( {filteredStaffs.length} )
                  </Text>
                )}
              </View>
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
                  minWidth: 90,
                  marginRight: 8,
                }}
                onPress={() => {
                  setRadiusModal(true);
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
                  {selectedRadius} km
                </Text>
                <Feather name="chevron-down" size={14} color="#FF5ACC" />
              </TouchableOpacity>

              {/* MODAL */}
              <Modal
                visible={radiusModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setRadiusModal(false)}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      width: "85%",
                      borderRadius: 20,
                      padding: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#222",
                        textAlign: "center",
                        marginBottom: 20,
                      }}
                      className="border-b border-gray-300 pb-2 mb-4"
                    >
                      Select Distance Radius
                    </Text>

                    {/* 2x2 Grid of Radius Buttons */}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      {radiusOptions.map((option) => {
                        const isSelected = selectedRadius === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={{
                              width: "47%",
                              backgroundColor: isSelected ? "#FF5ACC" : "#fff",
                              borderColor: "#FF5ACC",
                              borderWidth: 2,
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                              paddingVertical: 20,
                              marginBottom: 12,
                            }}
                            activeOpacity={0.8}
                            onPress={() => setSelectedRadius(option.value)}
                          >
                            {isSelected && (
                              <MaterialIcons
                                name="check-circle"
                                size={22}
                                color="#fff"
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                }}
                              />
                            )}
                            <MaterialIcons
                              name="location-on"
                              size={28}
                              color={isSelected ? "#fff" : "#FF5ACC"}
                            />
                            <Text
                              style={{
                                color: isSelected ? "#fff" : "#FF5ACC",
                                fontFamily: "Poppins_500Medium",
                                marginTop: 6,
                                fontSize: 14,
                              }}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      onPress={() => setRadiusModal(false)}
                      style={{
                        backgroundColor: "#FF5ACC",
                        paddingVertical: 12,
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          color: "#fff",
                          fontFamily: "Poppins_600SemiBold",
                          fontSize: 16,
                        }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          )}
          {isLoading && (
            <View className="flex-row items-center justify-center">
              <Chase size={50} color="#FF5ACC" />
            </View>
          )}
          {!isLoading && (
            <View>
              <FlatList
                data={services}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.title}
                contentContainerStyle={{
                  gap: 10,
                  paddingHorizontal: 10,
                  marginVertical: 10,
                }}
                renderItem={({ item }) => {
                  const isSelected = selectedServiceButton === item.title;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedServiceButton(item.title)}
                      style={{
                        borderWidth: 2,
                        marginHorizontal: 4,
                        paddingHorizontal: 18,
                        borderRadius: 99,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected ? "#FF5ACC" : "#FFF",
                        borderColor: "#FF5ACC",
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Poppins_500Medium",
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
          )}
          {routeStaff && (
            <View
              className={`px-5 pb-10 mt-4 rounded-t-3xl shadow-lg shadow-primary/30/50 items-center space-y-4 ${
                isDarkMode ? "bg-[#1e1e1e]" : "bg-white"
              }`}
            >
              <View className="flex flex-row items-center w-full space-x-4">
                <Image
                  source={{ uri: routeStaff.mobile_image_url }}
                  className="w-16 h-16 rounded-full border-2 border-primary/40"
                />
                <View className="flex-1 ml-2">
                  <Text
                    className={`text-lg font-semibold font-poppins-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {routeStaff.name}
                  </Text>
                  <Text
                    className={`text-sm font-poppins-regular ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {routeStaff.address}
                  </Text>
                </View>
              </View>
              <View className="flex flex-row justify-between w-full px-5 my-2">
                <View className="flex flex-row items-center gap-2">
                  <FontAwesome5 name="road" size={16} color="#FF5ACC" />
                  {distanceLoading ? (
                    <Chase size={10} color="#FFACC" />
                  ) : (
                    <Text className="text-sm text-primary font-poppins-semibold">
                      Distance:{" "}
                      {distanceText || <Chase size={10} color="#FFACC" />}
                    </Text>
                  )}
                </View>
                <View className="flex flex-row items-center gap-2">
                  <MaterialIcons name="access-time" size={16} color="#FF5ACC" />
                  {distanceLoading ? (
                    <Chase size={10} color="#FFACC" />
                  ) : (
                    <Text className="text-sm text-primary font-poppins-semibold">
                      Duration:{" "}
                      {durationText || <Chase size={10} color="#FFACC" />}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex flex-row justify-center gap-5 w-full my-2">
                {(["DRIVING", "WALKING"] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    className={`flex-row items-center gap-2 px-4 py-1 rounded-full border ${
                      travelMode === mode
                        ? "bg-primary border-primary"
                        : "border-primary bg-primary/20"
                    }`}
                    onPress={() => setTravelMode(mode)}
                  >
                    {mode === "DRIVING" ? (
                      <Ionicons
                        name="car"
                        size={16}
                        color={travelMode === mode ? "white" : "#FF5ACC"}
                      />
                    ) : (
                      <Ionicons
                        name="walk"
                        size={16}
                        color={travelMode === mode ? "white" : "#FF5ACC"}
                      />
                    )}
                    <Text
                      className={`text-xs font-poppins-semibold ${
                        travelMode === mode ? "text-white" : "text-primary"
                      }`}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row items-center justify-center gap-5">
                <TouchableOpacity
                  className="flex-row items-center gap-2 bg-red-200 border border-red-500 rounded-full px-4 py-2 mt-2"
                  onPress={() => {
                    setShowRoute(false);
                    setRouteStaff(null);
                    setFilteredStaffs(previousFilteredStaffs.current);
                    setSelectedStaff(null);
                    setDistanceText("");
                    setDurationText("");
                    setParsedStaff(null);
                    router.push({
                      pathname: "/Details",
                      params: {
                        ...selectedStaff,
                        backPath: "default",
                      },
                    });
                  }}
                >
                  <Entypo name="cross" size={24} color="red" />
                  <Text className="font-poppins-semibold text-base text-red-500">
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-2 bg-[#28a745]/30 border border-[#28a745] rounded-full px-4 py-2 mt-2"
                  onPress={() => {
                    if (routeStaff && currentLocation) {
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${routeStaff.latitude},${routeStaff.longitude}&travelmode=${travelMode.toLowerCase()}`;
                      Linking.openURL(url).catch((err) =>
                        console.error("An error occurred", err)
                      );
                    }
                  }}
                >
                  <Ionicons name="navigate" size={24} color="#28a745" />
                  <Text className="text-[#28a745] font-poppins-semibold text-base">
                    Navigate
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {!isLoading && selectedStaff && !routeStaff && (
            <FlatList
              data={[selectedStaff]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStaffCard}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            />
          )}
          {!isLoading && !selectedStaff && filteredStaffs.length === 0 && (
            <Text
              style={[
                styles.noStaffText,
                isDarkMode ? { color: "#aaa" } : { color: "#555" },
              ]}
            >
              No Artists available in this area.
            </Text>
          )}
          {!isLoading && !selectedStaff && filteredStaffs.length > 0 && (
            <FlatList
              data={filteredStaffs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStaffCard}
            />
          )}
        </Animated.View>
        {!isLoading && selectedStaff && !routeStaff && (
          <TouchableOpacity
            className="absolute bottom-8 right-5 bg-primary rounded-full"
            style={{
              borderColor: "#FF5ACC",
              borderWidth: 2,
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
            onPress={() =>
              setOpenDropdown(openDropdown === "sort" ? null : "sort")
            }
            onLayout={(event) => {
              setSortButtonLayout(event.nativeEvent.layout);
            }}
            activeOpacity={0.8}
          >
            <Feather name="filter" color={"#fff"} size={20} />
          </TouchableOpacity>
        )}
        {openDropdown === "sort" && sortButtonLayout && (
          <View
            style={{
              position: "absolute",
              top: sortButtonLayout.y - 220,
              left: sortButtonLayout.x - 200 + sortButtonLayout.width / 2,
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

        <Modal
          visible={showDirectionsModal}
          transparent
          statusBarTranslucent
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                isDarkMode
                  ? { backgroundColor: "#1e1e1e" }
                  : { backgroundColor: "#fff" },
              ]}
            >
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Image
                  source={{ uri: selectedStaff?.mobile_image_url }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <Text
                  className="font-poppins-semibold my-1"
                  style={isDarkMode ? { color: "#fff" } : { color: "#000" }}
                >
                  {selectedStaff?.name}
                </Text>
                <Text
                  className="font-poppins-regular text-primary"
                  style={
                    isDarkMode ? { color: "#FF5ACC" } : { color: "#FF5ACC" }
                  }
                >
                  {selectedStaff?.address}
                </Text>
              </View>
              <View className="flex-row justify-between gap-4 px-2">
                <TouchableOpacity
                  className="bg-primary rounded-full px-5 py-1"
                  onPress={() => handleViewDetails(selectedStaff)}
                >
                  <Text className="font-poppins-semibold text-white">
                    View Details
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-primary/20 border border-primary rounded-full px-5 py-1"
                  onPress={() => {
                    previousFilteredStaffs.current = filteredStaffs;
                    setShowRoute(true);
                    setShowDirectionsModal(false);
                    if (selectedStaff) setRouteStaff(selectedStaff);
                    setFilteredStaffs(selectedStaff ? [selectedStaff] : []);
                  }}
                >
                  <Text
                    className="font-poppins-semibold"
                    style={
                      isDarkMode ? { color: "#FF5ACC" } : { color: "#FF5ACC" }
                    }
                  >
                    View Direction
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mapContainer: { position: "relative" },
  map: { flex: 1 },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  staffCount: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#FF5ACC",
  },
  heading: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  routeDetailsContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  modeSelector: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-around",
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#999",
  },
  modeButtonSelected: {
    backgroundColor: "#FF5ACC",
    borderColor: "#FF5ACC",
  },
  modeText: {
    color: "#555",
    fontFamily: "Poppins_600SemiBold",
  },
  modeTextSelected: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  closeDirectionsButton: {
    marginTop: 10,
    backgroundColor: "#FF5ACC",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeDirectionsButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },

  searchInput: {
    height: 50,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    marginTop: 2,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3399FF",
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },

  listContainer: {
    flex: 1,
    paddingTop: 10,
    borderTopLeftRadius: 24, // Adjust to your desired radius
    borderTopRightRadius: 24, // Adjust to your desired radius
    overflow: "hidden", // Ensures child content respects border radius
    backgroundColor: "transparent", // Optional: transparency for visual stack
  },
  noStaffText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginTop: 20,
  },
  locateButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    elevation: 4,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
