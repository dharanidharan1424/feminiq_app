import { ReportBookingModal } from "@/components/Booking/ReportBookingModal";
import CustomInput from "@/components/CustomInput";
import { useAuth } from "@/context/UserContext";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Wave } from "react-native-animated-spinkit";

type BookingStatus = "Upcoming" | "Completed" | "Cancelled";
const TABS: BookingStatus[] = ["Upcoming", "Completed", "Cancelled"];

interface Booking {
  id: number;
  booking_code: string;
  staff_name: string;
  user_name: string;
  address: string;
  date: string;
  time: string;
  status: string;
  service_at: string;
  specialist: any;
  booked_services: {
    quantity: number;
    name: string;
  }[];
  booked_packages: {
    [x: string]: number;
    name: any;
  }[];
  staff_image?: string;
  staff_mobile_image_url?: string;
  reschedule_status?: "pending" | "approved" | "rejected" | null;
  reschedule_reason?: string;
  [key: string]: any;
}

interface AlertModal2Props {
  visible: boolean;
  title: string;
  message: string;
  notes?: string;
  onClose: () => void;
  headerColor?: string; // e.g., "#FF0000"
  notesColor?: string;
  illustrationImage: any;
}

const statusMap: { [K in BookingStatus]: string } = {
  Upcoming: "upcoming",
  Completed: "completed",
  Cancelled: "cancelled",
};

/* -------------------------------
   Cancel Booking Modal Component
-------------------------------- */
function CancelBookingModal({
  visible,
  onClose,
  onConfirm,
  reason,
  setReason,
  isDarkMode,
  bookingToCancel,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (v: string) => void;
  isDarkMode: boolean;
  bookingToCancel: any;
}) {
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  function getRefundText(booking: any) {
    if (!booking?.date || !booking?.time) return "";
    const [hour, minute] = booking.time.split(":");
    const bookingDateTime = new Date(booking.date);
    bookingDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
    const diffHours = (bookingDateTime.getTime() - Date.now()) / 1000 / 60 / 60;
    if (diffHours > 24) {
      return "You are eligible for a full (100%) refund according to our policy.";
    } else {
      return "You are eligible for an 80% refund according to our policy.";
    }
  }

  function PolicyBullet({ text }: { text: string | React.ReactNode }) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginVertical: 2,
        }}
      >
        <Text style={{ color: "#FF5ACC", fontSize: 22, marginRight: 7 }}>
          ✔
        </Text>
        <Text
          style={{
            color: "#232323",
            fontSize: 12,
            flex: 1,
            fontFamily: "Poppins_400Regular",
          }}
        >
          {text}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            className="flex-1 justify-end"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.7)"
                : "rgba(0,0,0,0.4)",
            }}
          >
            <View
              className="rounded-t-3xl px-7 pt-7 pb-10"
              style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "white" }}
            >
              <Text
                className="text-center text-xl font-poppins-semibold mb-5 border-b pb-5"
                style={{
                  color: isDarkMode ? "#ff6b6b" : "#ef4444",
                  borderColor: isDarkMode ? "#333" : "#e5e7eb",
                }}
              >
                Cancel Booking
              </Text>
              <Text
                className="text-center text-lg font-poppins-semibold mb-2"
                style={{ color: isDarkMode ? "#e5e5e7" : "#111" }}
              >
                Are you sure want to cancel your booking?
              </Text>
              <Text
                className="text-center text-sm mb-4 font-poppins-regular"
                style={{ color: isDarkMode ? "#a1a1aa" : "#6b7280" }}
              >
                {getRefundText(bookingToCancel)}
              </Text>
              <Text
                className="text-sm font-poppins-semibold mb-2"
                style={{ color: isDarkMode ? "#d4d4d8" : "#111" }}
              >
                Reason for Cancellation
              </Text>
              <TextInput
                className="w-full rounded-xl min-h-[56px]  px-3 py-2 text-base mb-2"
                placeholder="Reason for cancellation"
                placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                value={reason}
                onChangeText={(text: any) => setReason(text)}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                  backgroundColor: isDarkMode ? "#111827" : "white",
                  color: isDarkMode ? "white" : "black",
                  fontFamily: "Poppins_400Regular",
                }}
              />

              <Text
                onPress={() => setShowPolicyModal(true)}
                className="text-sm font-poppins-regular text-center py-4 underline text-primary/80"
              >
                Read our cancellation policy
              </Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 mr-2 rounded-full py-4 px-1 items-center bg-gray-200"
                  onPress={onClose}
                >
                  <Text className="font-poppins-medium text-sm text-black ">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 ml-2 rounded-full py-4 px-1 items-center bg-red-500"
                  onPress={onConfirm}
                >
                  <Text className="text-white font-poppins-medium text-sm">
                    Yes, Cancel Booking
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={showPolicyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPolicyModal(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 28,
              maxWidth: 400,
              width: "90%",
              elevation: 6,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 28,
                textAlign: "center",
                marginBottom: 20,
                color: "#232323",
                fontFamily: "Poppins_600SemiBold",
              }}
              className="border-b  border-gray-200"
            >
              Cancellation Policy
            </Text>
            <View style={{ alignSelf: "stretch", gap: 16 }}>
              <PolicyBullet text="All cancellations made at least 24 hours before the scheduled service will be eligible for a 100% refund." />
              <PolicyBullet text="Cancellations made within 24 hours of the appointment will only be eligible for an 80% refund." />
              <PolicyBullet text="Refunds will be processed within 5-7 business days after cancellation confirmation." />
              <PolicyBullet text="Special promotional bookings may have different cancellation terms." />
              <PolicyBullet
                text={[
                  "For assistance, contact ",
                  <Text
                    key="email"
                    style={{
                      color: "#FF5ACC",
                      textDecorationLine: "underline",
                    }}
                  >
                    support@feminiq.com
                  </Text>,
                  ".",
                ]}
              />
            </View>
            <Text
              style={{
                marginTop: 20,
                color: "#000",
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
              }}
            >
              We value your time and thank you for understanding.
            </Text>
            <TouchableOpacity
              style={{ marginTop: 22 }}
              onPress={() => setShowPolicyModal(false)}
              className="border py-1 bg-primary/20 border-primary rounded-full px-10 items-center"
            >
              <Text
                style={{
                  color: "#FF5ACC",
                  fontSize: 16,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* AlertModal with dark mode */
function AlertModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
  isDarkMode,
}: {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDarkMode: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className="flex-1 justify-center items-center px-8"
          style={{
            backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
          }}
        >
          <View
            className="rounded-xl p-6 w-full max-w-md"
            style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "white" }}
          >
            <Text
              className="text-xl font-poppins-semibold mb-4 text-center"
              style={{ color: isDarkMode ? "#e5e5e7" : "#111" }}
            >
              {title}
            </Text>
            <Text
              className="text-base font-poppins-regular mb-6 text-center"
              style={{ color: isDarkMode ? "#a1a1aa" : "#374151" }}
            >
              {message}
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 mr-2 rounded-full py-3 items-center"
                style={{
                  backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
                }}
                onPress={onCancel}
              >
                <Text
                  className="font-poppins-medium text-base"
                  style={{ color: isDarkMode ? "#d1d5db" : "#374151" }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 ml-2 rounded-full py-3 items-center"
                style={{ backgroundColor: "#ff5acc" }}
                onPress={onConfirm}
              >
                <Text className="text-white font-poppins-medium text-base">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* AlertModal2 with dark mode */
export function AlertModal2({
  visible,
  title,
  message,
  notes,
  onClose,
  headerColor = "#000",
  notesColor = "#666",
  illustrationImage,
  isDarkMode,
}: AlertModal2Props & { isDarkMode: boolean }) {
  const darkHeaderColor = "#f87171"; // red-400 or similar
  const darkNotesColor = "#fca5a5"; // lighter red

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className="flex-1 justify-center items-center px-8"
          style={{
            backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
          }}
        >
          <View
            className="rounded-xl p-6 w-full max-w-md"
            style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "white" }}
          >
            <View
              className="border-b mb-4 pb-2"
              style={{
                borderColor: isDarkMode ? darkNotesColor : notesColor,
              }}
            >
              <Text
                className="text-xl font-poppins-semibold text-center"
                style={{ color: isDarkMode ? darkHeaderColor : headerColor }}
              >
                {title}
              </Text>
            </View>
            <View className="flex-row justify-center">
              {illustrationImage && (
                <Image
                  source={{ uri: illustrationImage }}
                  style={{ width: 150, height: 150, marginBottom: 16 }}
                  resizeMode="contain"
                />
              )}
            </View>
            <Text
              className="text-base font-poppins-medium mb-4 text-center"
              style={{ color: isDarkMode ? "#e5e5e7" : "#111" }}
            >
              {message}
            </Text>
            <View
              className="border p-2 mb-6 rounded-lg"
              style={{ borderColor: isDarkMode ? darkNotesColor : notesColor }}
            >
              {notes && (
                <Text
                  className="text-center font-poppins-regular text-sm"
                  style={{ color: isDarkMode ? darkHeaderColor : headerColor }}
                >
                  {notes}
                </Text>
              )}
            </View>
            <View>
              <TouchableOpacity
                className="border py-3 rounded-full items-center"
                style={{
                  borderColor: isDarkMode ? darkNotesColor : notesColor,
                }}
                onPress={onClose}
              >
                <Text
                  className="font-poppins-semibold text-base"
                  style={{ color: isDarkMode ? darkNotesColor : notesColor }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* -------------------------------
   Main Booking Page Component
-------------------------------- */
export default function BookingPage() {
  const { profile, showToast, isDarkMode } = useAuth();

  const [selected, setSelected] = useState<BookingStatus>("Upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelRescheduleLoading, setCancelRescheduleLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const [reportModalVisible, setReportModalVisible] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // New flags to track last shown modal state
  const [wasRejectedShown, setWasRejectedShown] = useState(false);
  const [wasApprovedShown, setWasApprovedShown] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<Date | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [bookingToReschedule, setBookingToReschedule] =
    useState<Booking | null>(null);

  const [
    showCancelRescheduleConfirmModal,
    setShowCancelRescheduleConfirmModal,
  ] = useState(false);
  const [pendingCancelRescheduleId, setPendingCancelRescheduleId] = useState<
    number | null
  >(null);

  // 24 logic for reschedule
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const handleReschedulePress = (booking: any) => {
    if (isWithin24Hours(booking)) {
      setInfoModalVisible(true);
    } else {
      openRescheduleModal(booking);
    }
  };

  const isWithin24Hours = (booking: any) => {
    if (!booking.date || !booking.time) return false;
    const [hour, minute] = booking.time.split(":");
    const bookingDateTime = new Date(booking.date);
    bookingDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
    const diffMs = bookingDateTime.getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 24;
  };

  // Fetch bookings from API
  const fetchBookings = useCallback(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    fetch(`https://feminiq-backend.onrender.com/booking/user/${profile.id}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.bookings) {
          setBookings(data.bookings);

          // Check for rejected reschedule status only where booking.state is null (not rejected yet)
          const hasRejected = data.bookings.some(
            (b: Booking) =>
              b.reschedule_status === "rejected" && b.status !== "cancelled"
          );

          // Check for approved reschedule status only where booking.state is null (not approved yet)
          const hasApproved = data.bookings.some(
            (b: Booking) =>
              b.reschedule_status === "approved" && b.status !== "pending"
          );

          if (hasRejected && !wasRejectedShown) {
            setModalMessage(
              "Your reschedule request was rejected by the provider. Please cancel the booking to get the refund."
            );
            setShowRejectedModal(true);
            setWasRejectedShown(true);
          } else if (hasApproved && !wasApprovedShown) {
            setModalMessage(
              "Your reschedule request was approved by the Service Provider"
            );
            setShowApprovedModal(true);
            setWasApprovedShown(true);
          }
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("Fetch bookings request timed out");
        } else {
          console.error("Fetch bookings error:", err);
        }
      })
      .finally(() => {
        clearTimeout(id);
        setLoading(false);
      });
  }, [profile?.id, wasRejectedShown, wasApprovedShown]);

  // initial fetch
  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  // Format date & time
  function formatDateTime(date: string, time: string) {
    if (!date || !time) return "";
    let [h, m, s] = time.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${hour}:${m.padStart(2, "0")} ${ampm}`;
  }

  // Open Cancel Modal
  function openCancelModal(booking: Booking) {
    setBookingToCancel(booking);
    setCancelReason("");
    setShowCancelModal(true);
  }

  function closeCancelModal() {
    setShowCancelModal(false);
  }

  // Confirm Cancel Booking
  async function handleConfirmCancel() {
    if (!bookingToCancel?.booking_code) return;

    await fetch("https://feminiq-backend.onrender.com/booking/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_code: bookingToCancel.booking_code,
        reason: cancelReason,
      }),
    });

    setShowCancelModal(false);
    fetchBookings();
  }

  // Open Reschedule Modal
  function openRescheduleModal(booking: Booking) {
    setBookingToReschedule(booking);
    setRescheduleDate(null);
    setRescheduleTime(null);
    setRescheduleReason("");
    setShowRescheduleModal(true);
  }

  function closeRescheduleModal() {
    setShowRescheduleModal(false);
  }

  // Confirm Reschedule Booking
  async function handleConfirmReschedule() {
    if (
      !bookingToReschedule?.booking_code ||
      !rescheduleDate ||
      !rescheduleTime
    )
      return;
    setRescheduleLoading(true); // start loading
    try {
      await fetch(
        "https://feminiq-backend.onrender.com/booking/reschedule-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingToReschedule.id,
            requested_date: rescheduleDate.toISOString().split("T")[0],
            requested_time: rescheduleTime.toTimeString().split(" ")[0],
            reason: rescheduleReason,
          }),
        }
      );

      showToast(
        "Reschedule request submitted and pending approval.",
        "success",
        "bottom"
      );

      setShowRescheduleModal(false);

      fetchBookings();
    } catch (err) {
      console.log(err);
      showToast("Error submitting reschedule request.", "remove", "bottom");
    } finally {
      setRescheduleLoading(false); // end loading
    }
  }

  // Open Cancel Reschedule Confirmation Modal
  function openCancelRescheduleConfirm(bookingId: number) {
    setPendingCancelRescheduleId(bookingId);
    setShowCancelRescheduleConfirmModal(true);
  }

  // Close Cancel Reschedule Confirmation Modal
  function closeCancelRescheduleConfirm() {
    setPendingCancelRescheduleId(null);
    setShowCancelRescheduleConfirmModal(false);
  }

  // Confirm Cancel Reschedule Request
  async function confirmCancelRescheduleRequest() {
    if (pendingCancelRescheduleId === null) return;
    setCancelRescheduleLoading(true); // Start loading
    try {
      const res = await fetch(
        `https://feminiq-backend.onrender.com/booking/reschedule-cancel/${pendingCancelRescheduleId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.status === "success") {
        showToast("Cancelled pending reschedule request.", "success", "bottom");
        fetchBookings();
      } else {
        showToast(
          data.message || "Failed to cancel reschedule request.",
          "remove",
          "bottom"
        );
      }
    } catch (err) {
      console.log(err);
      showToast("Network error while cancelling request.", "remove", "bottom");
    } finally {
      setCancelRescheduleLoading(false); // End loading
      closeCancelRescheduleConfirm();
    }
  }

  // Cancel Pending Reschedule Request Handler
  async function handleCancelRescheduleRequest(bookingId: number) {
    openCancelRescheduleConfirm(bookingId);
  }

  const closeRejectedModal = () => setShowRejectedModal(false);
  const closeApprovedModal = () => setShowApprovedModal(false);

  const filtered = bookings.filter((b) => b.status === statusMap[selected]);

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
    <>
      <View className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
        {(loading || rescheduleLoading || cancelRescheduleLoading) && (
          <Modal
            transparent={true}
            visible={true}
            animationType="fade"
            statusBarTranslucent
          >
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkMode
                  ? "rgba(0,0,0,0.7)"
                  : "rgba(0,0,0,0.3)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <Wave size={50} color="#FF5ACC" />
            </View>
          </Modal>
        )}

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-5 mb-3">
          <Text
            className={`font-poppins-semibold text-2xl ${isDarkMode ? "text-white" : "text-black"
              }`}
          >
            My Booking
          </Text>
          <Ionicons
            name="search"
            size={22}
            color={isDarkMode ? "#ccc" : "#555"}
            className="mx-2"
          />
        </View>

        <View className="flex-row justify-center px-5 items-center mb-3 mt-1">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelected(tab)}
              className={`rounded-full px-6 py-2 mx-2 border ${selected === tab
                ? "bg-primary/20 border-primary"
                : isDarkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-primary/50 bg-white"
                }`}
            >
              <Text
                className={`font-poppins-semibold text-sm ${selected === tab
                  ? "text-primary"
                  : isDarkMode
                    ? "text-gray-300"
                    : "text-primary"
                  }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView className="px-4 flex-1">
          {filtered.length === 0 && !loading && (
            <Text
              className={`text-center font-poppins-semibold mt-10 text-lg ${isDarkMode ? "text-gray-400" : "text-gray-400"
                }`}
            >
              No bookings found.
            </Text>
          )}

          {filtered.map((booking, idx) => {
            let badge = null;
            let showCancel = false;
            let receiptBtnClasses =
              "flex-1 bg-white border-2 rounded-xl py-3 items-center";
            let receiptBtnTextClasses = "font-poppins-medium text-base";
            const disableActions1 = booking.reschedule_status === "pending";
            const disableActions2 = booking.reschedule_status === "rejected";

            if (selected === "Completed") {
              badge = (
                <View
                  className={`ml-auto mb-2 px-3 py-2 rounded-full ${isDarkMode ? "bg-green-800" : "bg-green-100"
                    }`}
                >
                  <Text
                    className={`text-xs font-poppins-semibold ${isDarkMode ? "text-green-300" : "text-green-700"
                      }`}
                  >
                    Completed
                  </Text>
                </View>
              );
              receiptBtnClasses += isDarkMode
                ? " bg-green-900 border-green-700"
                : " bg-green-100 border-green-400";
              receiptBtnTextClasses += isDarkMode
                ? " text-green-400"
                : " text-green-600";
            } else if (selected === "Cancelled") {
              badge = (
                <View
                  className={`ml-auto mb-2 px-3 py-1 rounded-full ${isDarkMode ? "bg-red-900" : "bg-red-100"
                    }`}
                >
                  <Text
                    className={`text-xs font-poppins-semibold ${isDarkMode ? "text-red-400" : "text-red-500"
                      }`}
                  >
                    Cancelled
                  </Text>
                </View>
              );
              receiptBtnClasses += isDarkMode
                ? " border-red-700"
                : " border-red-400";
              receiptBtnTextClasses += isDarkMode
                ? " text-red-400"
                : " text-red-600";
            } else {
              showCancel = true;
            }

            const handleToggleReminder = async (
              bookingId: any,
              newValue: any
            ) => {
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId
                    ? { ...b, reminder_enabled: newValue ? 1 : 0 }
                    : b
                )
              );

              try {
                const response = await fetch(
                  `https://feminiq-backend.onrender.com/notification/toggle-booking-reminder`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookingId, enabled: newValue }),
                  }
                );
                const data = await response.json();
                if (data.status !== "success") {
                  alert(data.message || "Failed to update reminder");
                  // Optional: revert UI change if API failed
                  setBookings((prev) =>
                    prev.map((b) =>
                      b.id === bookingId
                        ? { ...b, reminder_enabled: newValue ? 0 : 1 }
                        : b
                    )
                  );
                }
              } catch (error: any) {
                alert("Network error updating reminder");
                console.error("Error updating reminder:", error);
                // Revert UI update on error
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === bookingId
                      ? { ...b, reminder_enabled: newValue ? 0 : 1 }
                      : b
                  )
                );
              }
            };

            const staffId = booking.staff_id; // or however you get the staff ID

            const getStaffDetails = async () => {
              try {
                const response = await fetch(
                  `https://feminiq-backend.onrender.com/api/get-staffs/${staffId}`
                );

                const data = await response.json();
                const staffData = data.data;
                // Navigate after fetching details
                router.push({
                  pathname: "/Details", // fix capitalization: pathname is all lowercase
                  params: { ...staffData, backPath: "booking" }, // pass data if you want, or just use staffId
                });
                return staffData;
              } catch (error) {
                console.error("Error fetching staff details:", error);
              }
            };

            const handleReport = () => {
              setReportModalVisible(true);
            };

            return (
              <TouchableOpacity
                onPress={getStaffDetails}
                className={`rounded-3xl shadow shadow-black/10 my-2 p-4 pb-4 relative ${isDarkMode
                  ? disableActions2
                    ? "bg-red-900 border border-red-700"
                    : "bg-gray-800"
                  : disableActions2
                    ? "bg-red-100 border border-red-500"
                    : "bg-white"
                  }`}
                key={booking.id || idx}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text
                    className={`font-poppins-semibold text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    {formatDateTime(booking.date, booking.time)}
                  </Text>

                  <View className="flex-row items-center ">
                    {!disableActions2 &&
                      !disableActions1 &&
                      selected === "Upcoming" && (
                        <View className="flex-row items-center">
                          <Text
                            className={`mr-1 text-xs font-poppins-regular ${isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                          >
                            Remind me
                          </Text>
                          <Switch
                            key={booking.id}
                            value={booking.reminder_enabled === 1}
                            onValueChange={(newValue) =>
                              handleToggleReminder(booking.id, newValue)
                            }
                            trackColor={{ false: "#e5e5e5", true: "#ff5acc" }}
                            thumbColor={"#ffffff"}
                            ios_backgroundColor="#e5e5e5"
                          />
                        </View>
                      )}

                    {!disableActions2 &&
                      !disableActions1 &&
                      (selected === "Upcoming" || selected === "Completed") && (
                        <View>
                          <TouchableOpacity onPress={handleReport}>
                            <MaterialCommunityIcons
                              name="dots-vertical"
                              size={20}
                              color={"#ff5acc"}
                              onPress={() =>
                                setOpenDropdownId(
                                  openDropdownId === booking.id
                                    ? null
                                    : booking.id
                                )
                              }
                            />
                          </TouchableOpacity>
                          {openDropdownId === booking.id && (
                            <View className="absolute top-8 right-1 bg-white rounded-md shadow-lg z-50 w-40 p-2">
                              <TouchableOpacity
                                className="py-2 px-3  flex-row items-center gap-2  hover:bg-gray-200"
                                onPress={() => {
                                  setOpenDropdownId(null);
                                  handleReport();
                                }}
                              >
                                <FontAwesome5
                                  name="flag"
                                  color={"red"}
                                  size={15}
                                />
                                <Text className="text-base text-red-600 font-poppins-medium">
                                  Report
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      )}
                  </View>

                  <ReportBookingModal
                    visible={reportModalVisible}
                    onClose={() => setReportModalVisible(false)}
                    booking={{
                      orderId: booking.id,
                      service: "Service",
                      staff: booking.staff_name,
                      location: booking.address,
                    }}
                  />

                  {badge}

                  {showCancel && booking.reschedule_status && (
                    <View
                      className={`self-start mb-2 px-3 py-1 rounded-full flex-row items-center ${booking.reschedule_status === "pending"
                        ? isDarkMode
                          ? "bg-yellow-900"
                          : "bg-yellow-100"
                        : "bg-red-100"
                        }`}
                    >
                      <Text
                        className={`text-xs font-poppins-semibold ${booking.reschedule_status === "pending"
                          ? isDarkMode
                            ? "text-yellow-300"
                            : "text-yellow-600"
                          : isDarkMode
                            ? "text-red-400"
                            : "text-red-600"
                          }`}
                      >
                        {booking.reschedule_status === "pending"
                          ? "Reschedule Pending"
                          : "Reschedule Rejected"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Service Row */}
                <View className="flex-row mt-1 items-center">
                  {booking.staff_mobile_image_url || booking.staff_image ? (
                    <Image
                      source={{
                        uri:
                          booking.staff_mobile_image_url || booking.staff_image,
                      }}
                      className="w-16 h-16 rounded-2xl mr-3"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-2xl mr-3 bg-pink-100" />
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text
                        className={`font-poppins-semibold text-lg mb-1 ${isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {booking.staff_name}
                      </Text>
                      {booking.rating && (
                        <View className="flex-row items-center ml-2 mb-1">
                          <MaterialIcons name="star" size={14} color="#FF5ACC" />
                          <Text className="text-xs font-poppins-medium text-[#FF5ACC] ml-0.5">
                            {Number(booking.rating).toFixed(1)}
                            {booking.reviews_count ? ` (${booking.reviews_count})` : ""}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className={`text-sm mb-0.5 font-poppins-regular ${isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      {booking.service_at}
                    </Text>
                    <Text
                      className={`text-xs font-poppins-regular ${isDarkMode ? "text-gray-500" : "text-gray-600"
                        }`}
                    >
                      Services:
                    </Text>
                    <Text className="text-xs font-poppins-regular text-primary mt-0.5">
                      {[
                        ...(booking.booked_services || []),
                        ...(booking.booked_packages || []),
                      ]
                        .map((s) => `${s.name} x ${s.quantity || 1}`)
                        .join(", ")}
                    </Text>
                  </View>
                </View>

                {/* Buttons */}
                <View className="flex-row mt-5">
                  {booking.reschedule_status === "pending" ? (
                    <TouchableOpacity
                      className="flex-1 border border-yellow-500 bg-yellow-100 rounded-full py-2 items-center"
                      onPress={() => handleCancelRescheduleRequest(booking.id)}
                    >
                      <Text className="text-yellow-700 font-poppins-medium text-xs">
                        Cancel Reschedule Request
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {showCancel && (
                        <TouchableOpacity
                          className={`flex-1 mr-2 border border-primary py-2 items-center ${disableActions2
                            ? "bg-red-100 border border-red-500 rounded-lg"
                            : "bg-primary/10 rounded-full"
                            }`}
                          onPress={() => openCancelModal(booking)}
                        >
                          <Text
                            className={`font-poppins-medium text-xs ${disableActions2 ? "text-red-500" : "text-primary"
                              }`}
                          >
                            Cancel Booking
                          </Text>
                        </TouchableOpacity>
                      )}
                      {showCancel && !disableActions2 && (
                        <TouchableOpacity
                          className={`flex-1 mx-2 border rounded-full py-2 items-center ${isWithin24Hours(booking)
                            ? "bg-gray-300 border-gray-400"
                            : "border-primary bg-primary/20"
                            }`}
                          onPress={() => handleReschedulePress(booking)}
                        >
                          <Text
                            className={`font-poppins-medium text-xs ${isWithin24Hours(booking)
                              ? "text-gray-500"
                              : "text-primary"
                              }`}
                          >
                            Reschedule
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {(!disableActions2 || !showCancel) && (
                    <TouchableOpacity
                      className={
                        showCancel
                          ? "flex-1 ml-2 bg-primary rounded-full py-2 items-center"
                          : receiptBtnClasses
                      }
                      onPress={() =>
                        router.push({
                          pathname: "/Booking/Reciept",
                          params: { bookingCode: booking.booking_code },
                        })
                      }
                    >
                      <Text
                        className={
                          showCancel
                            ? "text-white font-poppins-medium text-xs"
                            : receiptBtnTextClasses
                        }
                      >
                        View E-Receipt
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View className="h-10" />
        </ScrollView>

        {/* Cancel Booking Modal */}
        <CancelBookingModal
          isDarkMode={isDarkMode}
          visible={showCancelModal}
          onClose={closeCancelModal}
          onConfirm={handleConfirmCancel}
          reason={cancelReason}
          setReason={setCancelReason}
          bookingToCancel={bookingToCancel}
        />

        {/* Reschedule Booking Modal */}
        <Modal
          visible={showRescheduleModal}
          animationType="slide"
          transparent
          statusBarTranslucent
          onRequestClose={closeRescheduleModal}
        >
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View
              className="flex-1 justify-end"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(0,0,0,0.7)"
                  : "rgba(0,0,0,0.4)",
              }}
            >
              <View
                className="rounded-t-3xl px-7 pt-7 pb-10"
                style={{ backgroundColor: isDarkMode ? "#1c1c1e" : "white" }}
              >
                <Text
                  className="text-center text-xl font-poppins-semibold mb-2 border-b pb-5"
                  style={{
                    color: isDarkMode ? "#bb86fc" : "#3b82f6", // primary color alternate for dark mode
                    borderColor: isDarkMode ? "#333" : "#e5e7eb",
                  }}
                >
                  Reschedule Booking
                </Text>
                <View>
                  <Text
                    className="font-poppins-medium mb-1"
                    style={{ color: isDarkMode ? "#e5e5e7" : "#111" }}
                  >
                    Reschedule Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <CustomInput
                      placeholder="Reschedule Date"
                      value={
                        rescheduleDate
                          ? rescheduleDate.toLocaleDateString()
                          : "Select New Date"
                      }
                      editable={false}
                      leftIconName="calendar"
                      isDarkMode={isDarkMode}
                    />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={rescheduleDate || new Date()}
                      mode="date"
                      minimumDate={new Date()}
                      display="calendar"
                      onChange={(_, date) => {
                        setShowDatePicker(false);
                        if (date) setRescheduleDate(date);
                      }}
                    />
                  )}
                </View>

                <View>
                  <Text
                    className="font-poppins-medium my-1"
                    style={{ color: isDarkMode ? "#e5e5e7" : "#111" }}
                  >
                    Reschedule Time
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className="mb-4"
                  >
                    <CustomInput
                      placeholder="Reschedule Time"
                      value={
                        rescheduleTime
                          ? rescheduleTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "Select New Time"
                      }
                      editable={false}
                      leftIconName="time"
                      isDarkMode={isDarkMode}
                    />
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={rescheduleTime || new Date()}
                      mode="time"
                      display="spinner"
                      minimumDate={new Date()}
                      onChange={(_, time) => {
                        setShowTimePicker(false);
                        if (time) setRescheduleTime(time);
                      }}
                    />
                  )}
                </View>

                <Text
                  className="text-sm font-poppins-semibold mb-2"
                  style={{ color: isDarkMode ? "#e5e5e7" : "#111" }}
                >
                  Reason for Rescheduling
                </Text>
                <TextInput
                  className="w-full rounded-xl min-h-[56px] px-3 py-2 text-base mb-6"
                  placeholder="Reason for rescheduling"
                  placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                  value={rescheduleReason}
                  onChangeText={setRescheduleReason}
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                    backgroundColor: isDarkMode ? "#111827" : "white",
                    color: isDarkMode ? "white" : "black",
                  }}
                />

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="flex-1 mr-2 rounded-full py-4 px-1 items-center"
                    style={{
                      backgroundColor: isDarkMode ? "#33172f" : "#fbcfe8",
                    }}
                    onPress={closeRescheduleModal}
                  >
                    <Text
                      className="font-poppins-medium text-sm"
                      style={{ color: isDarkMode ? "#f9a8d4" : "#db2777" }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 ml-2 rounded-full py-4 px-1 items-center"
                    style={{ backgroundColor: "#ff5acc" }}
                    onPress={handleConfirmReschedule}
                  >
                    <Text className="text-white font-poppins-medium text-sm">
                      Confirm Reschedule
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Cancel Reschedule Confirmation Modal */}
        <AlertModal
          isDarkMode={isDarkMode}
          visible={showCancelRescheduleConfirmModal}
          title="Cancel Reschedule Request"
          message="Are you sure you want to cancel the pending reschedule request?"
          onConfirm={confirmCancelRescheduleRequest}
          onCancel={closeCancelRescheduleConfirm}
          confirmText="Yes, Cancel"
          cancelText="No"
        />

        <AlertModal2
          isDarkMode={isDarkMode}
          visible={showRejectedModal}
          title="Reschedule Request Rejected"
          message={modalMessage}
          notes="Cancel the booking to get the refund because the provider rejected your request"
          onClose={closeRejectedModal}
          headerColor="#dc2626"
          notesColor="#dc2626"
          illustrationImage={
            "https://res.cloudinary.com/dv9s7sm0x/image/upload/v1757683899/Wavy_Bus-26_Single-11_i2xqhw.jpg"
          }
        />

        <AlertModal2
          isDarkMode={isDarkMode}
          visible={showApprovedModal}
          title="Reschedule Request Approved"
          message={modalMessage}
          notes="The date and time is updated in your booking"
          onClose={closeApprovedModal}
          headerColor="#24cf41"
          notesColor="#55f26f"
          illustrationImage={
            "https://res.cloudinary.com/dv9s7sm0x/image/upload/v1757683912/19197272_jp6kaf.jpg"
          }
        />

        <Modal
          transparent
          visible={infoModalVisible}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="w-11/12 max-w-md bg-white rounded-2xl p-6 shadow-lg items-center">
              <Text className="text-lg font-poppins-semibold mb-2 text-gray-800">
                Cannot Reschedule
              </Text>
              <Text className="text-base font-poppins-regular text-gray-700 text-center mb-4">
                You can&apos;t reschedule this booking because it&lsquo;s less
                than 24 hours until your appointment.
                {"\n\n"}You may still take the service, or choose to cancel the
                order from here.
              </Text>
              <TouchableOpacity
                className="bg-pink-400 rounded-lg py-2 px-6"
                onPress={() => setInfoModalVisible(false)}
              >
                <Text className="text-white font-poppins-semibold text-base">
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
