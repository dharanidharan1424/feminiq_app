import React, { useState } from "react";
import { TouchableOpacity, Text, Image, Modal, View } from "react-native";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Chase } from "react-native-animated-spinkit";

type Props = {
  onLoginSuccess: (user: any, token: string) => void;
  onLoginFailure: (errorMessage: string) => void;
  images: any;
  isDarkMode: boolean;
  size?: string;
};

GoogleSignin.configure({
  webClientId: "",
});

const GoogleLogin: React.FC<Props> = ({
  onLoginSuccess,
  onLoginFailure,
  images,
  isDarkMode,
  size,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const primaryColor = "#FF5ACC";
  const buttonBorder = isDarkMode ? "#555" : "#d1d5db";

  const handleModal = (
    type: "loading" | "success" | "error",
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleGoogleSignIn = async () => {
    handleModal("loading", "Signing in with Google...", "Please wait");
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { user } = response.data;

        // 🔹 backend OAuth login
        const backendRes = await fetch(
          "https://feminiq-backend.onrender.com/login/oauth-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              fullname: user.name,
            }),
            credentials: "include",
          }
        );
        const backendJson = await backendRes.json();

        if (backendJson.status === "success" && backendJson.token) {
          handleModal("success", "Success", "Logged in successfully");
          onLoginSuccess(backendJson.user, backendJson.token);
        } else {
          handleModal(
            "error",
            "Error",
            backendJson.message || "OAuth login failed"
          );
          onLoginFailure(backendJson.message || "OAuth login failed");
        }
      } else {
        handleModal("error", "Error", "Google Sign-In failed");
        onLoginFailure("Google Sign-In failed");
      }
    } catch (error: any) {
      handleModal("error", "Error", error.message || "Google login failed");
      onLoginFailure(error.message || "Google login failed");
    }
  };

  return (
    <>
      {/* Google Button */}
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        style={{
          borderWidth: 1,
          borderColor: buttonBorder,
          borderRadius: 12,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={images.google_icon}
          style={{
            width: 20,
            height: 20,
            marginRight: size === "small" ? 0 : 8,
          }}
        />
        {size === "small" ? null : (
          <Text
            className="font-poppins-semibold"
            style={{ color: isDarkMode ? "#eee" : "#000" }}
          >
            Continue with Google
          </Text>
        )}
      </TouchableOpacity>

      {/* 🔹 Unified Modal (loading/success/error) */}
      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-[#222] p-8 rounded-2xl items-center w-72">
            {modalType === "loading" ? (
              <>
                <Chase size={50} color={primaryColor} />
                <Text
                  className="mt-4 font-poppins-medium text-lg"
                  style={{ color: isDarkMode ? "#eee" : "#000" }}
                >
                  {modalTitle}
                </Text>
                <Text
                  className="font-poppins-regular text-sm text-center mt-1"
                  style={{ color: isDarkMode ? "#ccc" : "#444" }}
                >
                  {modalMessage}
                </Text>
              </>
            ) : (
              <>
                <Text
                  className="font-poppins-semibold text-xl mb-2"
                  style={{ color: isDarkMode ? "#eee" : "#000" }}
                >
                  {modalTitle}
                </Text>
                <Text
                  className="font-poppins-regular text-base text-center"
                  style={{ color: isDarkMode ? "#ccc" : "#444" }}
                >
                  {modalMessage}
                </Text>
                <TouchableOpacity
                  className="mt-4 px-5 py-2 rounded-xl"
                  style={{ backgroundColor: primaryColor }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-poppins-medium">OK</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default GoogleLogin;
