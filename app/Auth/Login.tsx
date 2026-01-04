import CustomInput from "@/components/CustomInput";
import { images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import FacebookLogin from "@/components/Auth/FacebookLogin";
import GoogleLogin from "@/components/Auth/GoogleLogin";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Chase } from "react-native-animated-spinkit";
import { useAuth } from "../../context/UserContext";

const Login = () => {
  const { setToken, updateProfile, isDarkMode } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLoginClick = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }
    setLoading(true);
    handleModal("Loading...", "Please wait while we log you in.");
    try {
      const response = await fetch(
        "https://femiiniq-backend.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      const json = await response.json();

      if (json.status === "success" && json.token) {
        handleModal("Success", "Logged in successfully");

        await setToken(json.token);

        if (json.user) {
          await updateProfile({
            ...json.user,
            fullname: json.user.fullname || json.user.name,
          });
        }

        router.push("/Tabs");
      } else {
        handleModal("Login Failed", json.message || "Invalid credentials");

      }
    } catch (error) {
      console.error("Login fetch error:", error);
      handleModal("Error", "Network error, please check your connection");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (user: any, token: string) => {
    await setToken(token);
    if (user) await updateProfile(user);

    router.push("/Tabs");
  };

  const handleLoginFailure = (errorMessage: string) => {
    console.log("Login Failed: ", errorMessage);
  };

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#000";
  const placeholderColor = isDarkMode ? "#bbb" : "#999";
  const errorTextColor = "#f87171"; // Tailwind red-400

  return (
    <>
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
          Login to your Account
        </Text>

        <View style={{ marginTop: 20, gap: 20 }}>
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
            onChangeText={setPassword}
            leftIconName="lock-closed"
            rightIconName={secureTextEntry ? "eye-off-outline" : "eye-outline"}
            secureTextEntry={secureTextEntry}
            onRightIconPress={() => setSecureTextEntry((prev) => !prev)}
            error={passwordError}
            isDarkMode={isDarkMode}
            placeholderTextColor={placeholderColor}
            isEditing={true}
          />
          {passwordError ? (
            <Text
              style={{
                color: errorTextColor,
                fontSize: 12,
                fontFamily: "Poppins_400Regular",
                marginTop: 4,
              }}
            >
              {passwordError}
            </Text>
          ) : null}
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
          style={{
            backgroundColor: "#FF5ACC",
            borderRadius: 9999,
            paddingVertical: 16,
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => handleLoginClick(email, password)}
          disabled={loading}
        >
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              color: "#fff",
              fontSize: 16,
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push("/Auth/Forget");
          }}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#FF5ACC",
              fontFamily: "Poppins_400Regular",
              fontSize: 14,
            }}
          >
            Forget the password?
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 20,
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
            marginTop: 20,
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

          {/* <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: isDarkMode ? "#555" : "#d1d5db",
              borderRadius: 16,
              padding: 15,
            }}
          >
            <Image
              source={images.apple_icon}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity> */}
        </View>

        {/* Go to Signup */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 40,
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
            Don&apos;t have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/Auth/SignUp")}>
            <Text
              style={{
                color: "#FF5ACC",
                fontFamily: "Poppins_400Regular",
                fontSize: 14,
              }}
              className="underline"
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Other UI elements omitted for brevity */}
      </ScrollView>

      {/* Modal for messages and loading */}
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
    </>
  );
};

export default Login;
