import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Chase } from "react-native-animated-spinkit"; // adjust import if needed

const OTP_BOXES = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange }) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, i: number) => {
    if (!/^\d?$/.test(text)) return;

    const arr = value.split("");
    arr[i] = text;
    const newValue = arr.join("").slice(0, OTP_BOXES);
    onChange(newValue);

    if (text.length === 1 && i < OTP_BOXES - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: any }, i: number) => {
    if (
      nativeEvent.key === "Backspace" &&
      (!value[i] || value[i] === "") &&
      i > 0
    ) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      {Array.from({ length: OTP_BOXES }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => (inputRefs.current[i] = ref)}
          value={value[i] || ""}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleChangeText(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          style={{
            width: 50,
            height: 55,
            marginHorizontal: 5,
            borderRadius: 10,
            borderWidth: value.length === i ? 2 : 1,
            borderColor: value.length === i ? "#FF5ACC" : "#E6E6E6",
            backgroundColor: "#F9F9F9",
            textAlign: "center",
            fontSize: 20,
          }}
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

type OtpScreenProps = {
  email?: string;
  mobile?: string;
  type?: string;
  isDarkMode?: boolean;
};

const OtpScreen: React.FC<OtpScreenProps> = ({
  email,
  mobile,
  type,
  isDarkMode = false,
}) => {
  const router = useRouter();
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showModal = (title: string, message: string, loading = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsLoading(loading);
    setModalVisible(true);
  };

  const verifyOtp = async () => {
    if (enteredOtp.length !== OTP_BOXES) {
      showModal("Enter OTP", `Please enter the ${OTP_BOXES}-digit OTP`, false);
      return;
    }
    showModal("Verifying", "Verifying your OTP...", true);
    try {
      const res = await fetch(
        "https://feminiq-backend.onrender.com/otp/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, mobile, otp: enteredOtp }),
        }
      );
      const result = await res.json();
      setIsLoading(false);
      if (result.success) {
        setModalVisible(false);
        if (type === "forgot-password") {
          router.replace({ pathname: "/Auth/NewPassword", params: { email } });
        } else if (type === "verify-account") {
          router.replace("/Verify/Face");
        }
      } else {
        showModal(
          "Error",
          result.error || "Incorrect OTP, please try again.",
          false
        );
      }
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      showModal("Error", "Unable to verify. Try again.", false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          marginBottom: 20,
          textAlign: "center",
          fontFamily: "Poppins_400Regular",
          color: "#121212",
        }}
      >
        Code has been sent to {email || mobile}
      </Text>
      <OtpInput value={enteredOtp} onChange={setEnteredOtp} />
      <TouchableOpacity
        onPress={verifyOtp}
        disabled={isLoading}
        style={{
          backgroundColor: "#ff69b4",
          padding: 15,
          borderRadius: 25,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            color: "white",
            fontSize: 16,
          }}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
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
    </View>
  );
};

export default OtpScreen;
