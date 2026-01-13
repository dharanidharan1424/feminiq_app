import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";

import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Wave } from "react-native-animated-spinkit";

// Types for safe state/DB structure
type SpecialistType = { name: string } | string;
type ServiceOrPackage = {
  quantity: any;
  name: string;
  price: string | number;
};

type BookingType = {
  id: number;
  order_id?: string;
  booking_code: string;
  receipt_id: number;
  notes: string;
  total_price: number;
  services: any[];
  service_at: string;
  address: string;
  location?: string;
  user_name: string;
  user_mobile: string;
  date: string;
  time: string;
  booking_date?: string;
  booking_time?: string;
  specialist: SpecialistType[] | SpecialistType;
  booked_services: ServiceOrPackage[];
  booked_packages: ServiceOrPackage[];
  staff_name: string;
  agent_name?: string;
};

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
interface SummaryRowProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

const SummaryRow: React.FC<SummaryRowProps & { isDarkMode?: boolean }> = ({
  label,
  value,
  valueClassName,
  isDarkMode,
}) => (
  <View className="flex-row justify-between py-2">
    <Text
      className="font-poppins-regular text-[12px]"
      style={{ color: isDarkMode ? "#aaa" : undefined }} // Light gray in dark mode
    >
      {label}
    </Text>
    <Text
      className={`font-poppins-semibold text-sm ${valueClassName || ""}`}
      style={{ color: isDarkMode ? "#eee" : undefined }} // Lighter color in dark mode
    >
      {value}
    </Text>
  </View>
);
type DownloadSuccessModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DownloadSuccessModal({
  visible,
  onClose,
  onConfirm,
}: DownloadSuccessModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      statusBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-center items-center p-6">
        <View className="bg-white rounded-2xl py-8 px-6 w-full max-w-sm items-center shadow-lg">
          <Ionicons
            name="checkmark-circle"
            size={64}
            color="#FF49B7"
            className="mb-4"
          />
          <Text className="text-lg font-poppins-semibold text-center text-gray-800 mb-6">
            PDF downloaded successfully!
          </Text>
          <TouchableOpacity
            onPress={() => {
              onClose();
              onConfirm();
            }}
            activeOpacity={0.7}
            className="bg-primary rounded-lg py-3 px-10 w-full"
          >
            <Text className="text-white font-poppins-semibold text-center text-lg">
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
export default function ReceiptPage() {
  const { profile, isDarkMode } = useAuth();
  const params = useLocalSearchParams();
  const [booking, setBooking] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [downloadedUri, setDownloadedUri] = React.useState<string | null>(null);
  const platformFeePercent = 5;
  const couponPercent = 20;

  const couponAmount = booking
    ? Math.round(booking.total_price * (couponPercent / 100))
    : 0;

  const platformFee = booking
    ? Math.round(
      (booking.total_price - couponAmount) * (platformFeePercent / 100)
    )
    : 0;

  const finalAmount = booking
    ? booking.total_price - couponAmount + platformFee
    : 0;

  useEffect(() => {
    async function fetchBooking() {
      try {
        const bookingCode = (params as { bookingCode?: string })?.bookingCode;
        if (!bookingCode) return;
        const response = await fetch(
          `https://femiiniq-backend.onrender.com/booking/${bookingCode}`
        );
        const resJson = await response.json();
        if (resJson.status === "success") {
          setBooking(resJson.booking);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [params, booking]);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-pink-500 text-lg font-semibold">
          Loading receipt…
        </Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-base">No booking found.</Text>
      </View>
    );
  }

  // Format Specialist: support string, object, or array
  let specialistText = "";
  if (Array.isArray(booking.specialist)) {
    specialistText = booking.specialist
      .map((s) => (typeof s === "string" ? s : s.name))
      .join(", ");
  } else if (typeof booking.specialist === "string") {
    specialistText = booking.specialist;
  } else if (booking.specialist && "name" in booking.specialist) {
    specialistText = booking.specialist.name;
  }

  const onDownloadClick = async () => {
    try {
      if (!booking) return;
      setDownloading(true);

      const receiptUrl = `https://femiiniq-backend.onrender.com/receipt/${booking.id}`; // Use ID for receipt
      const fileName = `receipt_${booking.id}_${Date.now()}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Download PDF to document directory
      const { uri } = await FileSystem.downloadAsync(receiptUrl, fileUri);

      console.log('PDF downloaded to:', uri);

      // Use Sharing API to let user save/share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share Receipt',
          UTI: 'com.adobe.pdf'
        });
        setDownloadedUri(uri);
        setModalVisible(true);
      } else {
        Alert.alert('Success', 'Receipt downloaded to app storage');
        setDownloadedUri(uri);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert("Error", "Failed to download receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const sharePdf = async () => {
    if (downloadedUri) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadedUri);
      } else {
        Alert.alert("Sharing not available");
      }
    }
  };

  const displayDate = booking.booking_date || booking.date;
  const displayTime = booking.booking_time || booking.time;
  const displayServices = booking.services || booking.booked_services || [];

  return (
    <ScrollView
      className="px-4 pt-6 relative"
      style={{
        backgroundColor: isDarkMode ? "#121212" : "#f9fafb",
        paddingBottom: 30,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mt-2 mb-2">
        <TouchableOpacity
          onPress={() => router.push("/Tabs")}
          className="p-1 mr-1"
        >
          <Ionicons
            name="arrow-back"
            size={27}
            color={isDarkMode ? "#eee" : "#131313"}
          />
        </TouchableOpacity>
        <Text
          className="text-2xl font-poppins-semibold ml-[-12]"
          style={{ color: isDarkMode ? "#eee" : "#000" }}
        >
          E-Receipt
        </Text>
        <Ionicons
          name="ellipsis-horizontal-outline"
          size={28}
          color={isDarkMode ? "#888" : "#919191"}
        />
      </View>

      <View
        className="rounded-2xl shadow-md mb-4 gap-2 px-4 py-5"
        style={{
          backgroundColor: isDarkMode ? "#1c1c1e" : "#fff",
          shadowColor: isDarkMode ? "#000" : undefined,
        }}
      >
        {[
          { label: "Receipt Order ID", value: booking.order_id || booking.booking_code || booking.id },
          { label: "Service Provider", value: booking.agent_name || booking.staff_name || "Feminiq Staff" },
          { label: "Service At", value: booking.service_at || "Home" },
          { label: "Address", value: booking.address || booking.location },
          { label: "Name", value: profile?.fullname || booking.user_name },
          {
            label: "Phone",
            value: `+91 ${profile?.mobile || booking.user_mobile || ""}`,
          },
          { label: "Booking Date", value: formatDisplayDate(String(displayDate)) },
          { label: "Booking Time", value: displayTime },
          { label: "Specialist", value: specialistText || "N/A" },
        ].map(({ label, value }, index) => (
          <View key={index} className="flex-row justify-between mb-2">
            <Text
              className="text-base font-poppins-regular"
              style={{ color: isDarkMode ? "#aaa" : "#4b5563" }}
            >
              {label}
            </Text>
            <Text
              className="text-sm font-poppins-medium text-right"
              style={{ color: isDarkMode ? "#eee" : "#111" }}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>

      {/* Services/packages card */}
      <View
        className="rounded-xl p-5 shadow-md mb-4"
        style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
      >
        <Text
          className="text-lg font-poppins-semibold border-b pb-1 mb-2"
          style={{
            color: isDarkMode ? "#eee" : undefined,
            borderColor: isDarkMode ? "#333" : "#d1d5db",
          }}
        >
          Product Details
        </Text>
        {displayServices.map((item: any, idx: number) => (
          <View key={idx} className="flex-row justify-between py-1">
            <Text
              className="font-poppins-regular text-[12px]"
              style={{ color: isDarkMode ? "#888" : "#6b7280" }}
            >
              {item.name || item.service_name} {`( ${item.quantity || 1} )`}
            </Text>
            <Text
              className="font-poppins-semibold text-sm"
              style={{ color: isDarkMode ? "#eee" : undefined }}
            >
              ₹ {item.price || item.total_price || item.amount}
            </Text>
          </View>
        ))}
      </View>

      <View
        className="rounded-xl p-5 shadow-md mb-4"
        style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
      >
        <SummaryRow
          label={`Coupon Applied (Discount 20%)`}
          value={`- ₹ ${couponAmount}`}
          valueClassName="text-red-600"
          isDarkMode={isDarkMode}
        />
        <SummaryRow
          label="Platform Fee (5%)"
          value={`₹ ${platformFee}`}
          isDarkMode={isDarkMode}
        />
        <View
          className="mt-3 border-t flex-row justify-between pt-3"
          style={{ borderColor: isDarkMode ? "#333" : "#d1d5db" }}
        >
          <Text
            className="font-poppins-semibold text-lg"
            style={{ color: isDarkMode ? "#eee" : undefined }}
          >
            Total
          </Text>
          <Text
            className="font-poppins-semibold text-lg"
            style={{ color: isDarkMode ? "#eee" : undefined }}
          >
            ₹ {finalAmount}
          </Text>
        </View>
      </View>

      {booking.notes && (
        <View
          className="rounded-xl p-4 shadow-md mt-2"
          style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "#fff" }}
        >
          <Text
            className="font-poppins-semibold text-base mb-1 border-b pb-1"
            style={{ color: isDarkMode ? "#888" : "#6b7280" }}
          >
            Notes
          </Text>
          <Text
            className="font-poppins-regular text-sm"
            style={{ color: isDarkMode ? "#ddd" : undefined }}
          >
            {booking.notes}
          </Text>
        </View>
      )}

      {/* Download button */}
      <TouchableOpacity
        className="py-4 rounded-full w-full my-8 items-center"
        activeOpacity={0.87}
        onPress={onDownloadClick}
        style={{
          backgroundColor: "#FF5ACC",
          shadowColor: isDarkMode ? "#FF5ACC" : undefined,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        {downloading ? (
          <View>
            <Wave size={30} color="#FFF" />
          </View>
        ) : (
          <Text className="text-white font-poppins-semibold text-lg">
            Download E-Receipt
          </Text>
        )}
      </TouchableOpacity>

      <DownloadSuccessModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={sharePdf}
      />
    </ScrollView>
  );
}
