import Header from "@/components/Header";
import { useAuth } from "@/context/UserContext";
import { Entypo, Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

const _layout = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isDarkMode } = useAuth();

  return (
    <>
      <Header />
      <StatusBar
        translucent={true} // Makes the status bar translucent
        backgroundColor="transparent" // Sets background transparent
        barStyle="dark-content" // or "light-content" based on your theme
      />
      <Tabs
        screenOptions={({ route }) => {
          const activeColor = "#FF5ACC";
          const inactiveColor = isDarkMode ? "#888" : "gray";
          const tabBarLabelStyle = {
            fontFamily: "Poppins_600SemiBold",
          };

          return {
            tabBarIcon: ({ focused, size }) => {
              if (route.name === "index") {
                return (
                  <Octicons
                    name="home"
                    size={size}
                    color={focused ? activeColor : inactiveColor}
                  />
                );
              } else if (route.name === "Explore") {
                return (
                  <MaterialIcons
                    name="explore"
                    size={size}
                    color={focused ? activeColor : inactiveColor}
                  />
                );
              } else if (route.name === "Booking") {
                return (
                  <Ionicons
                    name={focused ? "reader" : "reader-outline"}
                    size={size}
                    color={focused ? activeColor : inactiveColor}
                  />
                );
              } else if (route.name === "Inbox") {
                return (
                  <Ionicons
                    name={
                      focused
                        ? "chatbubble-ellipses"
                        : "chatbubble-ellipses-outline"
                    }
                    size={size}
                    color={focused ? activeColor : inactiveColor}
                  />
                );
              } else if (route.name === "Profile") {
                return (
                  <Entypo
                    name="user"
                    size={size}
                    color={focused ? activeColor : inactiveColor}
                  />
                );
              } else {
                return (
                  <MaterialIcons
                    name="help-outline"
                    size={size}
                    color={inactiveColor}
                  />
                );
              }
            },
            tabBarLabel:
              route.name === "index"
                ? "Home"
                : route.name.charAt(0).toUpperCase() + route.name.slice(1),
            tabBarLabelStyle,
            tabBarActiveTintColor: activeColor,
            tabBarInactiveTintColor: inactiveColor,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDarkMode ? "#222" : "white",
              borderTopColor: isDarkMode ? "#444" : "#ddd",
            },
          };
        }}
      >
        {/* 👇 Order matters here */}
        <Tabs.Screen name="index" />
        <Tabs.Screen name="Explore" />
        <Tabs.Screen name="Booking" />
        <Tabs.Screen name="Inbox" />
        <Tabs.Screen name="Profile" />
      </Tabs>
    </>
  );
};

export default _layout;
