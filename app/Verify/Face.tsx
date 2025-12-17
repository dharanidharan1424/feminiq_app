import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";

export default function Face() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Face Verification</Text>
      </View>

      <View style={styles.iconSection}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dv9s7sm0x/image/upload/v1757737362/19198969_w71m5y.jpg",
          }}
          style={styles.placeholderImage}
        />
        <Text style={styles.subtitle}>
          Unlock Your Account with {"\n"}Facial Scan for Verification
        </Text>
      </View>

      <TouchableOpacity style={styles.scanButton} activeOpacity={0.85}>
        <Text style={styles.scanButtonText}>Scan Face</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/Verify/GovId")}
        className="py-2 text-center flex-row  justify-center "
        activeOpacity={0.85}
      >
        <Text className="text-primary font-poppins-medium text-lg">
          Skip Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingVertical: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#232323",
    marginLeft: 2,
  },

  iconSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderImage: {
    width: 200,
    height: 200,
    marginBottom: 28,
    resizeMode: "contain",
    // Optionally add a faint border or shadow for effect
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#232323",
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 24,
  },

  scanButton: {
    backgroundColor: "#FF5ACC",
    marginHorizontal: 24,
    borderRadius: 30,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600",
  },
});
