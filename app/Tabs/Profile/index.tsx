import { useAuth } from "@/context/UserContext";
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Chase } from "react-native-animated-spinkit";
import Modal from "react-native-modal";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
// Import the new component
import DeleteAccountModal from "@/components/Profile/DeleteAccountModal"; // Adjust path as needed

// --- Component Definition for ProfileMenu (remains the same) ---
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

// --- Deletion Reasons (moved here for passing to the modal) ---
const deleteReasons = [
  "No Longer Needed",
  "Found a Better Alternative",
  "The App contains too many Ads",
  "Privacy Concerns",
  "Not Enough Providers/Services",
  "Poor User Experience",
  "Lack of Features",
  "Dissatisfied with Service Providers",
  "Others", // Important: must be the last element
];

// --- ProfileScreen Component ---

const ProfileScreen: React.FC = () => {
  const { profile, language, setIsDarkMode, isDarkMode, logout } = useAuth();

  // --- DELETE MODAL STATE ---
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const toggleDeleteModal = useCallback(() => {
    setDeleteModalVisible((prev) => !prev);
  }, []);

  // --- LOGOUT MODAL STATE ---
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  // Stages: "confirm" | "loading" | "success" (using only these for the simple logout modal)
  const [logoutModalStage, setLogoutModalStage] = useState<
    "confirm" | "loading" | "success"
  >("confirm");

  const toggleLogoutModal = useCallback(() => {
    if (logoutModalStage === "loading") return;
    setLogoutModalVisible((prev) => !prev);
    if (!isLogoutModalVisible) setLogoutModalStage("confirm");
  }, [isLogoutModalVisible, logoutModalStage]);

  // --- LOGOUT HANDLER (Modified to use the new state) ---
  const handleLogout = async () => {
    setLogoutModalStage("loading");

    try {
      // Google Signout logic
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
      }

      // Backend logout call
      await fetch("https://feminiq-backend.onrender.com/logout", {
        method: "POST",
      });

      logout(); // Your app logout function

      setLogoutModalStage("success");

      setTimeout(() => {
        setLogoutModalVisible(false);
        setLogoutModalStage("confirm");
        router.replace("/Auth");
      }, 2000);
    } catch (error: any) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Logout failed. Try again.");
      setLogoutModalStage("confirm");
    }
  };

  // --- DELETE HANDLER (Logic passed to DeleteAccountModal) ---
  const handleDeleteAccount = async (
    reasons: string[],
    otherReason: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        "https://feminiq-backend.onrender.com/delete-profile",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fullname: profile?.fullname,
            mobile: profile?.mobile,
            address: profile?.address,
            reason: reasons.join(", "),
            extrareason: otherReason,
            unique_id: profile?.unique_id,
          }),
        }
      );

      const json = await response.json();

      if (json.status === "success") {
        logout();
        return null;
      } else {
        return json.message || "Failed to delete account.";
      }
    } catch (error: any) {
      console.error("Delete account error:", error);
      return "Network error, please try again.";
    }
  };

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev: any) => !prev);
  }, [setIsDarkMode]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#222" : "#fff" },
        ]}
      >
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <View style={styles.avatarContainer}>
            {profile?.image ? (
              <Image source={{ uri: profile.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="people" size={32} color="#666" />
              </View>
            )}
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <Text
              style={[styles.fullName, { color: isDarkMode ? "#eee" : "#222" }]}
            >
              {profile?.fullname ?? "Unknown User"}
            </Text>
          </View>
          <Text style={[styles.email, { color: isDarkMode ? "#bbb" : "#888" }]}>
            {profile?.email ?? "unknown@yourdomain.com"}
          </Text>
        </View>

        <View
          style={[
            styles.menuList,
            { backgroundColor: isDarkMode ? "#222" : "#fff" },
          ]}
        >
          {/* ... Profile Menu items (unchanged) ... */}
          <ProfileMenu
            icon={
              <Ionicons
                name="person-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            isDarkMode={isDarkMode}
            text="Edit Profile"
            onPress={() => router.push("/Tabs/Profile/Update")}
          />
          <ProfileMenu
            icon={
              <MaterialIcons
                name="star-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Reviews"
            onPress={() => router.push("/Tabs/Profile/Reviews")}
            isDarkMode={isDarkMode}
          />

          <ProfileMenu
            icon={
              <Ionicons
                name="notifications-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Notification"
            onPress={() => router.push("/Tabs/Profile/Notification")}
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <FontAwesome5
                name="credit-card"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Payment"
            onPress={() => router.push("/Tabs/Profile/Payment")}
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <Feather
                name="lock"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Security"
            onPress={() => router.push("/Tabs/Profile/Security")}
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <Entypo
                name="language"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Language"
            rightText={language}
            onPress={() => router.push("/Tabs/Profile/Language")}
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <Ionicons
                name="moon-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Dark Mode"
            rightComponent={
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            }
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <MaterialIcons
                name="flag"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Reports"
            onPress={() => router.push("/Tabs/Profile/Report")}
            isDarkMode={isDarkMode}
          />

          <ProfileMenu
            icon={
              <Feather
                name="shield"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Policies"
            onPress={() => router.push("/Policies")}
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="FAQ & Help"
            onPress={() => router.push("/Tabs/Profile/Faq")}
            isDarkMode={isDarkMode}
          />
          <ProfileMenu
            icon={
              <Ionicons
                name="share-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#222"}
              />
            }
            text="Invite Friends"
            onPress={() => router.push("/Tabs/Profile/Invite")}
            isDarkMode={isDarkMode}
          />
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => setLogoutModalVisible(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF000D" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDeleteModal}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- NEW DELETION MODAL COMPONENT --- */}
      <DeleteAccountModal
        isVisible={isDeleteModalVisible}
        isDarkMode={isDarkMode}
        toggleModal={toggleDeleteModal}
        deleteReasons={deleteReasons}
        handleDeleteAccount={handleDeleteAccount}
      />

      {/* --- LOGOUT MODAL (Modified to use new state) --- */}
      <Modal
        isVisible={isLogoutModalVisible}
        backdropOpacity={0.6}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={{ justifyContent: "center", margin: 20 }}
        statusBarTranslucent
        onBackdropPress={toggleLogoutModal}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? "#333" : "#fff",
              alignItems: "center",
            },
          ]}
        >
          {logoutModalStage === "confirm" && (
            <>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dv9s7sm0x/image/upload/v1757739949/8622276_3963536-removebg-preview_ipbf5j.png",
                }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <Text style={styles.modalTitle}>Logout</Text>
              <Text
                style={[
                  styles.modalMessage,
                  { color: isDarkMode ? "#fff" : "#555" },
                ]}
              >
                Are you sure you want to log out?
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={toggleLogoutModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {logoutModalStage === "loading" && (
            <>
              <Chase size={50} color="#FF5ACC" />
              <Text
                style={[
                  styles.modalMessage,
                  { color: isDarkMode ? "#eee" : "#444", marginTop: 16 },
                ]}
              >
                Logging out...
              </Text>
            </>
          )}

          {logoutModalStage === "success" && (
            <Text
              style={[
                styles.modalMessage,
                { color: isDarkMode ? "#eee" : "#222" },
              ]}
            >
              You have been logged out.
            </Text>
          )}
        </View>
      </Modal>
    </>
  );
};

// --- STYLESHEET (Unchanged, except for adding modalImage) ---
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

export default ProfileScreen;
