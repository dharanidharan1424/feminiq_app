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

const PrivacyPolicy = () => {
  const { isDarkMode } = useAuth();

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#d1d5db" : "#374151";
  const headerTextColor = isDarkMode ? "#eee" : "#222";

  return (
    <ScrollView style={{ backgroundColor }} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          paddingHorizontal: 12,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? "#333" : "#e5e7eb",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={headerTextColor}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: headerTextColor }]}>
          Privacy Policy
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#444" : "#d1d5db" }}>
          <Text style={{ fontFamily: "Poppins_400Regular", color: textColor }}>
            Effective Date: <B isDarkMode={isDarkMode}>14 November 2025</B>
          </Text>
          {/* Intro */}
          <Text style={{ marginTop: 8, marginBottom: 16, fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FF5ACC" }}>
            Feminiq ('we', 'us', 'our') is committed to protecting your Personal Data in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and DPDP Rules, 2025.
          </Text>

          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            This Privacy Policy explains how we <B isDarkMode={isDarkMode}>collect, process, use, store, share</B> and safeguard your information when you use our application and services.
          </Text>
        </View>

        {/* All Sections */}
        <Section title="1. Personal Data We Collect" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, lineHeight: 24, fontFamily: "Poppins_400Regular", color: textColor }}>
            We collect the following categories of Personal Data:{"\n"}• Identity Data - Name, email, phone number, address{"\n"}• Account & Profile Data - Preferences, settings, booking history{"\n"}• Payment Data - Processed securely through third-party gateways{"\n"}• Technical Data - IP address, device ID, browser type{"\n"}• Location Data - Only with your explicit permission{"\n"}• Service Data - Photos, instructions, inputs shared during beauty/wellness services{"\n"}• Sensitive Data - Allergies/skin conditions shared voluntarily for service customization
          </Text>
        </Section>

        <Section title="2. Purpose of Processing" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, lineHeight: 24, fontFamily: "Poppins_400Regular", color: textColor }}>
            We process Personal Data strictly for the following lawful purposes:{"\n"}{"\n"}• Booking, service delivery, and order fulfillment{"\n"}• Identity verification & OTP authentication{"\n"}• Customer support & grievance redressal{"\n"}• Sending confirmations, alerts, and reminders{"\n"}• Improving services and user experience{"\n"}• Compliance with legal obligations{"\n"}• Marketing communications (only with explicit consent)
          </Text>
        </Section>

        <Section title="3. Consent & Withdrawal" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular" }}>
            • Consent is obtained digitally before collection or processing of your Personal Data{"\n"}• You may withdraw consent at any time by emailing <Text style={{ color: "#FF5ACC" }}>support@feminiq.in</Text>{"\n"}• Withdrawal does not affect the lawfulness of processing conducted prior to withdrawal{"\n"}• Certain services may not be available if consent is withdrawn
          </Text>
        </Section>

        <Section title="4. Rights of Data Principals" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular" }}>
            Under the DPDP Act, you have the following rights:{"\n"}• Access your Personal Data{"\n"}• Request correction or updates to inaccurate data{"\n"}• Seek erasure when the purpose is fulfilled{"\n"}• Withdraw consent at any time{"\n"}• Nominate another person to act on your behalf{"\n"}• File complaints before the Data Protection Board of India{"\n"}To exercise your rights : Email <Text style={{ color: "#FF5ACC" }}>dpo@feminiq.in</Text>. We will respond within statutory timelines.
          </Text>
        </Section>

        <Section title="5. Children's Data" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, fontFamily: "Poppins_400Regular", lineHeight: 24, fontSize: 16 }}>
            • We do not knowingly process data of children below the notified age without verifiable parental consent{"\n"}• If we become aware of unauthorized collection, we will delete such data immediately
          </Text>
        </Section>

        <Section title="6. Data Retention & Erasure" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            • Personal Data is retained only as long as necessary for the stated purpose{"\n"}• Unless required otherwise by law, data is erased within 3 years from last interaction{"\n"}• Data will be erased immediately upon request, unless prohibited by law{"\n"}• Technical logs may be retained for up to 1 year for security and breach investigation purposes
          </Text>
        </Section>

        <Section title="7. Security Measures" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            We implement robust security measures including:{"\n"}• Encryption (at rest & in transit){"\n"}• Access controls & multi-factor authentication {"\n"}• Regular security audits & penetration testing {"\n"}• Employee confidentiality obligations {"\n"}• Secure data centers with physical access controls {"\n"}• Incident response protocols
          </Text>
        </Section>

        <Section title="8. Personal Data Breach" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            In case of a Personal Data breach likely to cause harm:{"\n"}• Incident reported to Data Protection Board of India{"\n"}• Corrective action will be taken promptly{"\n"}• Affected users will be notified promptly{"\n"}• A report will be filed with the Data Protection Board of India{"\n"}• A detailed breach report will be submitted within 72 hours{"\n"}• We will take immediate remedial action to mitigate harm
          </Text>
        </Section>

        <Section title="9. Data Sharing & Processors" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            We may share Personal Data with the following third-party processors:{"\n"} • Payment gateways{"\n"} • SMS/Email/OTP service vendors{"\n"} • Hosting & IT infrastructure providers{"\n"} • Analytics platforms{"\n"} • Beauty & wellness professionals
          </Text>
        </Section>

        <Section title="10. Cross-Border Transfers" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            • Transfers will comply with DPDP Act requirements{"\n"}• Only approved jurisdictions or safeguarded processors{"\n"}• Appropriate contractual and technical safeguards implemented
          </Text>
        </Section>

        <Section title="11. Data Protection Officer (DPO)" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            • Data Protection Officer{"\n"}• Contact: <Text style={{ color: "#FF5ACC" }}>dpo@feminiq.in</Text>{"\n"}• For all data protection queries, rights requests, and complaints, please contact our DPO.
          </Text>
        </Section>

        <Section title="12. Grievance Redressal" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            • General support: <Text style={{ color: "#FF5ACC" }}>support@feminiq.in</Text>{"\n"}• Unresolved complaints: <Text style={{ color: "#FF5ACC" }}>dpo@feminiq.in</Text>{"\n"}• We will acknowledge within 72 hours and resolve in 30 days.
          </Text>
        </Section>

        <Section title="13. Updates to this Policy" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            • Policy may be updated periodically{"\n"}• Updated version will be published with effective date{"\n"}• Continued use implies acceptance{"\n"}• Material changes will be notified
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

export default PrivacyPolicy;
