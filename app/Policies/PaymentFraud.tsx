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

// Reusable components
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

const PaymentFraud = () => {
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
          Customer Payment Fraud Policy
        </Text>
      </View>

      <View className="px-6">
        <Text
          className={`mb-4 text-base font-poppins-regular ${textColor} leading-relaxed border-b border-gray-200 pb-5`}
        >
          Effective Date: <B>14 November 2025</B>
          {"\n"}
          {"\n"}This Customer Payment Fraud Policy (“Policy”) applies to all
          users (“Customers”, “You”) who book services through Feminiq
          <B>(“Feminiq”, “We”, “Us”, “Our”)</B>. The purpose of this Policy is
          to prevent fraudulent financial activity, ensure secure transactions,
          and maintain a transparent payment environment for both Customers and
          Artists.
          {"\n"}
          {"\n"}
          <B>
            By accessing or using Feminiq, You agree to comply with this Policy,
            Feminiq’s Terms of Use, and all applicable laws.
          </B>
        </Text>

        <Section
          title="1. Definition of Payment Fraud (Customer Misconduct)"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            For the purposes of this Policy, <B>“Payment Fraud”</B> includes,
            but is not limited to:
            {"\n"}
            {"\n"}1.1 <B>Providing false or invalid payment information</B>
            {"\n"}• Using expired, invalid, or unauthorized payment cards
            {"\n"}• Using payment instruments without the lawful owner’s consent
            {"\n"}
            {"\n"}1.2 <B>Attempting to obtain services without paying</B>
            {"\n"}• Claiming false payment completion
            {"\n"}• Sending fabricated payment screenshots
            {"\n"}• Misleading Artists into believing payment has been made
            {"\n"}
            {"\n"}1.3 <B>Manipulating bookings or payments</B>
            {"\n"}• Placing orders with no intention of receiving services
            {"\n"}• Fraudulently cancelling orders after services have been
            completed
            {"\n"}• Initiating false chargebacks or disputing legitimate charges
            (<B>“chargeback fraud”</B>){"\n"}
            {"\n"}1.4 <B>Misleading Artists or bypassing Feminiq’s platform</B>
            {"\n"}• Requesting Artists to offer direct/discounted offline deals
            {"\n"}• Encouraging payments outside Feminiq’s system
            {"\n"}• Attempting to avoid platform fees, taxes, or service charges
            {"\n"}
            {"\n"}1.5 <B>Identity or account fraud</B>
            {"\n"}• Creating fake or duplicate accounts
            {"\n"}• Using false identity information
            {"\n"}• Misusing offers or incentives through multiple accounts
            {"\n"}
            <B>
              Any such activities constitute fraudulent misconduct and will
              result in enforcement action.
            </B>
          </Text>
        </Section>

        <Section
          title="2. No Direct or Offline Payments"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            2.1 <B>Only Platform Payments Are Allowed</B>
            {"\n"}• All payments must be completed exclusively through Feminiq’s
            official digital platform using approved methods such as UPI, card,
            wallet, or net banking.
            {"\n"}• Feminiq strictly prohibits:
            {"\n"} - Cash payments
            {"\n"} - Direct payments to Artists (UPI, QR code, bank transfer)
            {"\n"} - Personal QR codes shared by Artists
            {"\n"} - Any payment settlement outside the Feminiq platform
            {"\n"}
            {"\n"}2.2 <B>Fake Payment Claims</B>
            {"\n"}• Feminiq does not recognize:
            {"\n"} - Screenshots of payments
            {"\n"} - SMS confirmations
            {"\n"} - WhatsApp or external message confirmations
            {"\n"}• Payment is considered valid only when the platform verifies
            and displays a successful transaction.
            {"\n"}• If payment is not reflected within the app, the order is
            deemed unpaid.
          </Text>
        </Section>

        <Section
          title="3. Fraud Detection and Monitoring"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            Feminiq employs multiple verification and fraud-prevention
            mechanisms, including:
            {"\n"}• Manual audits and behaviour checks
            {"\n"}• IP, device, and geographic monitoring
            {"\n"}• Pattern recognition for unusual booking activity
            {"\n"}• Verification of customer disputes and cancellations
            {"\n"}
            <B>
              Suspicious activity may result in account limitations or
              cancellation of bookings.
            </B>
          </Text>
        </Section>

        <Section
          title="4. Consequences for Customer Payment Fraud"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            Feminiq follows a zero-tolerance policy for payment fraud. Possible
            actions include:
            {"\n"}• Immediate account suspension
            {"\n"}• Permanent account ban
            {"\n"}• Cancellation of ongoing or future services
            {"\n"}• Denial of refunds or incentives
            {"\n"}• Reporting fraud to law enforcement under applicable laws
            {"\n"}• Recovery of financial losses incurred
            {"\n"}
            <B>
              Feminiq reserves the right to refuse services to fraudulent
              individuals.
            </B>
          </Text>
        </Section>

        <Section
          title="5. Customer Responsibilities"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            <B>Customers must:</B>
            {"\n"}• Make payments only through Feminiq’s official platform
            {"\n"}• Confirm bookings and payment status within the app
            {"\n"}• Refrain from direct or offline payment arrangements
            {"\n"}• Protect OTPs, banking credentials, and personal information
            {"\n"}• Use only legitimate and authorized payment methods inside
            the Platform
            {"\n"}• Cooperate promptly with Feminiq during dispute or
            verification processes
            {"\n"}
            <B>
              Failure to comply may lead to account restrictions or financial
              liability.
            </B>
          </Text>
        </Section>

        <Section
          title="6. Fraud Prevention for Customers"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            6.1 <B>Off-Platform Payment Requests Are Strictly Prohibited</B>
            {"\n"}• Treat the following as fraud indicators:
            {"\n"} - Requests for cash
            {"\n"} - Sharing personal UPI IDs or bank details
            {"\n"} - Asking you to cancel the platform booking and pay directly
            {"\n"} - Offering discounts for off-app payments
            {"\n"} - Attempting to complete or reschedule services privately
            {"\n"}• You must immediately report any such attempts.
            {"\n"}
            {"\n"}6.2 <B>Misuse of Feminiq’s Name or Identity</B>
            {"\n"}• Feminiq is not responsible for unauthorized payment
            collection by Artists or impersonation.
            {"\n"}• Feminiq will never request payment outside the app or via
            third-party links.
            {"\n"}
            {"\n"}6.3 <B>Risks of Off-Platform Deals</B>
            {"\n"}• Customers engaging in off-platform transactions accept full
            risk including loss, theft, no refunds, and safety risks.
            {"\n"}
            <B>
              Feminiq protection applies only to official platform bookings and
              payments.
            </B>
          </Text>
        </Section>

        <Section
          title="7. Reporting Fraud or Suspicious Activity"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            Customers must immediately report:
            {"\n"}• Fake payment requests
            {"\n"}• Attempts by Artists to receive offline payments
            {"\n"}• Suspicious calls, links, messages, or QR codes
            {"\n"}• Unauthorized charges or incorrect transactions
            {"\n"}Contact Us:
            {"\n"}• Email:{" "}
            <Text className={primaryColor}>support@feminiq.in</Text>
            {"\n"}• In-App Help & Support
            {"\n"}
            <B>
              Feminiq’s Fraud & Safety Team will investigate and take
              appropriate action.
            </B>
          </Text>
        </Section>

        <Section
          title="8. Amendments to This Policy"
          primaryColor={primaryColor}
        >
          <Text className={`${textColor} leading-relaxed font-poppins-regular`}>
            Feminiq may update or modify this Policy at any time. Continued use
            of the platform constitutes acceptance of the updated Policy.
          </Text>
        </Section>
      </View>
    </ScrollView>
  );
};

export default PaymentFraud;
