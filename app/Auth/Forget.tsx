import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants";
// Import your loading spinner, e.g. Chase from "react-native-animated-spinkit"
import { Chase } from "react-native-animated-spinkit"; // adjust path as needed

const ForgetPassword = ({ isDarkMode = false }) => {
  const [useEmail, setUseEmail] = useState(true); // true: email input, false: mobile input
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

  const handleContinue = async () => {
    if (!inputValue.trim()) {
      setModalTitle("Input Required");
      setModalMessage(
        useEmail
          ? "Please enter your email address."
          : "Please enter your mobile number."
      );
      setModalVisible(true);
      return;
    }
    setLoading(true);
    setModalTitle("Please wait");
    setModalMessage("Sending OTP...");
    setModalVisible(true);

    try {
      const body = useEmail ? { email: inputValue } : { mobile: inputValue };
      const res = await fetch(
        "https://feminiq-backend.onrender.com/otp/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const result = await res.json();
      setLoading(false);
      if (result.success) {
        setModalVisible(false);
        router.push({
          pathname: "/Auth/Otp",
          params: useEmail
            ? { email: inputValue, type: "forgot-password" }
            : { mobile: inputValue, type: "forgot-password" },
        });
      } else {
        setModalTitle("Error");
        setModalMessage(result.error || "Unable to send OTP.");
        setModalVisible(true);
      }
    } catch (err) {
      setLoading(false);
      setModalTitle("Error");
      setModalMessage("An error occurred. Please try again.");
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: "#fff",
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: 40,
            color: "#000",
          }}
        >
          Forgot Password
        </Text>
        <View
          style={{
            flex: 1,
            marginTop: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={images.forget_pass}
            style={{ width: 240, height: 240 }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            color: "#000",
          }}
        >
          Enter your {useEmail ? "email address" : "mobile number"} to receive
          an OTP
        </Text>
        <TextInput
          placeholder={useEmail ? "Email Address" : "Mobile Number"}
          autoCapitalize="none"
          keyboardType={useEmail ? "email-address" : "phone-pad"}
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#FF5ACC",
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            color: "#000",
            backgroundColor: "rgba(255, 90, 204, 0.1)",
            fontFamily: "Poppins_400Regular",
          }}
          value={inputValue}
          onChangeText={setInputValue}
        />

        <TouchableOpacity
          onPress={() => {
            setUseEmail(!useEmail);
            setInputValue("");
          }}
          style={{
            marginTop: 12,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#FF5ACC", fontFamily: "Poppins_500Medium" }}>
            Use {useEmail ? "Mobile Number Instead " : "Email Instead "}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={loading}
          style={{
            backgroundColor: "#FF5ACC",
            borderRadius: 9999,
            paddingVertical: 16,
            marginTop: 20,
            justifyContent: "center",
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
            {loading ? "Sending..." : "Continue"}
          </Text>
        </TouchableOpacity>

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
    </KeyboardAvoidingView>
  );
};

export default ForgetPassword;
