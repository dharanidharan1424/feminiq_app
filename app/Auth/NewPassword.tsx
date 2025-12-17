import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "@/components/CustomInput";
import { useAuth } from "../../context/UserContext";
import { Chase } from "react-native-animated-spinkit"; // or your spinner

const NewPassword = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const { isDarkMode } = useAuth();
  // MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    let valid = true;
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }
    return valid;
  };

  const showModal = (title: any, message: any, loading = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsLoading(loading);
    setModalVisible(true);
  };

  const handleLoginClick = async () => {
    if (!validateInputs()) {
      return;
    }
    if (!email) {
      showModal("Missing Information", "Email not found in route params.");
      return;
    }
    showModal("Resetting Password", "Processing your request...", true);

    try {
      const res = await fetch(
        "https://feminiq-backend.onrender.com/pass/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, new_password: password }),
        }
      );
      const result = await res.json();
      setIsLoading(false);
      if (result.status === "success") {
        showModal("Success", "Your password has been updated.");
        setTimeout(() => {
          setModalVisible(false);
          router.replace("/Auth/Login");
        }, 1200);
      } else {
        showModal(
          "Error",
          result.message || "Unable to reset password. Try again."
        );
      }
    } catch (error) {
      setIsLoading(false);
      showModal("Error", "An error occurred. Please try again.");
    }
  };

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#000";
  const placeholderColor = isDarkMode ? "#bbb" : "#999";
  const errorTextColor = "#f87171";

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 52,
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
        Create New Password
      </Text>

      <View style={{ marginTop: 50, gap: 20 }}>
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

        <CustomInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          leftIconName="lock-closed"
          rightIconName={secureTextEntry ? "eye-off-outline" : "eye-outline"}
          secureTextEntry={secureTextEntry}
          onRightIconPress={() => setSecureTextEntry((prev) => !prev)}
          error={confirmPasswordError}
          isDarkMode={isDarkMode}
          placeholderTextColor={placeholderColor}
        />
        {confirmPasswordError ? (
          <Text
            style={{
              color: errorTextColor,
              fontSize: 12,
              fontFamily: "Poppins_400Regular",
              marginTop: 4,
            }}
          >
            {confirmPasswordError}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => setRememberMe((prev) => !prev)}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <View
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
        </View>
        <Text style={{ color: textColor, fontFamily: "Poppins_600SemiBold" }}>
          Remember me
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#FF5ACC",
          borderRadius: 9999,
          paddingVertical: 16,
          marginTop: 20,
        }}
        onPress={handleLoginClick}
        disabled={isLoading}
      >
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            textAlign: "center",
            color: "#fff",
            fontSize: 16,
          }}
        >
          Continue
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => {
          if (!isLoading) setModalVisible(false);
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
            {isLoading && (
              <Chase size={50} color="#FF5ACC" style={{ marginBottom: 12 }} />
            )}
            {!isLoading && (
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

export default NewPassword;
