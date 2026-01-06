import DeleteAccountModal from "@/components/Profile/DeleteAccountModal";
import { getApiUrl } from "@/config/api.config";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Chase } from "react-native-animated-spinkit";
import Modal from "react-native-modal";

const OTP_BOXES = 6;

// Deletion Reasons
const deleteReasons = [
  "No Longer Needed",
  "Found a Better Alternative",
  "The App contains too many Ads",
  "Privacy Concerns",
  "Not Enough Providers/Services",
  "Poor User Experience",
  "Lack of Features",
  "Dissatisfied with Service Providers",
  "Others",
];

const Security: React.FC = () => {
  const { isDarkMode, profile, logout } = useAuth();
  const userId = profile?.id as string | undefined;

  const [rememberMe, setRememberMe] = useState(true);
  const [faceID, setFaceID] = useState(true);

  // Password change modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  type Errors = {
    curr?: string;
    new?: string;
    confirm?: string;
  };
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // OTP modal and related state
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // DELETE MODAL STATE
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const toggleDeleteModal = useCallback(() => {
    setDeleteModalVisible((prev) => !prev);
  }, []);

  // LOGOUT MODAL STATE
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutModalStage, setLogoutModalStage] = useState<
    "confirm" | "loading" | "success"
  >("confirm");

  const toggleLogoutModal = useCallback(() => {
    if (logoutModalStage === "loading") return;
    setLogoutModalVisible((prev) => !prev);
    if (!isLogoutModalVisible) setLogoutModalStage("confirm");
  }, [isLogoutModalVisible, logoutModalStage]);

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#222";

  // Validate passwords before sending OTP
  const validate = () => {
    const errs: any = {};
    if (!currPassword) errs.curr = "Current password required";
    if (!newPassword || newPassword.length < 6)
      errs.new = "New password must be at least 6 characters";
    if (newPassword !== confirmPassword)
      errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Send OTP to user's email
  const sendOtp = async () => {
    if (!profile?.email) {
      Alert.alert("Error", "Email not found for user.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        getApiUrl("/otp/send-otp"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profile.email }),
        }
      );
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setOtp("");
        setShowOtpModal(true);
      } else {
        Alert.alert("OTP Send Failed", data.error || "Please try again.");
      }
    } catch {
      setLoading(false);
      Alert.alert("Network Error", "Failed to send OTP. Please try again.");
    }
  };

  // Handle initial change password request — validate and send OTP
  const handleChangePassword = () => {
    if (!validate()) return;
    if (!userId) {
      setModalMsg("User not found in session");
      return;
    }
    sendOtp();
  };

  // Handle OTP digit input
  const handleOtpChange = (text: string, i: number) => {
    if (!/^\d?$/.test(text)) return;
    const arr = otp.split("");
    arr[i] = text;
    setOtp(arr.join("").slice(0, OTP_BOXES));

    if (text.length === 1 && i < OTP_BOXES - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  // Handle backspace to move cursor back
  const handleOtpKeyPress = ({ nativeEvent }: any, i: number) => {
    if (
      nativeEvent.key === "Backspace" &&
      (!otp[i] || otp[i] === "") &&
      i > 0
    ) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  // Verify OTP and change password on success
  const verifyOtpAndChangePassword = async () => {
    if (otp.length !== OTP_BOXES) {
      Alert.alert("Invalid OTP", `Please enter a ${OTP_BOXES}-digit OTP`);
      return;
    }
    setOtpLoading(true);
    try {
      // Verify OTP
      const res = await fetch(
        getApiUrl("/otp/verify-otp"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: profile?.email, otp }),
        }
      );
      const data = await res.json();
      setOtpLoading(false);

      if (data.success) {
        // Proceed to change password
        setShowOtpModal(false);
        setLoading(true);
        const changeRes = await fetch(
          getApiUrl("/pass/change-password"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              current_password: currPassword,
              new_password: newPassword,
              userId,
            }),
          }
        );
        const changeData = await changeRes.json();
        setLoading(false);

        if (changeData.status === "success") {
          Alert.alert("Success", "Password changed successfully!");
          setModalVisible(false);
          setCurrPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setErrors({});
          setModalMsg("");
        } else {
          Alert.alert(
            "Failed",
            changeData.message || "Could not change password"
          );
        }
      } else {
        Alert.alert(
          "OTP Error",
          data.error || "Incorrect OTP, please try again."
        );
      }
    } catch (error: any) {
      console.log(error);
      setOtpLoading(false);
      Alert.alert("Network Error", "Unable to verify OTP. Please try again.");
    }
  };

  // LOGOUT HANDLER
  const handleLogout = async () => {
    setLogoutModalStage("loading");

    try {
      await fetch("https://femiiniq-backend.onrender.com/api/logout", {
        method: "POST",
      });

      logout();

      setLogoutModalStage("success");

      setTimeout(() => {
        setLogoutModalVisible(false);
        setLogoutModalStage("confirm");
        router.replace("/");
      }, 2000);
    } catch (error: any) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Logout failed. Try again.");
      setLogoutModalStage("confirm");
    }
  };

  // DELETE HANDLER
  const handleDeleteAccount = async (
    reasons: string[],
    otherReason: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        "https://femiiniq-backend.onrender.com/api/delete-profile",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fullname: profile?.fullname,
            mobile: profile?.mobile,
            address: profile?.address,
            reason: reasons.join(", "),
            extrareason: otherReason,
            unique_id: profile?.unique_id,
          }),
        }
      );

      const json = await response.json();

      if (json.status === "success") {
        logout();
        return null;
      } else {
        return json.message || "Failed to delete account.";
      }
    } catch (error: any) {
      console.error("Delete account error:", error);
      return "Network error, please try again.";
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ padding: 20 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 26,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={textColor}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Poppins_600SemiBold",
              color: textColor,
            }}
          >
            Security
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>Remember me</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#eee", true: "#ec4899" }}
            thumbColor={rememberMe ? "#fff" : "#ccc"}
            ios_backgroundColor="#eee"
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>App Lock</Text>
          <Switch
            value={faceID}
            onValueChange={setFaceID}
            trackColor={{ false: "#eee", true: "#ec4899" }}
            thumbColor={faceID ? "#fff" : "#ccc"}
            ios_backgroundColor="#eee"
          />
        </View>

        {/* Logout and Delete Account Section */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => setLogoutModalVisible(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF000D" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDeleteModal}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* DELETE MODAL */}
      <DeleteAccountModal
        isVisible={isDeleteModalVisible}
        isDarkMode={isDarkMode}
        toggleModal={toggleDeleteModal}
        deleteReasons={deleteReasons}
        handleDeleteAccount={handleDeleteAccount}
      />

      {/* LOGOUT MODAL */}
      <Modal
        isVisible={isLogoutModalVisible}
        backdropOpacity={0.6}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={{ justifyContent: "center", margin: 20 }}
        statusBarTranslucent
        onBackdropPress={toggleLogoutModal}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? "#333" : "#fff",
              alignItems: "center",
            },
          ]}
        >
          {logoutModalStage === "confirm" && (
            <>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dv9s7sm0x/image/upload/v1757739949/8622276_3963536-removebg-preview_ipbf5j.png",
                }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <Text style={styles.modalTitle}>Logout</Text>
              <Text
                style={[
                  styles.modalMessage,
                  { color: isDarkMode ? "#fff" : "#555" },
                ]}
              >
                Are you sure you want to log out?
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={toggleLogoutModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {logoutModalStage === "loading" && (
            <>
              <Chase size={50} color="#FF5ACC" />
              <Text
                style={[
                  styles.modalMessage,
                  { color: isDarkMode ? "#eee" : "#444", marginTop: 16 },
                ]}
              >
                Logging out...
              </Text>
            </>
          )}

          {logoutModalStage === "success" && (
            <Text
              style={[
                styles.modalMessage,
                { color: isDarkMode ? "#eee" : "#222" },
              ]}
            >
              You have been logged out.
            </Text>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  googleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    justifyContent: "space-between",
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  button: {
    borderRadius: 30,
    alignSelf: "center",
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  otpTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    marginBottom: 16,
  },
  otpDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  otpEmail: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FF5ACC",
  },
  otpBoxes: {
    flexDirection: "row",
    marginVertical: 16,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderColor: "#FF5ACC",
    marginHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    fontFamily: "Poppins_400Regular",
    fontSize: 20,
    textAlign: "center",
  },
  otpResend: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#FF5ACC",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  verifyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
    fontSize: 17,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    marginTop: 30,
    marginBottom: 20,
  },
  logoutText: {
    color: "#FF000D",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  deleteText: {
    color: "#FF000D",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    opacity: 0.82,
  },
  modalContent: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
  },
  modalImage: {
    width: 200,
    height: 150,
    marginBottom: 16,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
    color: "#FF000D",
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#444",
    textAlign: "center",
    marginBottom: 30,
  },
  modalButtonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f3d6e6",
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
});

export default Security;
