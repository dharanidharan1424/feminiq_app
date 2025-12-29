/* eslint-disable react-hooks/rules-of-hooks */
import { Slot } from "expo-router";
import { View } from "react-native";
import "../../globals.css";

const _layout = () => {
  return (
    <View className="flex-1">
      <Slot />
    </View>
  );
};

export default _layout;
