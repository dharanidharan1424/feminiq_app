/* eslint-disable react-hooks/rules-of-hooks */
import { useAuth } from "@/context/UserContext"; // ✅ import your context
import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Pulse } from "react-native-animated-spinkit";
import About from "./About";
import Gallery from "./Gallery";
import Packages from "./Packages";
import Reviews from "./Reviews";
import Services from "./Services";

const index = () => {
  const params = useLocalSearchParams();
  const { type, backPath, staffData: staffDataString } = params;

  // Parse staffData if it exists, otherwise use params directly
  let staffData = params;
  if (staffDataString && typeof staffDataString === 'string') {
    try {
      const parsed = JSON.parse(staffDataString);
      staffData = { ...parsed, type, backPath };
    } catch (e) {
      console.error("Failed to parse staffData:", e);
    }
  }
  const scrollRef = useRef<ScrollView>(null);
  const [selectedTab, setSelectedTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const { profile, isDarkMode } = useAuth(); // ✅ get dark mode from context
  const [showTravelInfo, setShowTravelInfo] = useState(false);

  const actions = [
    { label: "Message", icon: "chatbubble-ellipses" },
    { label: "Call", icon: "call" },
    { label: "Direction", icon: "location" },
    { label: "Share", icon: "paper-plane" },
  ];

  const Tabs = [
    { title: "About us", id: 1 },
    { title: "Services", id: 2 },
    { title: "Packages", id: 3 },
    { title: "Gallery", id: 4 },
    { title: "Reviews", id: 5 },
  ];

  const SERVICE_DESCRIPTIONS: any = {
    "1": "Hair Styling",
    "2": "Makeup Artist",
    "3": "Manicure",
    "4": "Bridal Makeup",
    "5": "Mehndi Artist",
    "6": "Saree Draping",
    "8": "Pedicure",
    "9": "Skincare Specialist",
    "10": "Threading Expert",
  };

  const tickStaffIds = [
    1, 2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 22, 24, 27, 30, 33, 35, 38, 40,
    42,
  ];

  const handleTabPress = (tabId: number) => {
    setLoading(true);
    setSelectedTab(tabId);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const handleChatPress = () => {
    if (!profile) {
      console.warn("Profile is undefined");
      return null;
    }
    router.push({
      pathname: "/Tabs/Inbox/Chat", // your chat screen path
      params: {
        userId: profile.id, // obtain current logged-in user ID
        userType: "user", // e.g., 'user' or 'staff'
        chatWithId: staffData.id,
        chatWithType: "staff",
        staffName: staffData.name,
        staffImage: staffData.mobile_image_url,
        staffData: JSON.stringify(staffData),
      },
    });
  };

  const getServiceName = (id: any) =>
    SERVICE_DESCRIPTIONS[String(id)] || "Service";

  const profileUrl =
    "https://feminiq.in/service-staffs-details.php?" +
    "staff_id=" +
    encodeURIComponent(
      Array.isArray(staffData.id)
        ? staffData.id.join(",")
        : String(staffData.id)
    ) +
    "&name=" +
    encodeURIComponent(
      Array.isArray(staffData.name)
        ? staffData.name.join(",")
        : String(staffData.name)
    ) +
    "&address=" +
    encodeURIComponent(
      Array.isArray(staffData.address)
        ? staffData.address.join(",")
        : String(staffData.address)
    ) +
    "&distance=" +
    encodeURIComponent(
      Array.isArray(staffData.distance)
        ? staffData.distance.join(",")
        : String(staffData.distance)
    ) +
    "&rating=" +
    encodeURIComponent(
      Array.isArray(staffData.rating)
        ? staffData.rating.join(",")
        : String(staffData.rating)
    ) +
    "&image=" +
    encodeURIComponent(
      Array.isArray(staffData.mobile_image_url)
        ? staffData.mobile_image_url.join(",")
        : String(staffData.mobile_image_url)
    ) +
    "&service=" +
    encodeURIComponent(getServiceName(staffData.service_id)) +
    "&type=" +
    encodeURIComponent(
      Array.isArray(staffData.type)
        ? staffData.type.join(",")
        : String(staffData.type)
    );

  const handleShareProfile = async () => {
    console.log("Sharing profile URL:", profileUrl);
    try {
      await Share.share({
        message: `Check out this profile: ${profileUrl}`,
        title: "Share Profile",
      });
    } catch (error) {
      console.log("Error sharing profile:", error);
    }
  };
  const handleDirectionPress = () => {
    router.push({
      pathname: "/Tabs/Explore",
      params: {
        staff: JSON.stringify(staffData), // serialize entire staff object
      },
    });
  };

  const handleReviewClick = () => {
    router.push({
      pathname: "/Details/ReviewDetials",
      params: {
        data: JSON.stringify(staffData),
      },
    });
  };

  let displayedAddress = staffData.address;
  const city = staffData?.city;

  if (staffData?.type === "solo" && staffData.address) {
    const parts = String(staffData.address).split(",");
    if (parts.length > 1) {
      let mainPart = parts.slice(1).join(",").trim();
      if (
        city &&
        !mainPart.toLowerCase().includes(String(city).toLowerCase())
      ) {
        mainPart = `${mainPart}, ${city}`;
      }
      displayedAddress = mainPart;
    }
  } else if (staffData?.type === "studio" && staffData.address) {
    if (
      city &&
      !String(staffData.address)
        .toLowerCase()
        .includes(String(city).toLowerCase())
    ) {
      displayedAddress = `${staffData.address}, ${city}`;
    }
  }

  // Show tick for all solo and parlour staff
  const showTick = staffData && (staffData.type === "solo" || staffData.type === "parlour");

  const tickColor =
    staffData?.type === "solo"
      ? "#3B82F6" // Blue for Solo
      : staffData?.type === "parlour"
        ? "#10B981" // Green for Parlour
        : null;

  useEffect(() => {
    if (type === "service") setSelectedTab(2);
    else if (type === "package") setSelectedTab(3);
    else setSelectedTab(1);
  }, [type]);

  useEffect(() => {
    const yOffsetByTab: any = {
      1: 300,
      2: 600,
      3: 1200,
      4: 1800,
      5: 2400,
    };
    scrollRef.current?.scrollTo({
      y: yOffsetByTab[selectedTab] || 0,
      animated: true,
    });
  }, [selectedTab]);

  const handleBack = () => {
    switch (backPath) {
      case "explore":
        router.push("/Tabs/Explore");
        break;
      case "booking":
        router.push("/Tabs/Booking");
        break;
      case "cartBooking":
        router.push({
          pathname: "/CartBooking/BookingDetails",
          params: {
            staff: JSON.stringify(staffData),
          },
        });
        break;
      case "default":
        router.push("/Tabs");
        break;

      default:
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/Tabs");
        }
    }
  };

  BackHandler.addEventListener("hardwareBackPress", () => {
    handleBack();
    return true;
  });

  return (
    <ScrollView
      ref={scrollRef}
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#121212" : "#fff",
      }}
    >
      <ImageBackground
        source={{ uri: String(staffData.mobile_image_url) }}
        style={{
          width: "100%",
          height: 250,
        }}
        resizeMode="cover"
      >
        <StatusBar hidden />
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={handleBack}
          color="white"
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 50 : 20,
            left: 10,
            zIndex: 50,
          }}
        />
      </ImageBackground>

      <View className="px-5">
        <View>
          <View className="mt-5 mb-2">
            <View className="flex-row justify-between">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  className={`font-poppins-semibold text-xl ${isDarkMode ? "text-white" : "text-black"
                    }`}
                >
                  {staffData.name}
                </Text>
                {showTick && tickColor && (
                  <MaterialIcons
                    name="verified"
                    color={tickColor}
                    size={20}
                    className="ml-1 mb-1"
                  />
                )}
              </View>

              <TouchableOpacity
                className={`px-6 py-2 rounded-full flex-row items-center border justify-center ${showTick
                  ? "border-green-600 bg-green-100"
                  : "border-red-600 bg-red-200"
                  }`}
              >
                <Ionicons
                  name={showTick ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={showTick ? "#22c55e" : "#ef4444"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`font-poppins-semibold text-center mt-1 ${showTick ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {showTick ? "Open" : "Close"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="my-2" style={{ flexWrap: "wrap" }}>
            <View
              className="flex-row flex-wrap items-center justify-between w-full"
              style={{ gap: 8 }}
            >
              <View className="flex-row items-center max-w-[70%] shrink">
                <Ionicons name="location" size={20} color={"#FF5ACC"} />
                <Text
                  className={`ml-1 font-poppins-regular text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ maxWidth: "100%", flexShrink: 1 }}
                >
                  {displayedAddress}
                </Text>
              </View>

              <View className="my-2" style={{ flexWrap: "wrap" }}>
                <View
                  className="flex-row flex-wrap items-center justify-between w-full"
                  style={{ gap: 8 }}
                >
                  {/* ... preceding address code */}
                  <View className="flex-row items-center w-auto shrink-0 mt-1 md:mt-0">
                    <FontAwesome5 name="road" size={20} color={"#FF5ACC"} />
                    <Text
                      className={`ml-1 font-poppins-regular text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
                    >
                      Travel Radius: {staffData.distance} km
                    </Text>
                    {/* Info Icon for Travel Radius */}
                    <TouchableOpacity
                      onPress={() => setShowTravelInfo(true)}
                      style={{ marginLeft: 6 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color="#FF5ACC"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={handleReviewClick}
              className="flex-row gap-2 items-center"
            >
              <MaterialIcons name="star-half" size={20} color={"#FF5ACC"} />
              <Text
                className={`font-poppins-regular text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
              >
                {staffData.rating}({staffData.reviews} reviews)
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center w-auto shrink-0 mt-1 md:mt-0">
              <Entypo name="suitcase" size={20} color={"#FF5ACC"} />
              <Text
                className={` ml-1 font-poppins-regular text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
              >
                Experience : 4.2 Years
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: isDarkMode ? "#333" : "#e5e7eb",
          }}
          className="flex-row justify-between gap-5 mt-8 pb-3 mb-3"
        >
          {actions.map(({ label, icon }, idx) => (
            <TouchableOpacity
              key={idx}
              className="items-center flex-1"
              onPress={() => {
                switch (label) {
                  case "Message":
                    handleChatPress();
                    console.log("Message action triggered");
                    break;
                  case "Call":
                    Linking.openURL(`tel:9952841275`);
                    console.log("Call action triggered");
                    break;
                  case "Direction":
                    handleDirectionPress();
                    console.log("Direction action triggered");
                    break;
                  case "Share":
                    handleShareProfile();
                    console.log("Share action triggered");
                    break;
                  default:
                    console.log("Unknown action");
                }
              }}
            >
              <View className="bg-pink-100 rounded-full p-4 flex items-center justify-center mb-1.5">
                <Ionicons name={icon as any} size={20} color="#FF5ACC" />
              </View>
              <Text
                className={`text-[12px] font-poppins-medium ${isDarkMode ? "text-white" : "text-black"
                  }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Specialist */}
        <View>
          <View className="flex-row justify-between">
            <Text
              className={`font-poppins-semibold text-xl ${isDarkMode ? "text-white" : "text-black"
                }`}
            >
              Our Specialist
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/Details/Specialist",
                  params: {
                    ...staffData,
                  },
                })
              }
            >
              <Text className="text-md font-poppins-medium text-primary">
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            <View
              className={`mt-5 p-2 rounded-2xl items-center ${isDarkMode ? "border border-gray-700" : "border border-gray-200"
                }`}
            >
              <Image
                source={{ uri: String(staffData.mobile_image_url) }}
                className="w-20 h-20 rounded-xl mb-2"
                resizeMode="cover"
              />
              <Text
                className={`text-xs font-poppins-medium mb-0.5 ${isDarkMode ? "text-white" : "text-black"
                  }`}
              >
                {staffData.name}
              </Text>
              <Text
                className={`text-xs font-poppins-regular ${isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                {getServiceName(staffData.service_id)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 20 }}
        >
          <View className="flex-row items-center gap-5">
            {Tabs.map((value, i) => (
              <View key={i}>
                <TouchableOpacity
                  className={`px-4 py-1 rounded-full border ${selectedTab === value.id ? "bg-primary" : "bg-transparent"
                    } ${isDarkMode ? "border-gray-600" : "border-primary"}`}
                  onPress={() => handleTabPress(value.id)}
                >
                  <Text
                    className={`font-poppins-medium ${selectedTab === value.id
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-200"
                        : "text-primary"
                      }`}
                  >
                    {value.title}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Tab Content */}
        <View style={{ minHeight: 400 }}>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 40,
              }}
            >
              <Pulse size={50} color="#FF5ACC" />
            </View>
          ) : (
            <View className="my-5">
              {selectedTab === 1 && <About data={staffData} />}
              {selectedTab === 2 && <Services />}
              {selectedTab === 3 && <Packages data={staffData} />}
              {selectedTab === 4 && <Gallery data={staffData} />}
              {selectedTab === 5 && <Reviews data={staffData} />}
            </View>
          )}
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTravelInfo}
        onRequestClose={() => setShowTravelInfo(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: isDarkMode ? "#222" : "#fff",
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.24,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_600SemiBold",
                color: isDarkMode ? "#fff" : "#222",
                marginBottom: 12,
                textAlign: "center",
              }}
              className="border-b border-primary pb-2"
            >
              What is Travel Radius?
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
                color: isDarkMode ? "#ccc" : "#555",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              The Travel Radius indicates the willingness of the Artist to
              travel from the point of their location for the service booked by
              the customer.
            </Text>
            <Pressable
              onPress={() => setShowTravelInfo(false)}
              style={{
                backgroundColor: "#FF5ACC",
                paddingVertical: 8,
                paddingHorizontal: 24,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default index;
