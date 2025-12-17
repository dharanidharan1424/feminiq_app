import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function GovId() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GovID Verification</Text>
      </View>

      {/* Centered ID Placeholder */}
      <View style={styles.iconSection}>
        {/* Dummy dashed rectangle placeholder (for Aadhar card image) */}
        <View style={styles.dashedBox} />
        <Text style={styles.subtitle}>
          Upload you Aadhar Card{"\n"}Front for Verification
        </Text>
      </View>

      {/* Footer caption */}
      <Text style={styles.footerCaption}>
        Make Sure the uploaded photo is clear
      </Text>

      {/* Scan ID Button */}
      <TouchableOpacity style={styles.scanButton} activeOpacity={0.85}>
        <Text style={styles.scanButtonText}>Scan ID</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/Tabs")}
        className="py-2 text-center flex-row  justify-center "
        activeOpacity={0.85}
      >
        <Text className="text-primary font-poppins-medium text-lg">
          Skip Now
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingVertical: 80 },
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
    marginTop: -70,
  },
  dashedBox: {
    width: 250,
    height: 150,
    borderWidth: 3,
    borderColor: "#000",
    borderStyle: "dashed",
    borderRadius: 18,
    marginBottom: 26,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#232323",
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 24,
  },
  footerCaption: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginBottom: 18,
    marginTop: 10,
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
