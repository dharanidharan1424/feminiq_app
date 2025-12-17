import { View, Text, TouchableOpacity, Image, Modal } from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/UserContext"; // ✅ import context
import { router } from "expo-router";

interface AboutProps {
  data: any;
}

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

const About: React.FC<AboutProps> = ({ data }) => {
  const { isDarkMode } = useAuth(); // ✅ get dark mode state
  const [modalVisible, setModalVisible] = useState(false);
  let displayedAddress = data.address;
  const city = data?.city;

  if (data?.type === "solo" && data.address) {
    const parts = data.address.split(",");
    if (parts.length > 1) {
      let mainPart = parts.slice(1).join(",").trim();
      if (city && !mainPart.toLowerCase().includes(city.toLowerCase())) {
        mainPart = `${mainPart}, ${city}`;
      }
      displayedAddress = mainPart;
    }
  } else if (data?.type === "studio" && data.address) {
    if (city && !data.address.toLowerCase().includes(city.toLowerCase())) {
      displayedAddress = `${data.address}, ${city}`;
    }
  }

  const handleDirectionPress = () => {
    router.push({
      pathname: "/Tabs/Explore",
      params: {
        staff: JSON.stringify(data), // serialize entire staff object
      },
    });
  };

  const serviceDescription =
    SERVICE_DESCRIPTIONS[String(data.service_id)] ?? "Service";

  return (
    <View
      style={{
        paddingVertical: 20,
        borderRadius: 16,
        backgroundColor: isDarkMode ? "#121212" : "#fff",
      }}
    >
      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{
          fontSize: 13,
          marginBottom: 2,
          color: isDarkMode ? "#d1d5db" : "#6b7280",
        }}
        className="font-poppins-regular text-justify"
      >
        We are proud to be one of the most trusted names in the industry,
        offering reliable and personalized {serviceDescription} to a wide range
        of customers. Our professionals are trained and certified, ensuring that
        each service is handled with care, dedication, and attention to detail.
        Whether you’re at your home or visiting our provider location, we
        guarantee a seamless experience backed by years of expertise and
        satisfied clients.
      </Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text className="text-primary font-poppins-medium mb-3">Read More</Text>
      </TouchableOpacity>

      {/* Working Hours */}
      <View style={{ marginBottom: 14 }}>
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: 15,
            marginBottom: 6,
            color: isDarkMode ? "#fff" : "#000",
          }}
        >
          Working Hours
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <Text
            className={`font-poppins-regular text-[13px] ${
              isDarkMode ? "text-gray-400" : "text-neutral-600"
            }`}
          >
            Monday - Friday
          </Text>
          <Text
            className={`font-poppins-medium text-md ${
              isDarkMode ? "text-gray-200" : "text-black"
            }`}
          >
            08:00 AM - 21:00 PM
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            className={`font-poppins-regular text-[13px] ${
              isDarkMode ? "text-gray-400" : "text-neutral-600"
            }`}
          >
            Saturday - Sunday
          </Text>
          <Text
            className={`font-poppins-medium text-md ${
              isDarkMode ? "text-gray-200" : "text-black"
            }`}
          >
            10:00 AM - 20:00 PM
          </Text>
        </View>
      </View>

      {/* Service At */}
      <View style={{ marginBottom: 20 }}>
        <Text
          className={`font-poppins-semibold ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Service At
        </Text>
        <Text
          className={`font-poppins-regular mt-3 text-sm ${
            isDarkMode ? "text-gray-400" : "text-neutral-500"
          }`}
        >
          Customer&apos;s Location & Provider&apos;s Location
        </Text>
      </View>

      {/* Our Location */}
      <View style={{ marginBottom: 30 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            className={`font-poppins-semibold ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Our Location
          </Text>
          <TouchableOpacity onPress={handleDirectionPress}>
            <Text className="font-poppins-medium text-primary text-sm">
              See on Maps
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-1">
          <MaterialIcons name="location-pin" size={20} color={"#FF5ACC"} />
          <Text
            className={`font-poppins-regular mt-1 text-[12px] ${
              isDarkMode ? "text-gray-400" : "text-neutral-500"
            }`}
          >
            {displayedAddress}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#FF5ACC",
          borderRadius: 28,
          paddingVertical: 14,
          alignItems: "center",
          marginTop: 18,
        }}
        onPress={() => router.push("/Details/ServicesView")}
      >
        <Text
          style={{
            color: "#fff",
            fontFamily: "Poppins_600SemiBold",
            fontSize: 16,
          }}
        >
          Explore
        </Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.10)", // semi-transparent overlay background
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#222" : "#fff",
              borderRadius: 12,
              maxWidth: 900,
              width: "98%",
              padding: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ alignSelf: "flex-end", marginTop: 2, marginBottom: 4 }}
            >
              <MaterialIcons name="close" size={28} color="#FF5ACC" />
            </TouchableOpacity>
            <Image
              source={{ uri: data.mobile_image_url }}
              style={{
                width: 300,
                minHeight: 150,
                borderRadius: 10,
                backgroundColor: "#ececec",
              }}
              resizeMode="cover"
            />
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  color: "#FF5ACC",
                  marginVertical: 10,
                }}
              >
                About Our {serviceDescription} Services
              </Text>
              <Text
                className="text-justify"
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_400Regular",

                  color: isDarkMode ? "#EEE" : "#222",
                }}
              >
                We are proud to be one of the most trusted names in the
                industry, offering reliable and personalized{" "}
                {serviceDescription} to a wide range of customers.
                {"\n"}Our professionals are trained and certified, ensuring that
                each service is handled with care, dedication, and attention to
                detail.
                {"\n"}Whether you&apos;re at your home or visiting our provider
                location, we guarantee a seamless experience backed by years of
                expertise and satisfied clients.
              </Text>
              <View className="my-2 ">
                <Text className="font-poppins-medium">Visit us at:</Text>
                <View className="flex-row items-center">
                  <Text className="font-poppins-semibold text-primary">
                    {data.address}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default About;
