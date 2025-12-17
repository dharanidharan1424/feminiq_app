import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const REPORT_TYPES = [
  { label: "Order Issue", value: "Order Issue" },
  { label: "Payment Issue", value: "Payment Issue" },
  { label: "Account Issue", value: "Account Issue" },
  { label: "App Bug", value: "App Bug" },
  { label: "Feature Request", value: "Feature Request" },
  { label: "Other", value: "Other" },
];

const Report = () => {
  const { profile, isDarkMode } = useAuth();
  const { booking_id } = useLocalSearchParams();
  const [reportType, setReportType] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking_id) {
      const id = Array.isArray(booking_id) ? booking_id[0] : booking_id;
      setOrderRef(id ?? "");
      setReportType("Order Issue");
    }
  }, [booking_id]);

  // Dynamic colors
  const colors = {
    background: isDarkMode ? "#19171B" : "#fff",
    card: isDarkMode ? "#232029" : "#fff",
    text: isDarkMode ? "#fafafa" : "#151515",
    label: isDarkMode ? "#eee" : "#111",
    border: "#FF5ACC",
    inputBorder: isDarkMode ? "#393248" : "#EEE",
    inputBg: isDarkMode ? "#232029" : "#fafafa",
    placeholder: isDarkMode ? "#ccc" : "#777",
    submit: "#FF5ACC",
    submitText: "#fff",
    icon: "#ff5acc",
  };

  const handleSubmit = async () => {
    if (!reportType || !subject || !message) {
      Alert.alert("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://feminiq-backend.onrender.com/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: profile?.id,
          user_name: profile?.fullname,
          report_type: reportType,
          subject,
          message,
          order_ref: orderRef,
        }),
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert("Success", "Report submitted successfully!");
        setReportType(null);
        setSubject("");
        setOrderRef("");
        setMessage("");
      } else {
        Alert.alert("Error", json.error || "Error submitting report.");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Network error.");
    }
    setLoading(false);
  };

  const handleBack = () => {
    // If fromPage param exists, navigate to that page
    if (booking_id) {
      router.push(`/Tabs/Booking`);
    } else {
      // Otherwise, go back in history
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 100}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Pressable onPress={handleBack}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.icon}
              style={{ padding: 4 }}
            />
          </Pressable>
          <View className="flex-row items-center justify-center flex-1">
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Report an Issue
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.label }]}>
            Report Type
          </Text>
          <Dropdown
            style={[
              styles.dropdown,
              {
                borderColor: colors.border,
                backgroundColor: colors.inputBg,
              },
            ]}
            data={REPORT_TYPES}
            labelField="label"
            valueField="value"
            placeholder="Select"
            placeholderStyle={{ color: colors.placeholder }}
            value={reportType}
            onChange={(item) => setReportType(item.value)}
            fontFamily="Poppins_400Regular"
            selectedTextStyle={{ color: colors.text }}
            inputSearchStyle={{ color: colors.text }}
          />

          <Text style={[styles.label, { color: colors.label }]}>Subject</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
                color: colors.text,
              },
            ]}
            placeholder="Brief summary"
            placeholderTextColor={colors.placeholder}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={[styles.label, { color: colors.label }]}>
            Order/Booking Ref (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
                color: colors.text,
              },
            ]}
            placeholder="e.g., ORD-12345"
            placeholderTextColor={colors.placeholder}
            value={orderRef}
            onChangeText={setOrderRef}
          />

          <Text style={[styles.label, { color: colors.label }]}>
            Describe the issue
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
                color: colors.text,
              },
            ]}
            placeholder="Provide details"
            placeholderTextColor={colors.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.submit }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.submitText, { color: colors.submitText }]}>
              {loading ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginBottom: 3,
    marginTop: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 18,
    marginBottom: -6,
  },
  submitText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 17,
  },
});

export default Report;
