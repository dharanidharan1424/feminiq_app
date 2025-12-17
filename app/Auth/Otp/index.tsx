import OtpScreen from "@/screens/OtpScreen";
import React from "react";
import { View } from "react-native";
import { useGlobalSearchParams } from "expo-router";

const Index = () => {
  const params = useGlobalSearchParams();

  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const mobile = Array.isArray(params.mobile)
    ? params.mobile[0]
    : params.mobile;
  const type = Array.isArray(params.type) ? params.type[0] : params.type; // "forgot-password" or "verify-account"

  return (
    <View className="flex-1">
      <OtpScreen email={email} mobile={mobile} type={type} />
    </View>
  );
};

export default Index;
