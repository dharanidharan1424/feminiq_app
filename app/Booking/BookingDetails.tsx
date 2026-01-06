import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Package {
  quantity: number;
  id: string | number;
  mobile_url?: string;
  name: string;
  staff_id?: string | number;
  price: number;
  original_price?: number;
}

interface Specialist {
  type?: string;
  address?: string;
  name?: string;
}

interface PaymentMethod {
  label: string;
  value: string;
  icon: any;
  details: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    label: "UPI",
    value: "UPI",
    icon: images.upi,
    details: "Pay using your UPI ID securely and instantly.",
  },
  {
    label: "Debit Card",
    value: "Debit Card",
    icon: images.Debit_card,
    details: "Pay using your debit card.",
  },
  {
    label: "Credit Card",
    value: "Credit Card",
    icon: images.Credit_card,
    details: "Pay using your credit card.",
  },
  {
    label: "Net Banking",
    value: "Net Banking",
    icon: images.Net_Banking,
    details: "Pay securely via net banking.",
  },
];

export default function BookingDetails() {
  const params = useLocalSearchParams();
  const { token, isDarkMode } = useAuth();

  const [storedPackages, setStoredPackages] = useState<Package[]>([]);

  const [date, setDate] = useState("N/A");
  const [time, setTime] = useState("N/A");
  const [serviceLocation, setServiceLocation] = useState("N/A");
  const [locationSelection, setLocationSelection] = useState("");
  const [specialists, setSpecialists] = useState<string | Specialist[]>("");

  const [notes, setNotes] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("UPI");
  const [specialist, setSpecialist] = useState<Specialist[]>([]);

  useEffect(() => {
    let parsedSpecialists: Specialist[] = [];
    try {
      if (specialists) {
        if (typeof specialists === "string") {
          const parsed = JSON.parse(specialists);
          if (Array.isArray(parsed)) {
            parsedSpecialists = parsed;
          } else if (parsed) {
            parsedSpecialists = [parsed];
          }
        } else if (Array.isArray(specialists)) {
          parsedSpecialists = specialists;
        } else if (typeof specialists === "object" && specialists !== null) {
          parsedSpecialists = [specialists as Specialist];
        }
      }
    } catch {
      parsedSpecialists = [];
    }
    setSpecialist(parsedSpecialists);
  }, [specialists]);

  let staff = null;
  try {
    staff = params.staff ? JSON.parse(params.staff as string) : null;
  } catch {
    staff = null;
  }

  useEffect(() => {
    async function fetchPackages() {
      try {
        const storageKey = `user_package_${token}`;
        const packageData = await AsyncStorage.getItem(storageKey);
        if (packageData) {
          const parsedData = JSON.parse(packageData);
          let packagesArr: Package[] = [];
          if (Array.isArray(parsedData)) {
            packagesArr = parsedData;
          } else if (parsedData) {
            packagesArr = [parsedData];
          }

          packagesArr = packagesArr.map((pkg) => ({
            ...pkg,
            quantity: 1,
          }));
          setStoredPackages(packagesArr);
        } else {
          setStoredPackages([]);
        }
      } catch (e) {
        console.error("Error loading package", e);
        setStoredPackages([]);
      }
    }

    async function fetchAppointmentDetails() {
      try {
        const storageKey = `pkg_appointment_details_${token}`;
        const bookingJson = await AsyncStorage.getItem(storageKey);
        if (bookingJson) {
          const bookingData = JSON.parse(bookingJson);
          setDate(bookingData.date || "N/A");
          setTime(bookingData.time || "N/A");
          setServiceLocation(bookingData.serviceLocation || "N/A");
          setLocationSelection(bookingData.locationSelection || "");
          setSpecialists(
            Array.isArray(bookingData.specialists)
              ? bookingData.specialists
              : []
          );
        } else {
          setDate("N/A");
          setTime("N/A");
          setServiceLocation("N/A");
          setLocationSelection("");
          setSpecialists([]);
        }
      } catch (e) {
        console.error("Error loading booking items", e);
        setDate("N/A");
        setTime("N/A");
        setServiceLocation("N/A");
        setLocationSelection("");
        setSpecialists([]);
      }
    }
    fetchAppointmentDetails();
    fetchPackages();
  }, [token]);

  const saveBookingData = async () => {
    try {
      const locationLabel =
        locationSelection === "customer_location"
          ? "Customer's Location"
          : locationSelection === "provider_location"
            ? "Provider's Location"
            : "Location Not Selected";
      const totalPrice = storedPackages.reduce((acc, pkg) => {
        const price =
          typeof pkg.price === "number"
            ? pkg.price
            : parseFloat(pkg.price || "0");
        const quantity = 1; // Use 1 if quantity not specified
        return acc + price * quantity;
      }, 0);

      const bookingData = {
        date,
        time,
        serviceLocation,
        serviceLocationLabel: locationLabel,
        specialist,
        totalPrice,
        staff,
        packages: storedPackages,
        notes,
        paymentMethod: selectedPaymentMethod,
        timestamp: new Date().toISOString(),
      };
      const storageKey = `booking_details_${token}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(bookingData));
      console.log("Booking data saved successfully", bookingData);
    } catch (e) {
      console.error("Failed to save booking data", e);
    }
  };

  const handleConfirmBooking = async () => {
    await saveBookingData();
    router.push({
      pathname: "/Booking/ReviewSummary",
      params: {
        staff: JSON.stringify(staff),
        type: "pkgBooking",
      },
    });
  };

  const getSpecialistNames = (specialists: Specialist[]) =>
    specialists.length > 0
      ? specialists
        .map((s) => s.name)
        .filter(Boolean)
        .join(", ")
      : "N/A";

  const handleBackNavigation = () => {
    router.push({
      pathname: "/Booking",
      params: { data: JSON.stringify(staff) },
    });
  };

  BackHandler.addEventListener("hardwareBackPress", () => {
    handleBackNavigation();
    return true;
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        className="flex-1"
        style={{
          padding: 10,
          backgroundColor: isDarkMode ? "#121212" : "#fff",
        }}
      >
        <View
          className="flex-row items-center px-2 mb-3"
          style={{ backgroundColor: isDarkMode ? "#121212" : "#fff" }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={isDarkMode ? "#eee" : "#000"}
            />
            <Text
              className="font-poppins-semibold text-2xl ml-1"
              style={{ color: isDarkMode ? "#eee" : "#000" }}
            >
              Booking Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointment & Specialist */}
        <View
          className="rounded-xl mx-4 p-4 shadow-md"
          style={{
            backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
            shadowColor: isDarkMode ? "#000" : undefined,
          }}
        >
          <Text
            className="font-poppins-semibold text-lg border-b pb-2 mb-3"
            style={{
              color: "#FF5ACC",
              borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8",
            }}
          >
            Appointment & Specialist
          </Text>

          <View className="mt-2">
            {[
              { icon: "calendar-outline", label: "Date:", value: date },
              { icon: "time-outline", label: "Time:", value: time },
              {
                icon: "person-outline",
                label: "Type:",
                value: specialist[0]?.type || "N/A",
              },
              {
                icon: "location-outline",
                label: "Location:",
                value: serviceLocation || "N/A",
              },
            ].map(({ icon, label, value }) => (
              <View
                key={label}
                className="flex-row items-center mb-1"
                style={{ flexWrap: "nowrap" }} // no wrapping, keep in row
              >
                <Ionicons name={icon} size={16} color="#FF5ACC" />

                <Text
                  className="font-poppins-semibold mx-1  mr-4 text-base"
                  style={{
                    color: "#FF5ACC",
                  }}
                  numberOfLines={1} // always single line
                  ellipsizeMode="tail" // truncate if needed
                >
                  {label}
                </Text>

                <Text
                  className="text-sm font-poppins-regular"
                  style={{
                    width: 200,
                    color: isDarkMode ? "#ccc" : "#333",
                  }}
                  numberOfLines={3} // single line, no wrap
                  ellipsizeMode="tail" // truncate overflow
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected Packages */}
        <View
          className="rounded-xl mx-4 p-4 shadow-md mt-6"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
        >
          <Text
            className="font-poppins-semibold text-lg mb-4 border-b"
            style={{
              color: isDarkMode ? "#FF85C3" : "#FF5ACC",
              borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8",
            }}
          >
            Selected Items
          </Text>

          {storedPackages.length === 0 ? (
            <Text
              className="italic text-center py-10"
              style={{ color: isDarkMode ? "#888" : "#ccc" }}
            >
              No packages selected
            </Text>
          ) : (
            storedPackages.map((pkg, index) => (
              <View
                key={pkg.id ?? index}
                className="rounded-xl my-2 p-4 shadow min-h-[90px]"
                style={{ backgroundColor: isDarkMode ? "#222" : "#fff" }}
              >
                {pkg.original_price && pkg.price && (
                  <View
                    className="absolute top-1 right-2 rounded px-2 py-0.5 z-10"
                    style={{
                      backgroundColor: isDarkMode ? "#3f1e2f" : "#fbcfe8",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
                    >
                      {Math.round(
                        ((pkg.original_price - pkg.price) /
                          pkg.original_price) *
                        100
                      )}
                      % OFF
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center relative">
                  <Image
                    source={{ uri: pkg.mobile_url }}
                    className="rounded-lg mr-4 bg-gray-200"
                    style={{ width: 60, height: 60 }}
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center gap-2">
                      <Text
                        numberOfLines={1}
                        className="font-poppins-semibold text-base"
                        style={{ color: isDarkMode ? "#FF85C3" : "#000" }}
                      >
                        {pkg.name}
                      </Text>
                      <View
                        className={` rounded px-2 py-0.5 z-10 ${"bg-primary"}`}
                      >
                        <Text className="text-white text-xs font-poppins-regular">
                          Package
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center my-1">
                      <Text
                        className="font-poppins-semibold text-sm"
                        style={{ color: isDarkMode ? "#FF85C3" : "#000" }}
                      >
                        Specialist:{" "}
                      </Text>
                      <Text
                        className="font-poppins-semibold text-sm "
                        style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
                      >
                        {getSpecialistNames(specialist)}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text
                        className="font-poppins-medium text-sm"
                        style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
                      >
                        ₹ {pkg.price}
                      </Text>
                      {pkg.original_price && (
                        <Text
                          className="line-through ml-2 text-xs font-poppins-medium"
                          style={{ color: isDarkMode ? "#888" : "#ccc" }}
                        >
                          ₹ {pkg.original_price}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="mt-1 text-sm font-poppins-semibold"
                      style={{ color: isDarkMode ? "#eee" : "#000" }}
                    >
                      Qty: {pkg.quantity}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <View
            className="border-b my-4"
            style={{
              borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8",
            }}
          />
          <View className="flex-row justify-between items-center">
            <Text
              className="font-poppins-semibold text-sm"
              style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
            >
              Total
            </Text>
            <Text
              className="font-poppins-semibold text-lg"
              style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
            >
              ₹{" "}
              {storedPackages.reduce(
                (acc, pkg) =>
                  acc +
                  (typeof pkg.price === "number"
                    ? pkg.price
                    : parseFloat(pkg.price || "0")),
                0
              )}
            </Text>
          </View>
        </View>
        <View
          className="rounded-xl mx-4 p-4 shadow-md mt-6"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
        >
          <Text
            className="font-poppins-semibold text-xl mb-4 border-b"
            style={{
              color: isDarkMode ? "#FF85C3" : "#FF5ACC",
              borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8",
            }}
          >
            Payment Methods
          </Text>
          {PAYMENT_METHODS.map((v, i) => (
            <View key={i}>
              <TouchableOpacity
                className={`flex-row items-center border rounded-lg px-5 mb-2 ${selectedPaymentMethod === v.value
                    ? "bg-pink-50 border-primary"
                    : "bg-white border-primary/50"
                  }`}
                onPress={() => setSelectedPaymentMethod(v.value)}
                activeOpacity={0.85}
              >
                <Image
                  source={v.icon}
                  className="w-12 h-12 mr-4"
                  resizeMode="contain"
                />
                <Text
                  className={`text-lg ${selectedPaymentMethod === v.value
                      ? "text-primary font-poppins-semibold"
                      : "text-primary/50 font-poppins-regular"
                    }`}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>

              {selectedPaymentMethod === v.value && (
                <View className="bg-white rounded-md shadow p-3 items-center mb-2">
                  {v.value === v.value && (
                    <>
                      <Text className="text-sm font-poppins-regular text-gray-700">
                        {v.details}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Notes */}
        <View
          className="rounded-xl mx-4 p-4 shadow-md mt-6"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
        >
          <Text
            className="font-poppins-semibold text-lg border-b pb-2 mb-3"
            style={{
              color: "#FF5ACC",
              borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8",
            }}
          >
            Notes
          </Text>

          <TextInput
            placeholder="Type any special notes here..."
            className="rounded-lg border p-3 font-poppins-regular text-base"
            style={{
              backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
              borderColor: isDarkMode ? "#7f1d77" : "#FF5ACC",
              color: isDarkMode ? "#eee" : "#000",
            }}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          className="rounded-full mx-5 py-4 items-center mt-8 mb-20 shadow-lg"
          style={{
            backgroundColor: "#FF5ACC",
            shadowColor: isDarkMode ? "#FF5ACC" : undefined,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          onPress={handleConfirmBooking}
        >
          <Text
            className="font-poppins-semibold tracking-wider"
            style={{ color: "#fff" }}
          >
            Proceed to Payment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
