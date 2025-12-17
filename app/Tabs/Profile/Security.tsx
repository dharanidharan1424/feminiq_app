import CustomInput from "@/components/CustomInput";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";

const OTP_BOXES = 6;

const Security: React.FC = () => {
  const { isDarkMode, profile } = useAuth();
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
        "https://feminiq-backend.onrender.com/otp/send-otp",
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
        "https://feminiq-backend.onrender.com/otp/verify-otp",
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
          "https://feminiq-backend.onrender.com/pass/change-password",
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

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isDarkMode
                ? "rgba(255, 90, 204, 0.2)"
                : "#FCE9F4",
            },
          ]}
          onPress={() => setModalVisible(true)}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: "#FF5ACC" }]}>
            Change Password
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => !loading && setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 12,
                color: isDarkMode ? "#eee" : "#222",
                textAlign: "center",
              }}
            >
              Change Password
            </Text>

            <CustomInput
              placeholder="Current Password"
              value={currPassword}
              onChangeText={setCurrPassword}
              leftIconName="lock-closed"
              rightIconName={
                secureTextEntry ? "eye-off-outline" : "eye-outline"
              }
              secureTextEntry={secureTextEntry}
              onRightIconPress={() => setSecureTextEntry((prev) => !prev)}
              error={errors.curr}
              isDarkMode={isDarkMode}
              placeholderTextColor={isDarkMode ? "#bbb" : "#999"}
              editable={!loading}
              isEditing={true}
            />

            <CustomInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              leftIconName="lock-closed"
              rightIconName={
                secureTextEntry ? "eye-off-outline" : "eye-outline"
              }
              secureTextEntry={secureTextEntry}
              onRightIconPress={() => setSecureTextEntry((prev) => !prev)}
              error={errors.new}
              isDarkMode={isDarkMode}
              placeholderTextColor={isDarkMode ? "#bbb" : "#999"}
              editable={!loading}
              isEditing={true}
            />

            <CustomInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIconName="lock-closed"
              rightIconName={
                secureTextEntry ? "eye-off-outline" : "eye-outline"
              }
              secureTextEntry={secureTextEntry}
              onRightIconPress={() => setSecureTextEntry((prev) => !prev)}
              error={errors.confirm}
              isDarkMode={isDarkMode}
              placeholderTextColor={isDarkMode ? "#bbb" : "#999"}
              editable={!loading}
              isEditing={true}
            />

            {!!modalMsg && (
              <Text
                style={{
                  color: modalMsg.includes("success") ? "#22c55e" : "#f87171",
                  fontFamily: "Poppins_400Regular",
                  fontSize: 14,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {modalMsg}
              </Text>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: loading ? "#fcacd7" : "#FF5ACC",
                paddingVertical: 12,
                borderRadius: 8,
                width: "100%",
                marginTop: 8,
                alignItems: "center",
              }}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 16,
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Text>
            </TouchableOpacity>

            {!loading && (
              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  marginTop: 8,
                  borderRadius: 8,
                  width: "100%",
                  marginBottom: 4,
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                className="bg-primary/10 "
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={{
                    color: "#FF5ACC",
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* OTP Input Modal */}
      <Modal
        visible={showOtpModal}
        transparent
        statusBarTranslucent
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: isDarkMode ? "#333" : "#fff" },
            ]}
          >
            <Text
              style={[styles.otpTitle, { color: isDarkMode ? "#eee" : "#222" }]}
            >
              Enter OTP
            </Text>
            <Text
              style={[styles.otpDesc, { color: isDarkMode ? "#ccc" : "#444" }]}
            >
              Enter the verification code sent to {"\n"}
              <Text style={styles.otpEmail}>{profile?.email}</Text>
            </Text>
            <View style={styles.otpBoxes}>
              {Array.from({ length: OTP_BOXES }).map((_, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => (inputRefs.current[i] = ref)}
                  value={otp[i] || ""}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleOtpChange(text, i)}
                  onKeyPress={(e) => handleOtpKeyPress(e, i)}
                  style={styles.otpInput}
                  autoFocus={i === 0}
                />
              ))}
            </View>
            <Text style={styles.otpResend} onPress={sendOtp}>
              Didn’t get a code?{" "}
              <Text
                style={{ color: "#ff5acc", textDecorationLine: "underline" }}
              >
                resend
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={verifyOtpAndChangePassword}
              disabled={otpLoading}
            >
              <Text style={styles.verifyButtonText}>
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>
          </View>
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
});

export default Security;
