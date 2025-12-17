/* eslint-disable react-hooks/rules-of-hooks */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/UserContext";
import { router } from "expo-router";

type ProfileMenuProps = {
  icon: React.ReactNode;
  text: string;
  rightText?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  isDarkMode: boolean;
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  icon,
  text,
  rightText,
  rightComponent,
  onPress,
  isDarkMode,
}) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress}>
    <View style={{ flexDirection: "row" }}>
      {icon}
      <Text style={[styles.menuText, { color: isDarkMode ? "#fff" : "#222" }]}>
        {text}
      </Text>
    </View>
    {rightText ? (
      <Text
        style={[styles.menuRightText, { color: isDarkMode ? "#fff" : "#888" }]}
      >
        {rightText}
      </Text>
    ) : rightComponent ? (
      rightComponent
    ) : (
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDarkMode ? "#fff" : "#bbb"}
      />
    )}
  </TouchableOpacity>
);

const index = () => {
  const { isDarkMode } = useAuth();
  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView>
        <View className="flex-row items-center gap-4 py-4 px-3 border-b border-gray-200">
          <Ionicons
            name="arrow-back"
            size={20}
            color={"#000"}
            onPress={() => router.push("/Tabs/Profile")}
          />
          <Text className="text-2xl font-poppins-semibold text-gray-800 dark:text-white">
            Policies
          </Text>
        </View>
        <View className="mb-4 px-3">
          <ProfileMenu
            icon={
              <MaterialIcons
                name="privacy-tip"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Privacy Policy"
            onPress={() => router.push("/Policies/PrivacyPolicy")}
            isDarkMode={isDarkMode}
          />

          <ProfileMenu
            icon={
              <MaterialIcons
                name="gavel"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Terms & Conditions"
            onPress={() => router.push("/Policies/Terms")}
            isDarkMode={isDarkMode}
          />

          <ProfileMenu
            icon={
              <MaterialIcons
                name="cancel"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Cancellation & Refund"
            onPress={() => router.push("/Policies/Cancellation")}
            isDarkMode={isDarkMode}
          />

          <ProfileMenu
            icon={
              <MaterialIcons
                name="security"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Payment Fraud Policy"
            onPress={() => router.push("/Policies/PaymentFraud")}
            isDarkMode={isDarkMode}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  iconCircle: {
    backgroundColor: "#e75486",
    borderRadius: 16,
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
    textAlign: "center",
  },
  avatarContainer: { position: "relative", marginTop: 15 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#FF5ACC",
    borderRadius: 100,
    padding: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  fullName: { fontFamily: "Poppins_600SemiBold", fontSize: 20, color: "#222" },
  email: {
    fontSize: 15,
    color: "#888",
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  menuList: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
    paddingHorizontal: 4,
  },
  menuText: { fontSize: 16, marginLeft: 12, fontFamily: "Poppins_400Regular" },
  menuRightText: {
    color: "#888",
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    marginTop: 30,
    marginBottom: 20,
  },
  logoutText: {
    color: "#FF000D",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  deleteText: {
    color: "#FF000D",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    opacity: 0.82,
  },
  modalContent: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20, // Adjusted for center modal
  },
  modalImage: {
    width: 200,
    height: 150,
    marginBottom: 16,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
    color: "#FF000D",
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#444",
    textAlign: "center",
    marginBottom: 30,
  },
  modalButtonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f3d6e6",
  },
  cancelButtonText: {
    color: "#FF5ACC",
    fontFamily: "Poppins_600SemiBold",
  },
  logoutButton: {
    backgroundColor: "#FF5ACC",
  },
  logoutButtonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
  },
  deleteTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
    color: "#FF000D",
    textAlign: "center",
  },
  deleteMessage: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#444",
    textAlign: "left",
    marginBottom: 10,
  },
});
