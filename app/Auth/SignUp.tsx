import FacebookLogin from "@/components/Auth/FacebookLogin";
import GoogleLogin from "@/components/Auth/GoogleLogin";
import CustomInput from "@/components/CustomInput";
import { getApiUrl } from "@/config/api.config";
import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Chase } from "react-native-animated-spinkit";

// For simplicity, you can replace CustomInput with a basic <TextInput> if you wish
const OTP_BOXES = 6;

const SignUp = () => {
  console.log("SignUp Component Rendered");
  const { setToken, updateProfile, isDarkMode } = useAuth();
  const router = useRouter();

  // Sign-up state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(false);
  console.log("Current loading state:", loading);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Validate password requirements
  const validatePassword = (pwd: string) => {
    setPasswordValidation({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#000";

  const placeholderColor = isDarkMode ? "#bbb" : "#999";
  const errorTextColor = "#f87171";

  const handleLoginSuccess = async (user: any, token: string) => {
    await setToken(token);
    if (user) await updateProfile(user);

    router.push("/Tabs");
  };

  const handleLoginFailure = (errorMessage: string) => {
    console.log("Login Failed: ", errorMessage);
  };

  const emailRegex = /\S+@\S+\.\S+/;

  // Handle password input with validation
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);

    // Clear password error if all validations pass
    const validations = {
      minLength: text.length >= 8,
      hasUppercase: /[A-Z]/.test(text),
      hasLowercase: /[a-z]/.test(text),
      hasNumber: /[0-9]/.test(text),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(text),
    };

    if (validations.minLength && validations.hasUppercase &&
      validations.hasLowercase && validations.hasNumber &&
      validations.hasSpecialChar) {
      setPasswordError("");
    }
  };

  // Main signup logic
  const handleSignUpClick = async () => {
    console.log("handleSignUpClick initiated");
    let valid = true;

    setEmailError("");
    setPasswordError("");
    setConfirmError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    } else if (!passwordValidation.hasUppercase) {
      setPasswordError("Password must contain at least one uppercase letter");
      valid = false;
    } else if (!passwordValidation.hasLowercase) {
      setPasswordError("Password must contain at least one lowercase letter");
      valid = false;
    } else if (!passwordValidation.hasNumber) {
      setPasswordError("Password must contain at least one number");
      valid = false;
    } else if (!passwordValidation.hasSpecialChar) {
      setPasswordError("Password must contain at least one special character");
      valid = false;
    }

    if (showConfirmPassword) {
      if (!confirmPassword) {
        setConfirmError("Please confirm your password");
        valid = false;
      } else if (confirmPassword !== password) {
        setConfirmError("Passwords do not match");
        valid = false;
      }
    }

    console.log("All validations passed:", valid);
    console.log("showConfirmPassword:", showConfirmPassword);

    if (!showConfirmPassword && valid) {
      console.log("Showing confirm password field");
      setShowConfirmPassword(true);
      return;
    }

    if (showConfirmPassword && valid) {
      try {
        setLoading(true);
        console.log("Attempting to send OTP...");
        const url = getApiUrl("/otp/send-otp");
        console.log("Fetching URL:", url);

        handleModal(
          "Loading...",
          "Please wait while we send the OTP to your email."
        );
        // Send OTP
        const otpRes = await fetch(
          url,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );
        console.log("Fetch response status:", otpRes.status);
        const otpJson = await otpRes.json();

        console.log("OTP Response Data:", otpJson);

        setLoading(false);
        setModalVisible(false); // Hide modal

        if (otpJson.success) {
          setOtp("");
          setShowOtpModal(true);
        } else {
          console.error("OTP send failed:", otpJson.error || otpJson.message);
          Alert.alert("OTP send failed", otpJson.error || otpJson.message || "Please try again");
        }
      } catch (error: any) {
        console.error("OTP Network Error:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setLoading(false);
        setModalVisible(false); // Hide modal
        Alert.alert(
          "OTP network error",
          `Failed to send OTP: ${error.message || "Please check your network connection"}`
        );
      }
    }
  };

  // OTP modal logic
  const handleOtpChange = (text: string, i: number) => {
    if (!/^\d?$/.test(text)) return;
    const arr = otp.split("");
    arr[i] = text;
    setOtp(arr.join("").slice(0, OTP_BOXES));

    if (text.length === 1 && i < OTP_BOXES - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyPress = ({ nativeEvent }: any, i: number) => {
    if (
      nativeEvent.key === "Backspace" &&
      (!otp[i] || otp[i] === "") &&
      i > 0
    ) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const verifyOtpAndRegister = async () => {
    if (otp.length !== OTP_BOXES) {
      Alert.alert("Enter OTP", `Please enter the ${OTP_BOXES}-digit OTP`);
      return;
    }
    setOtpLoading(true);
    handleModal("Verifying OTP", "Please wait while we verify your code.");
    try {
      const res = await fetch(
        getApiUrl("/otp/verify-otp"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const result = await res.json();
      setOtpLoading(false);
      setModalVisible(false); // Hide modal

      if (result.success) {
        setShowOtpModal(false);
        setLoading(true);
        handleModal("Registering", "Creating your account...");
        const regRes = await fetch(
          getApiUrl("/register"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullname: email.split("@")[0],
              email,
              password,
            }),
          }
        );
        const regJson = await regRes.json();

        setLoading(false);
        setModalVisible(false); // Hide modal

        if (regJson.status === "success") {
          handleModal("✅ Registered!", "Account created successfully.");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setShowConfirmPassword(false);
          setRememberMe(false);

          await setToken(regJson.token);
          if (regJson.user) {
            await updateProfile({
              ...regJson.user,
              fullname: regJson.user.fullname || regJson.user.name,
            });
          }

          router.replace("/Verify/Face");
        } else {
          Alert.alert(
            "❌ Registration failed",
            regJson.message || "Please try again"
          );
        }
      } else {
        Alert.alert(
          "OTP Error",
          result.error || "Incorrect OTP, please try again."
        );
      }
    } catch {
      setOtpLoading(false);
      setModalVisible(false); // Hide modal
      Alert.alert("OTP Error", "Unable to verify OTP. Try again.");
    }
  };

  const handleModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  function sendOtp(): void | PromiseLike<void> {
    throw new Error("Function not implemented.");
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          fontFamily: "Poppins_600SemiBold",
          fontSize: 40,
          color: textColor,
        }}
      >
        Create your Account
      </Text>

      <View
        style={{
          marginTop: 20,
          gap: 20,
        }}
      >
        <CustomInput
          placeholder="Email Address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          leftIconName="mail-sharp"
          rightIconName="close-circle"
          onRightIconPress={() => setEmail("")}
          error={emailError}
          isDarkMode={isDarkMode}
          placeholderTextColor={placeholderColor}
          isEditing={true}
        />
        {emailError ? (
          <Text
            style={{
              color: errorTextColor,
              fontSize: 12,
              fontFamily: "Poppins_400Regular",
              marginTop: 4,
            }}
          >
            {emailError}
          </Text>
        ) : null}

        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={handlePasswordChange}
          leftIconName="lock-closed"
          rightIconName={secureTextEntry ? "eye-off-outline" : "eye-outline"}
          secureTextEntry={secureTextEntry}
          onRightIconPress={() => setSecureTextEntry((prev) => !prev)}
          error={passwordError}
          isDarkMode={isDarkMode}
          placeholderTextColor={placeholderColor}
          isEditing={true}
        />

        {/* Password Validation Indicators */}
        {password.length > 0 && (
          <View
            style={{
              marginTop: 8,
              padding: 12,
              backgroundColor: isDarkMode ? "#1a1a1a" : "#f3f4f6",
              borderRadius: 10,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_500Medium",
                fontSize: 13,
                color: isDarkMode ? "#bbb" : "#666",
                marginBottom: 4,
              }}
            >
              Password must contain:
            </Text>

            {/* Minimum Length */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={passwordValidation.minLength ? "checkmark-circle" : "close-circle"}
                size={18}
                color={passwordValidation.minLength ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  color: passwordValidation.minLength
                    ? "#10b981"
                    : isDarkMode ? "#999" : "#6b7280",
                }}
              >
                At least 8 characters
              </Text>
            </View>

            {/* Uppercase */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={passwordValidation.hasUppercase ? "checkmark-circle" : "close-circle"}
                size={18}
                color={passwordValidation.hasUppercase ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  color: passwordValidation.hasUppercase
                    ? "#10b981"
                    : isDarkMode ? "#999" : "#6b7280",
                }}
              >
                One uppercase letter (A-Z)
              </Text>
            </View>

            {/* Lowercase */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={passwordValidation.hasLowercase ? "checkmark-circle" : "close-circle"}
                size={18}
                color={passwordValidation.hasLowercase ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  color: passwordValidation.hasLowercase
                    ? "#10b981"
                    : isDarkMode ? "#999" : "#6b7280",
                }}
              >
                One lowercase letter (a-z)
              </Text>
            </View>

            {/* Number */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={passwordValidation.hasNumber ? "checkmark-circle" : "close-circle"}
                size={18}
                color={passwordValidation.hasNumber ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  color: passwordValidation.hasNumber
                    ? "#10b981"
                    : isDarkMode ? "#999" : "#6b7280",
                }}
              >
                One number (0-9)
              </Text>
            </View>

            {/* Special Character */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={passwordValidation.hasSpecialChar ? "checkmark-circle" : "close-circle"}
                size={18}
                color={passwordValidation.hasSpecialChar ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 12,
                  color: passwordValidation.hasSpecialChar
                    ? "#10b981"
                    : isDarkMode ? "#999" : "#6b7280",
                }}
              >
                One special character (!@#$%^&*)
              </Text>
            </View>
          </View>
        )}

        {showConfirmPassword && (
          <>
            <CustomInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIconName="lock-closed"
              rightIconName={
                confirmSecureTextEntry ? "eye-off-outline" : "eye-outline"
              }
              secureTextEntry={confirmSecureTextEntry}
              onRightIconPress={() =>
                setConfirmSecureTextEntry((prev) => !prev)
              }
              error={confirmError}
              isDarkMode={isDarkMode}
              placeholderTextColor={placeholderColor}
              isEditing={true}
            />
            {confirmError ? (
              <Text
                style={{
                  color: errorTextColor,
                  fontSize: 12,
                  fontFamily: "Poppins_400Regular",
                  marginTop: 4,
                }}
              >
                {confirmError}
              </Text>
            ) : null}
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setRememberMe(!rememberMe)}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            width: 20,
            height: 20,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: "#FF5ACC",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
            backgroundColor: rememberMe ? "#FF5ACC" : "transparent",
          }}
        >
          {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
        </TouchableOpacity>
        <Text
          style={{
            color: textColor,
            fontFamily: "Poppins_600SemiBold",
          }}
        >
          Remember me
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log("SignUp Button Pressed - calling handleSignUpClick");
          handleSignUpClick();
        }}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#FF5ACC", // Visual feedback for disabled state
          borderRadius: 9999,
          paddingVertical: 16,
          marginTop: 20,
          justifyContent: "center",
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            color: "#fff",
            fontSize: 16,
          }}
        >
          {loading ? "Please wait..." : (showConfirmPassword ? "Submit" : "Sign up")}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          width: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: isDarkMode ? "#555" : "#d1d5db",
          }}
        />
        <Text
          style={{
            marginHorizontal: 10,
            color: isDarkMode ? "#bbb" : "#6b7280",
            fontFamily: "Poppins_500Medium",
            fontSize: 16,
          }}
        >
          or continue with
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: isDarkMode ? "#555" : "#d1d5db",
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 40,
          marginTop: 10,
        }}
      >
        <FacebookLogin
          onLoginSuccess={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
          images={images}
          isDarkMode={isDarkMode}
          size="small"
        />

        <GoogleLogin
          onLoginSuccess={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
          images={images}
          isDarkMode={isDarkMode}
          size="small"
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: isDarkMode ? "#999" : "#9ca3af",
            fontFamily: "Poppins_400Regular",
            fontSize: 14,
          }}
        >
          Already have an account?
        </Text>
        <TouchableOpacity onPress={() => router.push("/Auth/Login")}>
          <Text
            style={{
              color: "#FF5ACC",
              fontFamily: "Poppins_400Regular",
              fontSize: 14,
            }}
            className="underline"
          >
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={showOtpModal}
        statusBarTranslucent
        transparent
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.otpTitle}>Check your email</Text>
            <Text style={styles.otpDesc}>
              Enter the verification code sent to {"\n"}
              <Text style={styles.otpEmail}>{email}</Text>
            </Text>
            <View style={styles.otpBoxes}>
              {Array.from({ length: OTP_BOXES }).map((_, i) => (
                <View key={i}>
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[i] = ref;
                    }}
                    value={otp[i] || ""}
                    keyboardType="number-pad"
                    maxLength={1}
                    onChangeText={(text) => handleOtpChange(text, i)}
                    onKeyPress={(e) => handleOtpKeyPress(e, i)}
                    style={[
                      styles.otpInput,
                      otp.length === i && { borderColor: "#3573f0" },
                    ]}
                    autoFocus={i === 0}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.otpResend}>
              Didn’t get a code?{" "}
              <Text
                style={{ color: "#ff5acc", textDecorationLine: "underline" }}
                onPress={async () => await sendOtp()}
              >
                resend
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={verifyOtpAndRegister}
              disabled={otpLoading}
            >
              <Text style={styles.verifyButtonText}>Verify email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => {
          if (!loading) setModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              alignItems: "center",
            }}
          >
            {/* Image at top */}

            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 12,
                color: isDarkMode ? "#eee" : "#222",
                textAlign: "center",
              }}
            >
              {modalTitle}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
                marginBottom: 20,
                color: isDarkMode ? "#ccc" : "#444",
              }}
            >
              {modalMessage}
            </Text>

            {loading && (
              <Chase size={50} color="#FF5ACC" style={{ marginBottom: 12 }} />
            )}

            {!loading && (
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: "#FF5ACC",
                  borderRadius: 25,
                  paddingVertical: 12,
                  paddingHorizontal: 36,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: { gap: 18 },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 6,
    backgroundColor: "#f9f9f9",
  },
  errorText: { color: "#f87171", fontSize: 13, marginBottom: 4 },
  signUpButton: {
    backgroundColor: "#3573f0",
    borderRadius: 9999,
    paddingVertical: 15,
    marginTop: 18,
    alignItems: "center",
  },
  signUpText: { color: "#fff", fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    width: "90%",
    alignItems: "center",
    elevation: 6,
  },
  otpTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    marginBottom: 18,
  },
  otpDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 17,
    color: "#444",
    marginBottom: 8,
    textAlign: "center",
  },
  otpEmail: {
    fontFamily: "Poppins_600SemiBold",
    color: "#ff5acc",
  },
  otpBoxes: {
    flexDirection: "row",
    marginVertical: 22,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderColor: "#ff5acc",
    marginHorizontal: 5,
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
    marginBottom: 16,
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#ff5acc",
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

export default SignUp;
