/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import RazorpayCheckout from "react-native-razorpay";
import BubbleScatter from "@/components/Animation/BubbleScatter";
import { API_CONFIG, buildApiUrl } from "@/constants/api";
import { useAuth } from "@/context/UserContext";
import { Flow } from "react-native-animated-spinkit";
import Confetti from "react-native-confetti";
import RazorpayCheckout from "react-native-razorpay";

interface BookingData {
  paymentMethod: string;
  notes: React.JSX.Element;
  staff?: { id?: number; name?: string };
  serviceLocationLabel?: string;
  serviceLocation?: string;
  date?: string;
  time?: string;
  specialist?: {
    [x: string]: any;
    length: number;
    name?: string;
  };
  services?: {
    original_price: any;
    category_id: any;
    name: string;
    price: number;
    quantity: number;
  }[];
  packages?: {
    original_price: any;
    category_id: any;
    name: string;
    price: number;
    quantity: number;
  }[];
  coupon?: { amount: number; percent: number };
  platformFee?: { amount: number; percent: number };
  totalPrice: number;
  couponCode?: string;
}

interface SummaryRowProps {
  label: string;
  value: string | number;
  valueClassName?: string;
  discount?: boolean;
  plaformFee?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps & { isDarkMode?: boolean }> = ({
  label,
  value,
  valueClassName,
  isDarkMode,
  discount,
  plaformFee,
}) => (
  <View
    className="flex-row justify-between py-2"
    style={{ alignItems: "flex-start" }}
  >
    <Text
      className="font-poppins-regular text-[12px]"
      style={{
        color: discount
          ? "#10B981"
          : plaformFee
            ? "#3B82F6"
            : label === "Amount Payable"
              ? "#FF5ACC"
              : isDarkMode
                ? "#eee"
                : undefined,
        flexShrink: 0,
        marginRight: 8,
        minWidth: 90,
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {label}
    </Text>
    <Text
      className={`font-poppins-semibold text-right text-sm `}
      style={{
        color: discount
          ? "#10B981"
          : plaformFee
            ? "#3B82F6"
            : label === "Amount Payable"
              ? "#FF5ACC"
              : isDarkMode
                ? "#eee"
                : undefined,
        flex: 1,
      }}
    >
      {value}
    </Text>
  </View>
);

const STORAGE_PREFIX = "booking_details_";

const requiredProfileFields = ["fullname", "email", "mobile"];

export default function ReviewSummary() {
  const { token, profile, isDarkMode } = useAuth();
  const { staff, type } = useLocalSearchParams();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertVisible, setAlertVisible] = useState<boolean>(false);
  const [bookingCode, setBookingCode] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [couponCode, setCouponCode] = useState<string>(
    bookingData?.couponCode || ""
  );
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProfileAlertVisible, setProfileAlertVisible] =
    useState<boolean>(false);
  const confettiRef = useRef<any>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  useEffect(() => {
    if (bookingData && bookingData.notes) {
      setNotes(String(bookingData.notes));
    }
  }, [bookingData]);

  useEffect(() => {
    async function loadBookingData() {
      if (!token) return;
      try {
        const bookingDataJson = await AsyncStorage.getItem(
          `${STORAGE_PREFIX}${token}`
        );
        if (bookingDataJson) {
          const parsedData = JSON.parse(bookingDataJson);

          // If staff object is empty but services have staff_id, fetch staff data
          if ((!parsedData.staff || Object.keys(parsedData.staff).length === 0) &&
            parsedData.services && parsedData.services.length > 0 &&
            parsedData.services[0].staff_id) {

            const staffId = parsedData.services[0].staff_id;
            console.log("📋 Staff object is empty, fetching staff data for ID:", staffId);

            try {
              const response = await fetch(
                `https://femiiniq-backend.onrender.com/api/get-staffs/${staffId}`
              );
              const json = await response.json();

              if (json.status === "success" && json.data) {
                console.log("✅ Fetched staff data:", json.data);
                parsedData.staff = json.data;
              } else {
                console.error("❌ Failed to fetch staff data:", json);
              }
            } catch (error) {
              console.error("❌ Error fetching staff data:", error);
            }
          }

          setBookingData(parsedData);
        }
      } catch (error) {
        setBookingData(null);
        console.log(error);
      }
    }
    loadBookingData();
  }, [token]);

  const isProfileComplete = (): boolean => {
    if (!profile) return false;
    for (const field of requiredProfileFields) {
      if (!(profile as any)[field] || (profile as any)[field].trim() === "") return false;
    }
    return true;
  };

  const removeBookedItemsFromCart = async (
    token: string,
    staffId: number,
    bookedServices: any[],
    bookedPackages: any[]
  ) => {
    // Remove booked services
    try {
      const storedServices = await AsyncStorage.getItem(
        `selectedServices_${token}`
      );
      if (storedServices) {
        const services = JSON.parse(storedServices);
        const updatedServices = services.filter(
          (item: any) =>
            !(
              item.staff_id === staffId &&
              bookedServices.some(
                (b) =>
                  b.category_id === item.category_id ||
                  b.service_id === item.id ||
                  b.id === item.id
              )
            )
        );
        await AsyncStorage.setItem(
          `selectedServices_${token}`,
          JSON.stringify(updatedServices)
        );
      }
    } catch (e) {
      console.log("Error removing booked services from cart:", e);
    }

    // Remove booked packages
    try {
      const storedPackages = await AsyncStorage.getItem(
        `cart_packages_${token}`
      );
      if (storedPackages) {
        const packages = JSON.parse(storedPackages);
        const updatedPackages = packages.filter(
          (item: any) =>
            !(
              item.staff_id === staffId &&
              bookedPackages.some(
                (b) =>
                  b.category_id === item.category_id ||
                  b.service_id === item.id ||
                  b.id === item.id
              )
            )
        );
        await AsyncStorage.setItem(
          `cart_packages_${token}`,
          JSON.stringify(updatedPackages)
        );
      }
    } catch (e) {
      console.log("Error removing booked packages from cart:", e);
    }
  };

  const platformFeePercent = 5;
  const couponAmount = appliedDiscount || 0;
  const fixedDiscount = 50; // Flat ₹50 reduction

  const platformFee = bookingData
    ? Math.round(
      (bookingData.totalPrice - couponAmount - fixedDiscount) *
      (platformFeePercent / 100)
    )
    : 0;

  const finalAmount = bookingData
    ? bookingData.totalPrice - couponAmount - fixedDiscount + platformFee
    : 0;

  // Coupon discount commented per user request
  // const couponDiscountAmount = bookingData?.coupon?.amount || 0;

  // const handleConfirmPayment = async (): Promise<void> => {
  //   if (!isProfileComplete()) {
  //     setProfileAlertVisible(true);
  //     return;
  //   }
  //   if (!bookingData) {
  //     alert("Booking data not available.");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     const orderResponse = await fetch(
  //       "https://feminiq-backend.onrender.com/payments/create-order",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           amount: bookingData.totalPrice * 100,
  //           currency: "INR",
  //         }),
  //       }
  //     );

  //     if (!orderResponse.ok) throw new Error("Order creation failed");
  //     const orderData = await orderResponse.json();

  //     const options: any = {
  //       key: "rzp_test_RDvOg9RtgwnB5k",
  //       amount: orderData.amount,
  //       currency: orderData.currency,
  //       name: "FeminiQ",
  //       description: "Booking Payment",
  //       order_id: orderData.id,
  //       prefill: {
  //         email: profile?.email,
  //         contact: profile?.mobile,
  //         name: profile?.fullname,
  //       },
  //       theme: { color: "#FF5ACC" },
  //     };

  //     RazorpayCheckout.open(options)
  //       .then(async (paymentData: any) => {
  //         const bookingRequest = {
  //           staff_id: String(bookingData.staff?.id),
  //           staff_name: bookingData.staff?.name,
  //           service_at: bookingData.serviceLocationLabel,
  //           address: bookingData.serviceLocation,
  //           user_id: profile?.id,
  //           user_name: profile?.fullname,
  //           user_mobile: profile?.mobile,
  //           date: bookingData.date,
  //           time: convertTimeTo24Hour(String(bookingData.time)),
  //           specialist: {
  //             name: bookingData.specialist?.name,
  //           },
  //           booked_services:
  //             bookingData.services?.map((pkg) => ({
  //               name: pkg.name,
  //               price: pkg.price,
  //               quantity: pkg.quantity,
  //               service_id: pkg.category_id,
  //             })) ?? [],
  //           booked_packages:
  //             bookingData.packages?.map((pkg) => ({
  //               name: pkg.name,
  //               price: pkg.price,
  //               quantity: pkg.quantity,
  //               service_id: pkg.category_id,
  //             })) ?? [],
  //           payment_id: null, // No payment id yet
  //           total_price: finalAmount,
  //           notes: bookingData.notes || "",
  //         };

  //         const response = await fetch(
  //           "https://feminiq-backend.onrender.com/booking",
  //           {
  //             method: "POST",
  //             credentials: "include",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify(bookingRequest),
  //           }
  //         );

  //         if (!response.ok)
  //           throw new Error(`Server returned status ${response.status}`);

  //         const responseData = await response.json();
  //         setBookingCode(responseData.booking_code);

  //         await removeBookedItemsFromCart(
  //           token!,
  //           bookingData.staff?.id!,
  //           bookingData.services || [],
  //           bookingData.packages || []
  //         );

  //         setIsLoading(false);
  //         setAlertVisible(true);
  //       })
  //       .catch((error: any) => {
  //         setIsLoading(false);
  //         alert(error.description || "Payment failed");
  //         console.log(error);
  //       });
  //   } catch (error: any) {
  //     setIsLoading(false);
  //     alert(error.message || "Error processing booking");
  //   }
  // };

  const handleConfirmPayment = async (): Promise<void> => {
    if (!isProfileComplete()) {
      setProfileAlertVisible(true);
      return;
    }
    if (!bookingData) {
      alert("Booking data not available.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Razorpay order via backend API
      const orderResponse = await fetch(
        "https://femiiniq-backend.onrender.com/payments/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalAmount * 100, // Convert to paise (₹473 = 47300 paise)
            currency: "INR",
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Step 2: Open Razorpay checkout
      const razorpayOptions = {
        description: "Feminiq Booking Payment",
        currency: "INR",
        key: "rzp_test_RDvOg9RtgwnB5k",
        amount: finalAmount * 100,
        order_id: orderData.id,
        name: "Feminiq",
        prefill: {
          email: profile?.email || "",
          contact: profile?.mobile || "",
          name: profile?.fullname || "",
        },
        theme: { color: "#FF5ACC" },
      };

      RazorpayCheckout.open(razorpayOptions)
        .then(async (data: any) => {
          try {
            // Step 3: Verify payment via backend API
            const verifyResponse = await fetch(
              "https://femiiniq-backend.onrender.com/payments/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: data.razorpay_order_id,
                  razorpay_payment_id: data.razorpay_payment_id,
                  razorpay_signature: data.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
              throw new Error("Payment verification failed");
            }

            // Step 4: Create booking with payment ID
            console.log("🔍 Debug - bookingData:", {
              staff_id: bookingData.staff?.id,
              staff_name: bookingData.staff?.name,
              serviceLocation: bookingData.serviceLocation,
              serviceLocationLabel: bookingData.serviceLocationLabel,
              date: bookingData.date,
              time: bookingData.time,
            });

            const bookingRequest = {
              order_id: orderData.id,
              payment_id: data.razorpay_payment_id,
              user_id: profile?.id,
              agent_id: String(bookingData.staff?.id),
              agent_name: bookingData.staff?.name,
              booking_date: bookingData.date,
              booking_time: convertTimeTo24Hour(String(bookingData.time)),
              staffname: bookingData.staff?.name,
              address: bookingData.serviceLocation,
              location: bookingData.serviceLocationLabel,
              services: JSON.stringify([
                ...(bookingData.services?.map((s) => ({
                  name: s.name,
                  price: s.price,
                  quantity: s.quantity,
                  service_id: s.category_id,
                })) ?? []),
                ...(bookingData.packages?.map((p) => ({
                  name: p.name,
                  price: p.price,
                  quantity: p.quantity,
                  service_id: p.category_id,
                })) ?? []),
              ]),
              category_id: bookingData.services?.[0]?.category_id || null,
              service_id: bookingData.services?.[0]?.category_id || null,
              image: null,
              status: "upcoming",
              paid_at: new Date().toISOString(),
              note: notes || "",
              cancel_reason: null,
              reschedule_date: null,
              reschedule_reason: null,
              reschedule_status: null,
              discountprice: couponValid ? appliedDiscount : 0,
              coupon_discount: couponValid ? appliedDiscount : 0,
              platformfee: platformFee,
              totalprice: finalAmount,
              finalprice: finalAmount,
              payment_method: bookingData?.paymentMethod ?? "razorpay",
              payment_type: "online",
              amount: finalAmount,
              personal_note: notes || "",
              booking_status: "confirmed",
              couponcode: couponValid ? couponCode : null,
              artist_platform_fee: 0,
              start_otp: null,
              complete_otp: null,
              is_started: 0,
              is_completed: 0,
              remaining_amount: 0,
              payment_status: "paid",
              paid_amount: finalAmount,
            };


            console.log("📤 Sending booking request:", bookingRequest);

            const response = await fetch(
              "https://femiiniq-backend.onrender.com/booking",
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingRequest),
              }
            );

            console.log("📥 Booking API response status:", response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Booking API error response:", errorText);
              throw new Error(
                `Booking creation failed with status ${response.status}: ${errorText}`
              );
            }

            const responseData = await response.json();
            console.log("✅ Booking created successfully:", responseData);

            await removeBookedItemsFromCart(
              token!,
              bookingData.staff?.id!,
              bookingData.services || [],
              bookingData.packages || []
            );

            await AsyncStorage.removeItem(`booking_details_${token}`);
            await AsyncStorage.removeItem(`pkg_appointment_details_${token}`);
            await AsyncStorage.removeItem(`cart_appointment_details_${token}`);

            setIsLoading(false);
            setAlertVisible(true);
          } catch (bookingError: any) {
            setIsLoading(false);
            console.error("❌ Booking creation error:", bookingError);
            alert(
              bookingError.message ||
              "Payment successful but booking creation failed. Please contact support."
            );
          }
        })
        .catch((error: any) => {
          setIsLoading(false);
          console.error("❌ Payment error:", error);
          alert(error.description || "Payment failed");
        });
    } catch (error: any) {
      setIsLoading(false);
      alert(error.message || "Failed to process payment");
      console.log("Error:", error);
    }
  };

  if (!bookingData)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No booking data available.</Text>
      </View>
    );
  const closeProfileAlert = (): void => {
    setProfileAlertVisible(false);
  };

  const hideSuccessAlert = (): void => {
    setAlertVisible(false);
  };

  if (!bookingData)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No booking data available.</Text>
      </View>
    );

  function convertTimeTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(" "); // e.g. ["12:00", "PM"]
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");

    return `${hoursStr}:${minutesStr}:00`; // MySQL TIME format
  }

  const handleBackNavigation = () => {
    if (type === "cartBooking") {
      router.push({
        pathname: "/CartBooking/BookingDetails",
        params: { staff },
      });
    } else if (type === "pkgBooking") {
      router.push({
        pathname: "/Booking/BookingDetails",
        params: { staff },
      });
    }
  };

  BackHandler.addEventListener("hardwareBackPress", () => {
    handleBackNavigation();
    return true;
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#fff" }}
    >
      <ScrollView
        className="px-4 pt-6"
        style={{ backgroundColor: isDarkMode ? "#121212" : "#fff" }}
      >
        {/* Header with back arrow */}
        <TouchableOpacity
          onPress={handleBackNavigation}
          className="flex-row items-center mb-6 gap-2 border-b border-gray-200 pb-3"
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={isDarkMode ? "#eee" : "#000"}
          />
          <Text
            className="text-xl font-poppins-semibold"
            style={{ color: isDarkMode ? "#eee" : "#000" }}
          >
            Review Summary
          </Text>
        </TouchableOpacity>

        <View>
          <View
            className="mb-4 rounded-xl p-5 shadow-md"
            style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                className="text-xl font-poppins-semibold"
                style={{
                  color: isDarkMode ? "#eee" : "#232323",
                  textAlign: "center",
                }}
              >
                Booking Details
              </Text>
              <View
                style={{
                  marginTop: 5,
                  width: 56,
                  height: 3,
                  backgroundColor: "#FF5ACC",
                  borderRadius: 3,
                }}
              />
            </View>

            <SummaryRow
              label="Service Provider"
              value={bookingData.staff?.name || "N/A"}
              isDarkMode={isDarkMode}
            />
            <SummaryRow
              label="Service At"
              value={bookingData.serviceLocationLabel || "N/A"}
              isDarkMode={isDarkMode}
            />
            <SummaryRow
              label="Address"
              isDarkMode={isDarkMode}
              value={bookingData.serviceLocation || "N/A"}
            />
            <SummaryRow
              label="Name"
              value={profile?.fullname || "N/A"}
              isDarkMode={isDarkMode}
            />
            <SummaryRow
              label="Phone"
              value={`+91 ${profile?.mobile}` || "N/A"}
              isDarkMode={isDarkMode}
            />
            <SummaryRow
              label="Booking Date *"
              value={bookingData.date || "N/A"}
              isDarkMode={isDarkMode}
            />
            <SummaryRow
              label="Booking Time *"
              value={bookingData.time || "N/A"}
              isDarkMode={isDarkMode}
            />
            <SummaryRow
              label="Specialists"
              value={
                bookingData.specialist && bookingData.specialist.length > 0
                  ? bookingData.specialist
                    .map((s: any) => s.name)
                    .filter(Boolean)
                    .join(", ")
                  : "N/A"
              }
              isDarkMode={isDarkMode}
            />
          </View>

          <View
            className="my-4 rounded-xl p-4 shadow-md"
            style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
          >
            {/* Title */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                className="text-xl font-poppins-semibold"
                style={{
                  color: isDarkMode ? "#eee" : "#232323",
                  textAlign: "center",
                }}
              >
                Coupons & Vouchers
              </Text>
              <View
                style={{
                  marginTop: 5,
                  width: 56,
                  height: 3,
                  backgroundColor: "#FF5ACC",
                  borderRadius: 3,
                }}
              />
            </View>

            {/* Coupon Input Field */}
            <View
              style={{
                position: "relative",
                justifyContent: "center",
              }}
            >
              <TextInput
                value={couponCode}
                onChangeText={(text) => {
                  setCouponCode(text);
                  setCouponValid(null);
                  setCouponError("");
                }}
                autoCapitalize="characters"
                placeholder="Enter coupon code"
                placeholderTextColor="#999"
                className="border rounded px-4 pr-20 py-3 mb-1 text-sm"
                style={{
                  color: isDarkMode ? "#fff" : "#222",
                  fontFamily: "Poppins_400Regular",
                  borderColor: couponValid === false ? "red" : "#ccc",
                }}
              />

              {/* Right-Side Button / Loader / Tick */}
              <View style={{ position: "absolute", right: 10, bottom: 10 }}>
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : couponValid === true ? (
                  <Ionicons
                    name="checkmark-circle"
                    color={"#10B981"}
                    size={20}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={async () => {
                      setCouponError("");
                      setCouponValid(null);

                      if (!couponCode || couponCode.trim().length === 0) {
                        setCouponError("Please enter a coupon code.");
                        setCouponValid(false);
                        return;
                      }
                      setIsVerifying(true);

                      try {
                        const response = await fetch(
                          buildApiUrl(API_CONFIG.ENDPOINTS.VERIFY_COUPON),
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: profile?.id,
                              couponCode,
                            }),
                          }
                        );

                        const result = await response.json();

                        if (result.status === "valid") {
                          setCouponValid(true);
                          setAppliedDiscount(result.coupon.discount_amount);
                          confettiRef.current &&
                            confettiRef.current.startConfetti();
                          setTimeout(
                            () =>
                              confettiRef.current &&
                              confettiRef.current.stopConfetti(),
                            3000
                          );
                        } else {
                          setCouponValid(false);
                          setCouponError(result.message);
                          setAppliedDiscount(0);
                        }
                      } catch (e) {
                        setCouponValid(false);
                        setCouponError("Error verifying coupon.");
                      }

                      setIsVerifying(false);
                    }}
                    style={{
                      backgroundColor: "#10B981",
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 5,
                    }}
                  >
                    <Text className="text-white font-poppins-medium text-sm">
                      Verify
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {couponValid === false && (
              <View className="flex-row items-center justify-center mt-1">
                <Ionicons
                  name="close-circle"
                  size={16}
                  color="#ef4444"
                  style={{ marginRight: 5 }}
                />
                <Text className="text-red-600 font-poppins-medium">
                  {couponError}
                </Text>
              </View>
            )}

            {couponValid === true && (
              <View className="flex-row items-center justify-center mt-1">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#10B981"
                  style={{ marginRight: 5 }}
                />
                <Text className="text-green-600 font-poppins-medium">
                  Coupon applied successfully!
                </Text>
              </View>
            )}
          </View>
          <Confetti ref={confettiRef} confettiCount={100} duration={3000} />
          <View
            className="mb-4 rounded-xl p-5 shadow-md"
            style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                className="text-xl font-poppins-semibold"
                style={{
                  color: isDarkMode ? "#eee" : "#232323",
                  textAlign: "center",
                }}
              >
                Services & Packages
              </Text>
              <View
                style={{
                  marginTop: 5,
                  width: 56,
                  height: 3,
                  backgroundColor: "#FF5ACC",
                  borderRadius: 3,
                }}
              />
            </View>
            {[
              ...(bookingData.services || []),
              ...(bookingData.packages || []),
            ].map((item, idx) => (
              <View key={idx} className="flex-row justify-between py-1">
                <Text
                  className="font-poppins-regular text-[13px]"
                  style={{ color: isDarkMode ? "#eee" : "#000" }}
                >
                  {item.name} {` X  ${item.quantity} `}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item.original_price && (
                    <Text
                      className="font-poppins-medium text-xs"
                      style={{
                        color: isDarkMode ? "#888" : "#888", // grayish for original price
                        textDecorationLine: "line-through",
                        marginRight: 8,
                      }}
                    >
                      ₹ {item.original_price}
                    </Text>
                  )}
                  <Text
                    className="font-poppins-semibold text-sm"
                    style={{ color: isDarkMode ? "#eee" : "#232323" }} // regular price color
                  >
                    ₹ {item.price}
                  </Text>
                </View>
              </View>
            ))}

            <View className="mt-4 border-t pt-3 border-gray-200">
              {couponAmount > 0 && (
                <SummaryRow
                  label={`Coupon Discount`}
                  value={`- ₹ ${couponAmount}.00`}
                  valueClassName="text-green-600"
                  isDarkMode={isDarkMode}
                  discount={true}
                />
              )}

              <SummaryRow
                label={`Platform Discount`}
                value={`- ₹ ${fixedDiscount}.00`}
                valueClassName="text-red-600"
                isDarkMode={isDarkMode}
                discount={true}
              />

              <SummaryRow
                label="Platform Fee (5%)"
                value={`₹ ${platformFee}.00`}
                isDarkMode={isDarkMode}
                plaformFee
              />

              <View
                className="mt-3 border-t flex-row justify-between pt-3"
                style={{ borderColor: isDarkMode ? "#333" : "#d1d5db" }}
              >
                <Text
                  className="font-poppins-regular text-base"
                  style={{ color: isDarkMode ? "#eee" : undefined }}
                >
                  Amount Payable
                </Text>
                <Text
                  className="font-poppins-semibold text-lg"
                  style={{ color: "#FF5ACC" }}
                >
                  ₹ {finalAmount}.00
                </Text>
              </View>
            </View>
          </View>

          <View>
            {bookingData.notes && (
              <View
                className="mt-4 rounded-xl p-4 shadow-md"
                style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
              >
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Text
                    className="text-xl font-poppins-semibold"
                    style={{
                      color: isDarkMode ? "#eee" : "#232323",
                      textAlign: "center",
                    }}
                  >
                    Additional Notes
                  </Text>
                  <View
                    style={{
                      marginTop: 5,
                      width: 56,
                      height: 3,
                      backgroundColor: "#FF5ACC",
                      borderRadius: 3,
                    }}
                  />
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDarkMode ? "#fafafd" : "#fff",
                    paddingHorizontal: 10,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#232323",
                      paddingVertical: 12,
                      fontFamily: "Poppins_400Regular",
                    }}
                    value={notes}
                    onChangeText={setNotes}
                    editable={editing}
                    placeholder="Add a note..."
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      editing ? setEditing(false) : setEditing(true)
                    }
                  >
                    <Ionicons
                      name={editing ? "checkmark-done" : "create-outline"}
                      size={22}
                      color={editing ? "#10B981" : "#3B82F6"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View
            className="my-4 rounded-xl p-5 shadow-md"
            style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text
                className="text-xl font-poppins-semibold"
                style={{
                  color: isDarkMode ? "#eee" : "#232323",
                  textAlign: "center",
                }}
              >
                Payment Method
              </Text>
              <View
                style={{
                  marginTop: 5,
                  width: 56,
                  height: 3,
                  backgroundColor: "#FF5ACC",
                  borderRadius: 3,
                }}
              />
            </View>
            <SummaryRow
              label="Payment method"
              value={bookingData.paymentMethod || "N/A"}
              isDarkMode={isDarkMode}
            />
            <TouchableOpacity
              onPress={() => router.back()}
              className="border rounded-lg bg-primary/20 items-center border-gray-200"
            >
              <Text className="font-poppins-regular my-2 text-xs text-primary">
                Change Method?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirmPayment}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#555" : "#FF5ACC",
            paddingVertical: 15,
            borderRadius: 30,
            alignItems: "center",
            marginTop: 20,
            marginBottom: 40,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <Flow color="#fff" size={50} />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              Confirm Payment
            </Text>
          )}
        </TouchableOpacity>

        {/* Booking Completed Success Alert Modal */}
        <Modal
          visible={isAlertVisible}
          animationType="fade"
          statusBarTranslucent
          transparent
          onRequestClose={hideSuccessAlert}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 20,
              position: "relative",
            }}
          >
            <View
              style={{
                backgroundColor: isDarkMode ? "#161616" : "#fff",
                borderRadius: 30,
                alignItems: "center",
                padding: 32,
                width: 320,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FF5ACC",
                  borderRadius: 999,
                  padding: 20,
                  marginBottom: 24,
                  width: 100,
                  height: 100,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="checkbox" size={60} color="#fff" />
                <BubbleScatter
                  bubbleCount={10}
                  radius={70}
                  size={12}
                  color="#FF5ACC"
                />
              </View>

              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "Poppins_600SemiBold",
                  textAlign: "center",
                  color: "#FF5ACC",
                  marginBottom: 12,
                }}
              >
                Payment Successful!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: isDarkMode ? "#eee" : "#111",
                  textAlign: "center",
                  marginBottom: 36,
                  fontFamily: "Poppins_500Medium",
                }}
              >
                Your booking has been{"\n"}successfully done
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setAlertVisible(false);
                  router.push({
                    pathname: "/Booking/Reciept",
                    params: { bookingCode },
                  });
                }}
                style={{
                  backgroundColor: "#FF5ACC",
                  borderRadius: 30,
                  width: "100%",
                  paddingVertical: 14,
                  marginBottom: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16,
                  }}
                >
                  View E-Receipt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  hideSuccessAlert();
                  router.push("/Tabs");
                }}
                style={{
                  backgroundColor: "#fde3f7",
                  borderRadius: 30,
                  width: "100%",
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FF5ACC",
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16,
                  }}
                >
                  Home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Complete Profile Alert Modal */}
        <Modal
          visible={isProfileAlertVisible}
          animationType="fade"
          transparent
          statusBarTranslucent
          onRequestClose={closeProfileAlert}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: isDarkMode ? "#1c1c1e" : "white",
                borderRadius: 20,
                padding: 30,
                alignItems: "center",
                width: "90%",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  marginBottom: 20,
                  textAlign: "center",
                  color: isDarkMode ? "#eee" : "#000",
                }}
              >
                Complete Your Profile
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  textAlign: "center",
                  marginBottom: 30,
                  fontFamily: "Poppins_500Medium",
                  color: isDarkMode ? "#aaa" : "#555",
                }}
              >
                Kindly fill in your profile information before creating a
                booking.
              </Text>

              <TouchableOpacity
                onPress={() => {
                  closeProfileAlert();
                  router.push("/Tabs/Profile/Update"); // Adjust path to profile update screen
                }}
                style={{
                  backgroundColor: "#FF5ACC",
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 25,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16,
                  }}
                >
                  Fill Profile Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeProfileAlert}
                style={{ marginTop: 15 }}
              >
                <Text
                  style={{
                    color: isDarkMode ? "#888" : "#555",
                    fontFamily: "Poppins_600SemiBold",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
