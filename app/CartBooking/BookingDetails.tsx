import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

interface Service {
  booked?: number; // e.g. 350
  category_id: number; // e.g. 1
  description?: string;
  discount_price?: number | null;
  duration?: string; // e.g. "60"
  id: number | string;
  image?: string;
  mobile_url?: string;
  name: string;
  original_price?: string | number;
  price: string | number;
  procedure?: string;
  quantity?: number;
  staff_id?: number | string;
}

interface Package {
  booked?: number; // e.g. 200
  category_id: number; // e.g. 1
  description?: string;
  duration?: string; // e.g. "60"
  id: number | string;
  image?: string;
  mobile_url?: string;
  name: string;
  original_price?: string | number;
  price: string | number;
  process?: string;
  quantity?: number;
  staff_id?: number | string;
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

interface Specialist {
  id?: number | string;
  type?: string;
  address?: string;
  name?: string;
}

export default function BookingDetails() {
  const params = useLocalSearchParams();
  const { token, isDarkMode } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [date, setDate] = useState("N/A");
  const [time, setTime] = useState("N/A");
  const [serviceLocation, setServiceLocation] = useState("N/A");
  const [locationSelection, setLocationSelection] = useState("");
  const [specialists, setSpecialists] = useState<string | Specialist[]>("");

  const [notes, setNotes] = useState<string>("");
  const [specialist, setSpecialist] = useState<Specialist[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("UPI");

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

  console.log(staff);

  useEffect(() => {
    async function fetchBookingItems() {
      try {
        const storageKey = `selectedBookingItems_${token}`;
        const bookingJson = await AsyncStorage.getItem(storageKey);
        if (bookingJson) {
          const bookingData = JSON.parse(bookingJson);
          setServices(
            Array.isArray(bookingData.services) ? bookingData.services : []
          );
          setPackages(
            Array.isArray(bookingData.packages) ? bookingData.packages : []
          );
        } else {
          setServices([]);
          setPackages([]);
        }
      } catch (e) {
        console.error("Error loading booking items", e);
        setServices([]);
        setPackages([]);
      }
    }
    async function fetchAppointmentDetails() {
      try {
        const storageKey = `cart_appointment_details_${token}`;
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
    fetchBookingItems();
  }, [token]);

  const combinedItems = useMemo(() => {
    const svc = services.map((item) => ({ ...item, itemType: "Service" }));
    const pkg = packages.map((item) => ({ ...item, itemType: "Package" }));
    return [...svc, ...pkg];
  }, [services, packages]);

  const saveBookingData = async () => {
    try {
      const locationLabel =
        locationSelection === "customer_location"
          ? "Customer's Location"
          : locationSelection === "provider_location"
            ? "Provider's Location"
            : "Location Not Selected";

      const totalPrice =
        (services?.reduce(
          (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
          0
        ) || 0) +
        (packages?.reduce(
          (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
          0
        ) || 0);

      const bookingData = {
        date,
        time,
        serviceLocation,
        serviceLocationLabel: locationLabel,
        specialist,
        staff: { ...staff },
        totalPrice,
        packages,
        services,
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
        type: "cartBooking",
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
      pathname: "/CartBooking",
      params: { staff: JSON.stringify(staff) },
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
          paddingVertical: 20,
          backgroundColor: isDarkMode ? "#121212" : "#fff",
        }}
      >
        <TouchableOpacity
          className="flex-row items-center px-5 mb-3 border-b border-gray-200 pb-2"
          style={{ backgroundColor: isDarkMode ? "#121212" : "#fff" }}
          onPress={handleBackNavigation}
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

        <View
          className="rounded-xl mx-4 p-4 shadow-md"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
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
                value: specialist.length > 0 ? specialist[0].type : "N/A",
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
            className="font-poppins-semibold text-xl mb-4 border-b"
            style={{
              color: isDarkMode ? "#FF85C3" : "#FF5ACC",
              borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8",
            }}
          >
            Booked Items
          </Text>

          {combinedItems.length === 0 ? (
            <Text
              className="italic text-center py-10"
              style={{ color: isDarkMode ? "#888" : "#ccc" }}
            >
              No items selected
            </Text>
          ) : (
            combinedItems.map((item, index) => (
              <View
                key={`${item.itemType}-${item.id}-${index}`}
                className="rounded-xl my-2 p-4 shadow min-h-[90px]"
                style={{ backgroundColor: isDarkMode ? "#222" : "#fff" }}
              >
                {item.original_price && item.price && (
                  <View
                    className="absolute top-1 right-2 bg-pink-100 rounded px-2 py-0.5 z-10"
                    style={{
                      backgroundColor: isDarkMode ? "#3f1e2f" : undefined,
                    }}
                  >
                    <Text
                      className="text-primary text-xs font-poppins-semibold"
                      style={{ color: isDarkMode ? "#FF85C3" : undefined }}
                    >
                      {Math.round(
                        ((parseFloat(item.original_price as string) -
                          parseFloat(item.price as string)) /
                          parseFloat(item.original_price as string)) *
                        100
                      )}
                      % OFF
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center relative">
                  {item.mobile_url && (
                    <Image
                      source={{ uri: item.mobile_url }}
                      className="rounded-lg mr-4 bg-gray-200"
                      style={{ width: 60, height: 60 }}
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center gap-2">
                      <Text
                        numberOfLines={1}
                        className="font-poppins-semibold text-base"
                        style={{ color: isDarkMode ? "#FF85C3" : "#000" }}
                      >
                        {item.name}
                      </Text>
                      <View
                        className={` rounded px-2 py-0.5 z-10 ${"bg-primary"}`}
                      >
                        <Text className="text-white text-xs font-poppins-regular">
                          {item.itemType}
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
                        ₹ {item.price}
                      </Text>
                      {item.original_price && (
                        <Text
                          className="line-through ml-2 text-xs font-poppins-medium"
                          style={{ color: isDarkMode ? "#888" : "#ccc" }}
                        >
                          ₹ {item.original_price}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="mt-1 text-sm font-poppins-semibold"
                      style={{ color: isDarkMode ? "#eee" : "#000" }}
                    >
                      Qty: {item.quantity ?? 1}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/Details",
                params: {
                  ...staff,
                  type: "service",
                  backPath: "cartBooking",
                },
              })
            }
          >
            <View className="mt-4 flex-row gap-2 items-center justify-center">
              <Ionicons name="add-circle" color={"#FF5ACC"} size={20} />
              <Text className="font-poppins-semibold text-primary">
                Add More
              </Text>
            </View>
          </TouchableOpacity>

          <View
            className="border-t mt-4 pt-4 flex-row justify-between"
            style={{ borderColor: isDarkMode ? "#7f1d77" : "#fbcfe8" }}
          >
            <Text
              className="text-lg font-poppins-semibold"
              style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
            >
              Total
            </Text>
            <Text
              className="text-lg font-poppins-semibold"
              style={{ color: isDarkMode ? "#FF85C3" : "#FF5ACC" }}
            >
              ₹{" "}
              {combinedItems.reduce(
                (acc, item) => acc + Number(item.price) * (item.quantity ?? 1),
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

        <View
          className="rounded-xl mx-4 p-4 shadow-md mt-6"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
        >
          <Text
            className="font-poppins-semibold text-xl border-b pb-2 mb-3"
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
              backgroundColor: isDarkMode ? "#2a2a2a" : "#ffffff",
              borderColor: isDarkMode ? "#7f1d77" : "#FF5ACC",
              color: isDarkMode ? "#eee" : "#000",
            }}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

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
            className="text-white font-poppins-semibold tracking-wider"
            style={{ color: "#fff" }}
          >
            Proceed to summary
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
