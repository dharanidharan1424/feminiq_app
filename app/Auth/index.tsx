import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import GoogleLogin from "@/components/Auth/GoogleLogin";
import FacebookLogin from "@/components/Auth/FacebookLogin";

const Index = () => {
  const { isDarkMode, setToken, updateProfile } = useAuth();

  const backgroundColor = isDarkMode ? "#222" : "white";
  const textColor = isDarkMode ? "#eee" : "#000";
  const dividerColor = isDarkMode ? "#555" : "#d1d5db";
  const secondaryTextColor = isDarkMode ? "#999" : "#6b7280";
  const primaryColor = "#FF5ACC";
  const buttonBackground = isDarkMode ? "#FF5ACC" : "#ff5acc";

  const handleLoginSuccess = async (user: any, token: string) => {
    await setToken(token);
    if (user) await updateProfile(user);

    router.push("/Tabs");
  };

  const handleLoginFailure = (errorMessage: string) => {
    console.log("Login Failed: ", errorMessage);
  };

  return (
    <>
      <SafeAreaView
        className="flex-1"
        style={{ paddingBottom: 10, paddingHorizontal: 20, backgroundColor }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor }}
          >
            <Image
              source={images.login}
              className="size-64"
              resizeMode="contain"
            />

            <Text
              className="mt-5 font-poppins-semibold text-5xl text-center"
              style={{ color: textColor }}
            >
              Let&apos;s you in
            </Text>

            {/* Social Buttons */}
            <View className="mt-10 w-full" style={{ gap: 16 }}>
              <FacebookLogin
                onLoginSuccess={handleLoginSuccess}
                onLoginFailure={handleLoginFailure}
                images={images}
                isDarkMode={isDarkMode}
              />
              <GoogleLogin
                onLoginSuccess={handleLoginSuccess}
                onLoginFailure={handleLoginFailure}
                images={images}
                isDarkMode={isDarkMode}
              />
            </View>

            {/* Divider */}
            <View
              className="flex-row items-center my-5 w-full"
              style={{ borderBottomColor: dividerColor, borderBottomWidth: 1 }}
            >
              <View className="flex-1 h-px" />
              <Text
                className="mx-3 font-poppins-medium text-base"
                style={{ color: secondaryTextColor }}
              >
                or
              </Text>
              <View className="flex-1 h-px" />
            </View>

            {/* Password Login */}
            <TouchableOpacity
              className="w-full py-4 rounded-3xl"
              style={{ backgroundColor: buttonBackground }}
              onPress={() => router.push("/Auth/Login")}
            >
              <Text
                className="font-poppins-semibold text-base text-center"
                style={{ color: "#fff" }}
              >
                Sign in with password
              </Text>
            </TouchableOpacity>

            {/* Sign up */}
            <View className="my-5 flex-row gap-2">
              <Text
                className="font-poppins-regular text-sm"
                style={{ color: isDarkMode ? "#999" : "#9ca3af" }}
              >
                Don&apos;t have an account?{" "}
              </Text>
              <Text
                className="font-poppins-regular text-sm underline"
                style={{ color: primaryColor }}
                onPress={() => router.push("/Auth/SignUp")}
              >
                Sign up
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Shared Modal */}
    </>
  );
};

export default Index;
