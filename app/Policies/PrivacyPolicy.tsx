import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  primaryColor: string;
}

interface BoldTextProps {
  children: React.ReactNode;
}

// Reusable UI Components
const Section = ({ title, children, primaryColor }: SectionProps) => (
  <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-8">
    <Text className={`mb-3 text-lg font-poppins-semibold ${primaryColor}`}>
      {title}
    </Text>
    {children}
  </View>
);

const B = ({ children }: BoldTextProps) => (
  <Text className="font-poppins-semibold text-gray-900 dark:text-gray-200">
    {children}
  </Text>
);

const PrivacyPolicy = () => {
  const { isDarkMode } = useAuth();

  const textColor = isDarkMode ? "text-gray-300" : "text-gray-700";
  const primaryColor = "text-primary";

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header */}
      <View className="flex-row items-center mb-4 px-3 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#eee" : "#222"}
          />
        </TouchableOpacity>

        <Text className={`ml-4 text-xl font-poppins-semibold ${textColor}`}>
          Privacy Policy
        </Text>
      </View>

      <View className="px-6">
        <View className="mb-4 pb-4 border-b border-gray-300">
          <Text className="font-poppins-regular">
            Effective Date: <B>14 November 2025</B>
          </Text>
          {/* Intro */}
          <Text
            className={`mt-2 mb-4 text-lg font-poppins-semibold ${primaryColor}`}
          >
            Feminiq (&apos;we&apos;, &apos;us&apos;, &apos;our&apos;) is
            committed to protecting your Personal Data in compliance with the
            Digital Personal Data Protection Act, 2023 (DPDP Act) and DPDP
            Rules, 2025.
          </Text>

          <Text
            className={`  text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            This Privacy Policy explains how we{" "}
            <B>collect, process, use, store, share</B> and safeguard your
            information when you use our application and services.
          </Text>
        </View>
        {/* All Sections */}
        <Section
          title="1. Personal Data We Collect"
          primaryColor={primaryColor}
        >
          <Text
            className={`text-base leading-relaxed font-poppins-regular ${textColor}`}
          >
            We collect the following categories of Personal Data:{"\n"}•
            Identity Data - Name, email, phone number, address{"\n"}• Account &
            Profile Data - Preferences, settings, booking history
            {"\n"}• Payment Data - Processed securely through third-party
            gateways{"\n"}• Technical Data - IP address, device ID, browser type
            {"\n"}• Location Data - Only with your explicit permission{"\n"}•
            Service Data - Photos, instructions, inputs shared during
            beauty/wellness services{"\n"}• Sensitive Data - Allergies/skin
            conditions shared voluntarily for service customization
          </Text>
        </Section>

        <Section title="2. Purpose of Processing" primaryColor={primaryColor}>
          <Text
            className={`text-base leading-relaxed font-poppins-regular ${textColor}`}
          >
            We process Personal Data strictly for the following lawful purposes:
            {"\n"}
            {"\n"}• Booking, service delivery, and order fulfillment{"\n"}•
            Identity verification & OTP authentication{"\n"}• Customer support &
            grievance redressal{"\n"}• Sending confirmations, alerts, and
            reminders{"\n"}• Improving services and user experience{"\n"}•
            Compliance with legal obligations{"\n"}• Marketing communications
            (only with explicit consent)
          </Text>
        </Section>

        <Section title="3. Consent & Withdrawal" primaryColor={primaryColor}>
          <Text
            className={`text-base ${textColor} leading-relaxed font-poppins-regular`}
          >
            • Consent is obtained digitally before collection or processing of
            your Personal Data{"\n"}• You may withdraw consent at any time by
            emailing <Text className="text-primary">support@feminiq.in</Text>
            {"\n"}• Withdrawal does not affect the lawfulness of processing
            conducted prior to withdrawal{"\n"}• Certain services may not be
            available if consent is withdrawn
          </Text>
        </Section>

        <Section
          title="4. Rights of Data Principals"
          primaryColor={primaryColor}
        >
          <Text
            className={`text-base ${textColor} leading-relaxed font-poppins-regular`}
          >
            Under the DPDP Act, you have the following rights:
            {"\n"}• Access your Personal Data
            {"\n"}• Request correction or updates to inaccurate data
            {"\n"}• Seek erasure when the purpose is fulfilled
            {"\n"}• Withdraw consent at any time
            {"\n"}• Nominate another person to act on your behalf
            {"\n"}• File complaints before the Data Protection Board of India
            {"\n"}To exercise your rights : Email
            <Text className={primaryColor}> dpo@feminiq.in</Text>. We will
            respond within statutory timelines.
          </Text>
        </Section>

        <Section title="5. Children's Data" primaryColor={primaryColor}>
          <Text className={`${textColor} font-poppins-regular leading-relaxed`}>
            • We do not knowingly process data of children below the notified
            age without verifiable parental consent
            {"\n"}• If we become aware of unauthorized collection, we will
            delete such data immediately
          </Text>
        </Section>

        <Section
          title="6. Data Retention & Erasure"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            • Personal Data is retained only as long as necessary for the stated
            purpose
            {"\n"}• Unless required otherwise by law, data is erased within 3
            years from last interaction
            {"\n"}• Data will be erased immediately upon request, unless
            prohibited by law
            {"\n"}• Technical logs may be retained for up to 1 year for security
            and breach investigation purposes
          </Text>
        </Section>

        <Section title="7. Security Measures" primaryColor={primaryColor}>
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            We implement robust security measures including:
            {"\n"}• Encryption (at rest & in transit)
            {"\n"}• Access controls & multi-factor authentication {"\n"}•
            Regular security audits & penetration testing {"\n"}• Employee
            confidentiality obligations {"\n"}• Secure data centers with
            physical access controls {"\n"}• Incident response protocols
          </Text>
        </Section>

        <Section title="8. Personal Data Breach" primaryColor={primaryColor}>
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            In case of a Personal Data breach likely to cause harm:
            {"\n"}• Incident reported to Data Protection Board of India
            {"\n"}• Corrective action will be taken promptly
            {"\n"}• Affected users will be notified promptly
            {"\n"}• A report will be filed with the Data Protection Board of
            India
            {"\n"}• A detailed breach report will be submitted within 72 hours
            {"\n"}• We will take immediate remedial action to mitigate harm
          </Text>
        </Section>

        <Section
          title="9. Data Sharing & Processors"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            We may share Personal Data with the following third-party
            processors:
            {"\n"} • Payment gateways
            {"\n"} • SMS/Email/OTP service vendors
            {"\n"} • Hosting & IT infrastructure providers
            {"\n"} • Analytics platforms
            {"\n"} • Beauty & wellness professionals
          </Text>
        </Section>

        <Section title="10. Cross-Border Transfers" primaryColor={primaryColor}>
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            • Transfers will comply with DPDP Act requirements
            {"\n"}• Only approved jurisdictions or safeguarded processors
            {"\n"}• Appropriate contractual and technical safeguards implemented
          </Text>
        </Section>

        <Section
          title="11. Data Protection Officer (DPO)"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            • Data Protection Officer
            {"\n"}• Contact:{" "}
            <Text className={primaryColor}>dpo@feminiq.in</Text>
            {"\n"}• For all data protection queries, rights requests, and
            complaints, please contact our DPO.
          </Text>
        </Section>

        <Section title="12. Grievance Redressal" primaryColor={primaryColor}>
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            • General support:{" "}
            <Text className={primaryColor}>support@feminiq.in</Text>
            {"\n"}• Unresolved complaints:{" "}
            <Text className={primaryColor}>dpo@feminiq.in</Text>
            {"\n"}• We will acknowledge within 72 hours and resolve in 30 days.
          </Text>
        </Section>

        <Section title="13. Updates to this Policy" primaryColor={primaryColor}>
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            • Policy may be updated periodically
            {"\n"}• Updated version will be published with effective date
            {"\n"}• Continued use implies acceptance
            {"\n"}• Material changes will be notified
          </Text>
        </Section>
      </View>
    </ScrollView>
  );
};

export default PrivacyPolicy;
