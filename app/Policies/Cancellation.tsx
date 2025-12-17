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

const CancellationPolicy: React.FC = () => {
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
          Cancellation & Refund Policy
        </Text>
      </View>

      <View className="px-6">
        <Text className="font-poppins-regular">
          Effective Date: <B>14 November 2025</B>
        </Text>
        {/* Intro */}
        <View className="border-b border-gray-300 mb-4 pb-4">
          <Text
            className={`mt-2 mb-4 text-lg font-poppins-semibold ${primaryColor}`}
          >
            This policy governs rescheduling, cancellations, refunds, and
            chargebacks for customers booking services via Feminiq.
          </Text>

          <Text
            className={` text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            By using Feminiq, you agree to comply with this policy and
            Feminiq&apos;s <B>Terms of Service</B>.
          </Text>
        </View>

        {/* All Sections */}
        <Section
          title="1. Rescheduling Appointments"
          primaryColor={primaryColor}
        >
          <Text
            className={`text-base leading-relaxed font-poppins-regular ${textColor}`}
          >
            • Customers may reschedule appointments up to <B>24 hours before</B>{" "}
            the scheduled service time, subject to availability.
            {"\n"}• Rescheduling within 24 hours of the appointment is not
            permitted. In such cases, you may either attend the original booking
            or cancel according to the cancellation policy.
          </Text>
        </Section>

        <Section title="2. Cancellation Policy" primaryColor={primaryColor}>
          <Text
            className={`text-base leading-relaxed font-poppins-regular ${textColor}`}
          >
            • <B>More than 24 hours before appointment:</B> Full refund.
            {"\n"}• <B>Within 24 hours of appointment:</B> 80% refund. 20% is
            retained for administrative, preparation, and late-cancellation
            costs.
          </Text>
        </Section>

        <Section title="3. Refunds" primaryColor={primaryColor}>
          <Text
            className={`text-base ${textColor} leading-relaxed font-poppins-regular`}
          >
            • Refunds are processed only via the official{" "}
            <B>Feminiq payment platform</B>.{"\n"}• Credit timelines may vary
            depending on your bank or payment method but are typically completed
            within <B>3-5 business days</B>.
          </Text>
        </Section>

        <Section title="4. Chargebacks" primaryColor={primaryColor}>
          <Text
            className={`text-base ${textColor} leading-relaxed font-poppins-regular`}
          >
            • Customers should not initiate chargebacks without first contacting{" "}
            <Text className={primaryColor}>support@feminiq.in</Text>
            {"\n"}• Unauthorized or fraudulent chargebacks may result in:
            {"\n"} o Account suspension or termination
            {"\n"} o Denial of future bookings
            {"\n"} o Legal action as applicable
            {"\n"}
            <B>Please reach out to us before disputing any charges.</B>
          </Text>
        </Section>

        <Section title="5. General Guidelines" primaryColor={primaryColor}>
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            • All bookings, cancellations, and refunds must be completed through
            the <B>Feminiq platform</B>.{"\n"}• Feminiq is not liable for any
            arrangements or payments made outside the platform.
            {"\n"}• Feminiq may update this policy as required to ensure
            fairness, transparency, and compliance with applicable laws.
            {"\n"}
            <B>Always use the official platform for secure transactions.</B>
          </Text>
        </Section>
      </View>
    </ScrollView>
  );
};

export default CancellationPolicy;
