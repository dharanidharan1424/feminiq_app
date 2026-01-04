import React, { useEffect, useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Chase } from "react-native-animated-spinkit";
import { AccessToken, LoginManager, Settings } from "react-native-fbsdk-next";

type Props = {
  onLoginSuccess: (user: any, token: string) => void;
  onLoginFailure: (errorMessage: string) => void;
  images: any;
  isDarkMode: boolean;
  size?: string;
};

const FacebookLogin: React.FC<Props> = ({
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

  useEffect(() => {
    try {
      Settings.initializeSDK();
    } catch (error) {
      console.warn("Facebook SDK initialization failed:", error);
      // SDK not available, but app should still load
    }
  }, []);


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

  const handleFacebookSignIn = async () => {
    handleModal("loading", "Signing in with Facebook...", "Please wait");
    try {
      const loginResult = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (loginResult.isCancelled) {
        handleModal("error", "Cancelled", "Facebook login was cancelled");
        onLoginFailure("Facebook login was cancelled");
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) throw new Error("Failed to get Facebook access token");

      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${data.accessToken}&fields=id,name,email`
      );
      const userInfo = await response.json();

      if (!userInfo.email) throw new Error("Email permission is required");

      // 🔹 backend OAuth login
      const backendRes = await fetch(
        "https://femiiniq-backend.onrender.com/login/oauth-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInfo.email,
            fullname: userInfo.name,
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
    } catch (error: any) {
      handleModal("error", "Error", error.message || "Facebook login failed");
      onLoginFailure(error.message || "Facebook login failed");
    }
  };

  return (
    <>
      {/* Facebook Button */}
      <TouchableOpacity
        onPress={handleFacebookSignIn}
        style={{
          borderWidth: 1,
          borderColor: buttonBorder,
          borderRadius: 12,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center", // center if small
        }}
      >
        <Image
          source={images.facebook_icon}
          style={{
            width: 20,
            height: 20,
            marginRight: size === "small" ? 0 : 8,
          }}
        />
        {size === "small" ? null : (
          <Text
            className="font-poppins-semibold mt-1"
            style={{ color: isDarkMode ? "#eee" : "#000" }}
          >
            Continue with Facebook
          </Text>
        )}
      </TouchableOpacity>

      {/* 🔹 Unified Modal */}
      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-[#222] p-6 rounded-2xl items-center w-72">
            {modalType === "loading" ? (
              <>
                <Chase size={50} color={primaryColor} />
                <Text
                  className="mt-4 font-poppins-medium text-base"
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

export default FacebookLogin;
