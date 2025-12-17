import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartBadge from "./Badges/CartBadge";
import NotificationBadge from "./Badges/NotificationBadge";

const Header = () => {
  const { isDarkMode, token, profile } = useAuth();

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-row justify-between items-center pt-1 pb-2  px-4 border-b border-gray-200"
      style={{ backgroundColor: isDarkMode ? "#222" : "white" }}
    >
      <TouchableOpacity
        onPress={() => router.push("/Tabs")}
        className="flex-row gap-2 items-center"
      >
        <View className="rounded-xl w-10 h-10 items-center justify-center">
          <Image
            source={images.logo}
            className="size-8 rounded-lg"
            resizeMode={"center"}
          />
        </View>
        <Text
          className="font-poppins-semibold text-3xl"
          style={{ color: isDarkMode ? "#eee" : "#000" }}
        >
          feminiq
        </Text>
      </TouchableOpacity>

      <View className="flex-row gap-5">
        <TouchableOpacity onPress={() => router.push("/Blogs")}>
          <FontAwesome5
            name="blog"
            size={20}
            color={isDarkMode ? "#fff" : "black"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/Bookmarks")}>
          <Ionicons
            name="bookmark-outline"
            size={25}
            color={isDarkMode ? "#fff" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/Cart")}>
          <CartBadge token={token} isDarkMode={isDarkMode} />
          <MaterialCommunityIcons
            name="cart"
            size={25}
            color={isDarkMode ? "#fff" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/Notifications")}>
          <NotificationBadge
            userId={Number(profile?.id)}
            isDarkMode={isDarkMode}
          />
          <MaterialCommunityIcons
            name="bell-outline"
            size={25}
            color={isDarkMode ? "#fff" : "black"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;
