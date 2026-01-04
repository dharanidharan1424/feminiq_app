/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Modal from "react-native-modal";

import { Wave } from "react-native-animated-spinkit";

type Staff = {
  id: number;
  service_id: number | string;
  name: string;
  address: string;
  mobile_image_url?: string;
  type: string;
};

type Params = {
  data: any;
};

export default function BookingPage() {
  const router = useRouter();

  const params = useLocalSearchParams<Params>();
  const rawData = params?.data ?? null;
  const { profile, token, isDarkMode } = useAuth() as {
    profile: any;
    token: string;
    isDarkMode: boolean;
  };

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState("");

  const [serviceLocation, setServiceLocation] = useState<any>(null);

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSelection, setLocationSelection] = useState<
    "customer_location" | "provider_location" | null
  >(null);
  const [customerLocationSelection, setCustomerLocationSelection] = useState<
    "current_location" | "profile_address" | "alternative_address" | null
  >(null);
  const [storedLocation, setStoredLocation] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<Staff[]>([]);

  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://femiiniq-backend.onrender.com/api/get-staffs"
        );
        const json = await response.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setStaffs(json.data as Staff[]);
        } else {
          setStaffs([]);
        }
      } catch {
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, []);

  let serviceId = "";
  let staffData = null;

  if (rawData) {
    try {
      staffData = JSON.parse(rawData);
      serviceId = staffData.service_id ?? "";
    } catch {
      serviceId = "";
    }
  }

  useEffect(() => {
    setLoading(true);
    if (rawData) {
      try {
        const staff = JSON.parse(rawData);
        setSpecialists(Array.isArray(staff) ? staff : [staff]);
      } catch {
        setSpecialists([]);
      }
    } else {
      setSpecialists([]);
    }
    setLoading(false);
  }, [rawData]);

  useEffect(() => {
    async function loadStoredLocation() {
      try {
        if (!token) return;
        const location = await AsyncStorage.getItem(`location_${token}`);
        if (location) setStoredLocation(location);
      } catch { }
    }
    loadStoredLocation();
  }, [token]);

  const providerAddress = staffData?.address ?? "No address available";
  useEffect(() => {
    if (locationSelection === "customer_location") {
      if (customerLocationSelection === "current_location") {
        setServiceLocation(storedLocation || "Fetching location...");
      } else if (customerLocationSelection === "profile_address") {
        setServiceLocation(profile?.address || "No address in profile");
      } else if (customerLocationSelection === "alternative_address") {
        setServiceLocation(profile?.altaddress || "No address in profile");
      }
    } else if (locationSelection === "provider_location") {
      setServiceLocation(providerAddress || "No provider address");
    }
  }, [
    locationSelection,
    customerLocationSelection,
    storedLocation,
    profile,
    setSpecialists,
    providerAddress?.address,
  ]);

  const toggleModal = () => setLocationModalVisible(!isLocationModalVisible);
  const selectLocation = (
    option: "customer_location" | "provider_location"
  ) => {
    setLocationSelection(option);
    if (option === "customer_location") {
      setCustomerLocationSelection("current_location");
    } else {
      setCustomerLocationSelection(null);
    }
  };
  const selectCustomerLocationOption = (
    option: "current_location" | "profile_address" | "alternative_address"
  ) => {
    setCustomerLocationSelection(option);
  };

  const handleContinue = async () => {
    if (!selectedDate) {
      alert("Please select a date for your appointment.");
      return;
    }

    // Validate time selected
    if (!selectedTime) {
      alert("Please select a time for your appointment.");
      return;
    }

    if (!serviceLocation) {
      alert("Please select a service location.");
      return;
    }
    await saveBookingState();
    router.push({
      pathname: "/Booking/BookingDetails",
      params: {
        staff: JSON.stringify(staffData),
      },
    });
  };

  const times = ["09:00 AM", "10:00 AM", "12:00 PM", "01:00 PM", "4:00 PM"];

  const today = new Date().toISOString().split("T")[0];

  const filteredTimes = useMemo(() => {
    if (!selectedDate) return times;

    if (selectedDate !== today) return times;

    const now = new Date();

    return times.filter((timeStr) => {
      // Parse "hh:mm AM/PM"

      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      }
      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      // Create a Date object for selectedDate + time
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      return slotDateTime >= now;
    });
  }, [selectedDate, times, today]);

  const saveBookingState = async () => {
    try {
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        serviceLocation,
        locationSelection,
        customerLocationSelection,
        specialists,
      };
      await AsyncStorage.setItem(
        `pkg_appointment_details_${token}`,
        JSON.stringify(bookingData)
      );
    } catch (e) {
      console.error("Could not save booking state", e);
    }
  };

  useEffect(() => {
    async function hydrateBookingState() {
      try {
        const bookingJson = await AsyncStorage.getItem(
          `pkg_appointment_details_${token}`
        );
        if (bookingJson) {
          const bookingData = JSON.parse(bookingJson);
          setSelectedDate(bookingData.date || "N/A");
          setSelectedTime(bookingData.time || "N/A");
          setServiceLocation(bookingData.serviceLocation || "N/A");
          setLocationSelection(bookingData.locationSelection || null);
          setCustomerLocationSelection(
            bookingData.customerLocationSelection || null
          );

          let hydratedSpecialists = [];
          if (bookingData.specialists) {
            hydratedSpecialists = Array.isArray(bookingData.specialists)
              ? bookingData.specialists
              : [bookingData.specialists];
          }
          setSpecialists(hydratedSpecialists);
        }
      } catch (e) {
        console.error("Could not hydrate booking state", e);
      }
    }
    hydrateBookingState();
  }, [token]);

  BackHandler.addEventListener("hardwareBackPress", () => {
    router.push({
      pathname: "/Details",
      params: { ...staffData, type: "package", backPath: "default" },
    });
    return true; // Prevent default back action
  });

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#121212" : "#fff" },
        ]}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/Details",
              params: { ...staffData, type: "package" },
            })
          }
          style={[
            styles.header,
            { backgroundColor: isDarkMode ? "#1e1e1e" : undefined },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={isDarkMode ? "#eee" : "#000"}
          />
          <Text style={[styles.title, { color: isDarkMode ? "#eee" : "#000" }]}>
            Book Appointment
          </Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: isDarkMode ? "#eee" : "#000" }]}>
          Select Date *
        </Text>
        <View
          style={{
            backgroundColor: isDarkMode ? "#1c1c1e" : "#fff8ed",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Calendar
            current={selectedDate}
            minDate={today}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#FF5ACC",
              },
            }}
            theme={{
              todayTextColor: "#FF5ACC",
              selectedDayBackgroundColor: "#FF5ACC",
              arrowColor: "#FF5ACC",
              monthTextColor: isDarkMode ? "#eee" : "#232323",
              dayTextColor: isDarkMode ? "#aaa" : "#555",
              textSectionTitleColor: isDarkMode ? "#eee" : "#232323",
              calendarBackground: isDarkMode ? "#1c1c1e" : "#fff8ed",
              textDayFontSize: 12,
              textDayFontFamily: "Poppins_400Regular",
              textMonthFontFamily: "Poppins_600SemiBold",
              textDayHeaderFontFamily: "Poppins_500Medium",
            }}
            style={{ borderRadius: 12, marginBottom: 20 }}
            enableSwipeMonths
          />
        </View>

        <Text style={[styles.section, { color: isDarkMode ? "#eee" : "#000" }]}>
          Available Timings *
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {filteredTimes.length === 0 ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                padding: 10,
              }}
            >
              <Text
                className="text-center font-poppins-semibold"
                style={{ color: isDarkMode ? "#eee" : "#555", fontSize: 16 }}
              >
                No available slots
              </Text>
            </View>
          ) : (
            filteredTimes.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    {
                      backgroundColor: isSelected
                        ? "#FF5ACC" // active pink
                        : isDarkMode
                          ? "#2c2c2c" // dark mode default
                          : "#f0f0f0", // light mode default
                    },
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color: isSelected
                          ? "#fff"
                          : isDarkMode
                            ? "#fff"
                            : "#000",
                      },
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <Text style={[styles.section, { color: isDarkMode ? "#eee" : "#000" }]}>
          Service At *
        </Text>
        <TouchableOpacity
          className={`flex-row justify-between items-center rounded-lg px-4 py-2 border ${isDarkMode ? "border-primary" : "border-primary"
            }`}
          style={{
            backgroundColor: isDarkMode
              ? "rgba(255, 90, 204, 0.1)"
              : "rgba(255, 90, 204, 0.1)",
          }}
          onPress={toggleModal}
        >
          <Text
            className="font-poppins-regular flex-1 text-sm font-normal"
            style={{ color: isDarkMode ? "#FF5ACC" : "#FF5ACC" }}
          >
            {serviceLocation || "Choose Location"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#FF5ACC" />
        </TouchableOpacity>

        <Text
          style={[styles.section, { color: isDarkMode ? "#fff" : "#232323" }]}
        >
          Our Specialists
        </Text>

        {loading ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Wave size={40} color="#FF5ACC" />
          </View>
        ) : specialists.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {specialists.map((staff) => (
              <View
                key={staff.id}
                style={[
                  styles.specialistCard,
                  { backgroundColor: isDarkMode ? "#2c2c2c" : "#fff" },
                ]}
              >
                <Image
                  source={{ uri: staff.mobile_image_url }}
                  style={styles.specialistImage}
                />
                <Text
                  style={[
                    styles.specialistName,
                    { color: isDarkMode ? "#fff" : "#000" },
                  ]}
                >
                  {staff.name}
                </Text>
                <Text
                  style={[
                    styles.specialistType,
                    { color: isDarkMode ? "#bbb" : "#666" },
                  ]}
                >
                  {staff.type}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text>No specialists available</Text>
        )}

        <TouchableOpacity
          style={[
            styles.continueBtn,
            {
              backgroundColor: isDarkMode
                ? "#FF5ACC"
                : styles.continueBtn.backgroundColor,
            },
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueText,
              { color: isDarkMode ? "#fff" : styles.continueText.color },
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        isVisible={isLocationModalVisible}
        onBackdropPress={toggleModal}
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        statusBarTranslucent
      >
        <View
          className="p-6 rounded-t-3xl"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "white" }}
        >
          <Text
            className="text-center text-xl font-poppins-regular mb-4"
            style={{ color: isDarkMode ? "#FF5ACC" : "#FF5ACC" }}
          >
            Select Service Location
          </Text>
          <View className="flex-row justify-around mb-4">
            <TouchableOpacity
              className={`flex-1 py-3 mx-1 rounded-xl border ${locationSelection === "customer_location"
                  ? "border-primary"
                  : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                }`}
              style={{
                backgroundColor:
                  locationSelection === "customer_location"
                    ? "rgba(255, 90, 204, 0.1)"
                    : isDarkMode
                      ? "#222"
                      : "#f3f4f6",
              }}
              onPress={() => selectLocation("customer_location")}
            >
              <Text
                className="text-center font-poppins-medium"
                style={{
                  color:
                    locationSelection === "customer_location"
                      ? "#FF5ACC"
                      : isDarkMode
                        ? "#bbb"
                        : "#4b5563",
                }}
              >
                Customer Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 mx-1 rounded-xl border ${locationSelection === "provider_location"
                  ? "border-primary"
                  : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                }`}
              style={{
                backgroundColor:
                  locationSelection === "provider_location"
                    ? "rgba(255, 90, 204, 0.1)"
                    : isDarkMode
                      ? "#222"
                      : "#f3f4f6",
              }}
              onPress={() => selectLocation("provider_location")}
            >
              <Text
                className="text-center font-poppins-medium"
                style={{
                  color:
                    locationSelection === "provider_location"
                      ? "#FF5ACC"
                      : isDarkMode
                        ? "#bbb"
                        : "#4b5563",
                }}
              >
                Provider Location
              </Text>
            </TouchableOpacity>
          </View>

          {locationSelection === "customer_location" && (
            <View className="mt-4">
              <Text
                className="text-base font-poppins-semibold mb-2"
                style={{ color: isDarkMode ? "#eee" : "#1f2937" }}
              >
                Select Customer Location
              </Text>

              <TouchableOpacity
                className={`p-3 rounded-xl border mb-2 ${customerLocationSelection === "current_location"
                    ? "border-primary"
                    : isDarkMode
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                style={{
                  backgroundColor:
                    customerLocationSelection === "current_location"
                      ? "rgba(255, 90, 204, 0.1)"
                      : isDarkMode
                        ? "#222"
                        : "#f3f4f6",
                }}
                onPress={() => selectCustomerLocationOption("current_location")}
              >
                <Text
                  className="font-poppins-medium"
                  style={{
                    color:
                      customerLocationSelection === "current_location"
                        ? "#FF5ACC"
                        : isDarkMode
                          ? "#bbb"
                          : "#4b5563",
                  }}
                >
                  Current Location
                </Text>
                {customerLocationSelection === "current_location" && (
                  <Text
                    className="text-xs font-poppins-regular mt-1"
                    style={{ color: isDarkMode ? "#999" : "#6b7280" }}
                  >
                    {storedLocation || "Fetching location..."}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className={`p-3 rounded-xl border mb-2 ${customerLocationSelection === "profile_address"
                    ? "border-primary"
                    : isDarkMode
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                style={{
                  backgroundColor:
                    customerLocationSelection === "profile_address"
                      ? "rgba(255, 90, 204, 0.1)"
                      : isDarkMode
                        ? "#222"
                        : "#f3f4f6",
                }}
                onPress={() => selectCustomerLocationOption("profile_address")}
              >
                <Text
                  className="font-poppins-medium"
                  style={{
                    color:
                      customerLocationSelection === "profile_address"
                        ? "#FF5ACC"
                        : isDarkMode
                          ? "#bbb"
                          : "#4b5563",
                  }}
                >
                  Profile Address
                </Text>
                {customerLocationSelection === "profile_address" && (
                  <Text
                    className="text-xs font-poppins-regular mt-1"
                    style={{ color: isDarkMode ? "#999" : "#6b7280" }}
                  >
                    {profile?.address || "No address in profile"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className={`p-3 rounded-xl border ${customerLocationSelection === "alternative_address"
                    ? "border-primary"
                    : isDarkMode
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                style={{
                  backgroundColor:
                    customerLocationSelection === "alternative_address"
                      ? "rgba(255, 90, 204, 0.1)"
                      : isDarkMode
                        ? "#222"
                        : "#f3f4f6",
                }}
                onPress={() =>
                  selectCustomerLocationOption("alternative_address")
                }
              >
                <Text
                  className="font-poppins-medium"
                  style={{
                    color:
                      customerLocationSelection === "alternative_address"
                        ? "#FF5ACC"
                        : isDarkMode
                          ? "#bbb"
                          : "#4b5563",
                  }}
                >
                  Alternative Address
                </Text>
                {customerLocationSelection === "alternative_address" && (
                  <Text
                    className="text-xs font-poppins-regular mt-1"
                    style={{ color: isDarkMode ? "#999" : "#6b7280" }}
                  >
                    {profile?.altaddress || "No address in profile"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {locationSelection === "provider_location" && (
            <View className="mt-4">
              <Text
                className="text-base font-poppins-semibold mb-2"
                style={{ color: isDarkMode ? "#eee" : "#1f2937" }}
              >
                Provider Location
              </Text>
              <Text
                className="text-xs font-poppins-regular"
                style={{ color: isDarkMode ? "#999" : "#6b7280" }}
              >
                {providerAddress || "No provider address available"}
              </Text>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            className="mt-5 rounded-xl py-3"
            style={{ backgroundColor: "#FF5ACC" }}
            onPress={toggleModal}
          >
            <Text
              className="text-center font-poppins-semibold text-base"
              style={{ color: "#fff" }}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  section: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginTop: 10,
    marginBottom: 8,
  },
  timeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FF5ACC",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  timeButtonActive: {
    backgroundColor: "#FF5ACC",
  },
  timeText: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Poppins_400Regular",
  },
  timeTextActive: {
    color: "#fff",
  },
  serviceLocationPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF5ACC",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  serviceLocationText: {
    fontSize: 16,
    color: "#FF5ACC",
    fontFamily: "Poppins_400Regular",
  },
  specialistCard: {
    marginRight: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    alignItems: "center",
  },
  specialistCardActive: {
    borderColor: "#FF5ACC",
    backgroundColor: "#FDD7E7",
    borderWidth: 2,
  },
  specialistImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginBottom: 6,
  },
  specialistName: {
    fontSize: 8,
    fontFamily: "Poppins_600SemiBold",
    color: "#232323",
  },
  specialistNameActive: {
    color: "#FF5ACC",
  },
  specialistType: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: "#888",
  },
  continueBtn: {
    backgroundColor: "#FF5ACC",
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },
  continueText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  optionBtnActive: {
    backgroundColor: "#FF5ACC",
    borderColor: "#FF5ACC",
  },
  optionText: {
    fontFamily: "Poppins_500Medium",
    color: "#555",
    fontSize: 14,
  },
  optionTextActive: {
    color: "#fff",
  },
  modalSubTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    color: "#555",
  },
  locationDescription: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#444",
  },
  modalCloseBtn: {
    backgroundColor: "#FF5ACC",
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 30,
  },
  modalCloseText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    textAlign: "center",
  },
});
