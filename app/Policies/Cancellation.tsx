import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isDarkMode: boolean;
}

interface BoldTextProps {
  children: React.ReactNode;
  isDarkMode: boolean;
}

// Reusable UI Components
const Section = ({ title, children, isDarkMode }: SectionProps) => (
  <View style={[styles.section, { borderBottomColor: isDarkMode ? "#444" : "#d1d5db" }]}>
    <Text style={[styles.sectionTitle, { color: "#FF5ACC" }]}>
      {title}
    </Text>
    {children}
  </View>
);

const B = ({ children, isDarkMode }: BoldTextProps) => (
  <Text style={{ fontFamily: "Poppins_600SemiBold", color: isDarkMode ? "#e5e7eb" : "#111827" }}>
    {children}
  </Text>
);

const CancellationPolicy: React.FC = () => {
  const { isDarkMode } = useAuth();

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#d1d5db" : "#374151";
  const headerTextColor = isDarkMode ? "#eee" : "#222";

  return (
    <ScrollView style={{ backgroundColor }} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? "#333" : "#e5e7eb",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={headerTextColor}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: headerTextColor }]}>
          Cancellation & Refund Policy
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: "Poppins_400Regular", color: textColor }}>
          Effective Date: <B isDarkMode={isDarkMode}>14 November 2025</B>
        </Text>
        {/* Intro */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#444" : "#d1d5db", marginBottom: 16, paddingBottom: 16 }}>
          <Text style={{ marginTop: 8, marginBottom: 16, fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FF5ACC" }}>
            This policy governs rescheduling, cancellations, refunds, and chargebacks for customers booking services via Feminiq.
          </Text>

          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            By using Feminiq, you agree to comply with this policy and Feminiq's <B isDarkMode={isDarkMode}>Terms of Service</B>.
          </Text>
        </View>

        {/* All Sections */}
        <Section title="1. Rescheduling Appointments" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, lineHeight: 24, fontFamily: "Poppins_400Regular", color: textColor }}>
            • Customers may reschedule appointments up to <B isDarkMode={isDarkMode}>24 hours before</B> the scheduled service time, subject to availability.{"\n"}• Rescheduling within 24 hours of the appointment is not permitted. In such cases, you may either attend the original booking or cancel according to the cancellation policy.
          </Text>
        </Section>

        <Section title="2. Cancellation Policy" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, lineHeight: 24, fontFamily: "Poppins_400Regular", color: textColor }}>
            • <B isDarkMode={isDarkMode}>More than 24 hours before appointment:</B> Full refund.{"\n"}• <B isDarkMode={isDarkMode}>Within 24 hours of appointment:</B> 80% refund. 20% is retained for administrative, preparation, and late-cancellation costs.
          </Text>
        </Section>

        <Section title="3. Refunds" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular" }}>
            • Refunds are processed only via the official <B isDarkMode={isDarkMode}>Feminiq payment platform</B>.{"\n"}• Credit timelines may vary depending on your bank or payment method but are typically completed within <B isDarkMode={isDarkMode}>3-5 business days</B>.
          </Text>
        </Section>

        <Section title="4. Chargebacks" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular" }}>
            • Customers should not initiate chargebacks without first contacting <Text style={{ color: "#FF5ACC" }}>support@feminiq.in</Text>{"\n"}• Unauthorized or fraudulent chargebacks may result in:{"\n"} o Account suspension or termination{"\n"} o Denial of future bookings{"\n"} o Legal action as applicable{"\n"}<B isDarkMode={isDarkMode}>Please reach out to us before disputing any charges.</B>
          </Text>
        </Section>

        <Section title="5. General Guidelines" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            • All bookings, cancellations, and refunds must be completed through the <B isDarkMode={isDarkMode}>Feminiq platform</B>.{"\n"}• Feminiq is not liable for any arrangements or payments made outside the platform.{"\n"}• Feminiq may update this policy as required to ensure fairness, transparency, and compliance with applicable laws.{"\n"}<B isDarkMode={isDarkMode}>Always use the official platform for secure transactions.</B>
          </Text>
        </Section>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  section: {
    borderBottomWidth: 1,
    paddingBottom: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
});

export default CancellationPolicy;
