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

// Reusable components
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

const PaymentFraud = () => {
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
          Customer Payment Fraud Policy
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <Text style={{ marginBottom: 16, fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#444" : "#e5e7eb", paddingBottom: 20 }}>
          Effective Date: <B isDarkMode={isDarkMode}>14 November 2025</B>{"\n"}{"\n"}This Customer Payment Fraud Policy ("Policy") applies to all users ("Customers", "You") who book services through Feminiq <B isDarkMode={isDarkMode}>("Feminiq", "We", "Us", "Our")</B>. The purpose of this Policy is to prevent fraudulent financial activity, ensure secure transactions, and maintain a transparent payment environment for both Customers and Artists.{"\n"}{"\n"}<B isDarkMode={isDarkMode}>By accessing or using Feminiq, You agree to comply with this Policy, Feminiq's Terms of Use, and all applicable laws.</B>
        </Text>

        <Section title="1. Definition of Payment Fraud (Customer Misconduct)" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            For the purposes of this Policy, <B isDarkMode={isDarkMode}>"Payment Fraud"</B> includes, but is not limited to:{"\n"}{"\n"}1.1 <B isDarkMode={isDarkMode}>Providing false or invalid payment information</B>{"\n"}• Using expired, invalid, or unauthorized payment cards{"\n"}• Using payment instruments without the lawful owner's consent{"\n"}{"\n"}1.2 <B isDarkMode={isDarkMode}>Attempting to obtain services without paying</B>{"\n"}• Claiming false payment completion{"\n"}• Sending fabricated payment screenshots{"\n"}• Misleading Artists into believing payment has been made{"\n"}{"\n"}1.3 <B isDarkMode={isDarkMode}>Manipulating bookings or payments</B>{"\n"}• Placing orders with no intention of receiving services{"\n"}• Fraudulently cancelling orders after services have been completed{"\n"}• Initiating false chargebacks or disputing legitimate charges (<B isDarkMode={isDarkMode}>"chargeback fraud"</B>){"\n"}{"\n"}1.4 <B isDarkMode={isDarkMode}>Misleading Artists or bypassing Feminiq's platform</B>{"\n"}• Requesting Artists to offer direct/discounted offline deals{"\n"}• Encouraging payments outside Feminiq's system{"\n"}• Attempting to avoid platform fees, taxes, or service charges{"\n"}{"\n"}1.5 <B isDarkMode={isDarkMode}>Identity or account fraud</B>{"\n"}• Creating fake or duplicate accounts{"\n"}• Using false identity information{"\n"}• Misusing offers or incentives through multiple accounts{"\n"}{"\n"}<B isDarkMode={isDarkMode}>Any such activities constitute fraudulent misconduct and will result in enforcement action.</B>
          </Text>
        </Section>

        <Section title="2. No Direct or Offline Payments" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            2.1 <B isDarkMode={isDarkMode}>Only Platform Payments Are Allowed</B>{"\n"}• All payments must be completed exclusively through Feminiq's official digital platform using approved methods such as UPI, card, wallet, or net banking.{"\n"}• Feminiq strictly prohibits:{"\n"} - Cash payments{"\n"} - Direct payments to Artists (UPI, QR code, bank transfer){"\n"} - Personal QR codes shared by Artists{"\n"} - Any payment settlement outside the Feminiq platform{"\n"}{"\n"}2.2 <B isDarkMode={isDarkMode}>Fake Payment Claims</B>{"\n"}• Feminiq does not recognize:{"\n"} - Screenshots of payments{"\n"} - SMS confirmations{"\n"} - WhatsApp or external message confirmations{"\n"}• Payment is considered valid only when the platform verifies and displays a successful transaction.{"\n"}• If payment is not reflected within the app, the order is deemed unpaid.
          </Text>
        </Section>

        <Section title="3. Fraud Detection and Monitoring" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            Feminiq employs multiple verification and fraud-prevention mechanisms, including:{"\n"}• Manual audits and behaviour checks{"\n"}• IP, device, and geographic monitoring{"\n"}• Pattern recognition for unusual booking activity{"\n"}• Verification of customer disputes and cancellations{"\n"}{"\n"}<B isDarkMode={isDarkMode}>Suspicious activity may result in account limitations or cancellation of bookings.</B>
          </Text>
        </Section>

        <Section title="4. Consequences for Customer Payment Fraud" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            Feminiq follows a zero-tolerance policy for payment fraud. Possible actions include:{"\n"}• Immediate account suspension{"\n"}• Permanent account ban{"\n"}• Cancellation of ongoing or future services{"\n"}• Denial of refunds or incentives{"\n"}• Reporting fraud to law enforcement under applicable laws{"\n"}• Recovery of financial losses incurred{"\n"}{"\n"}<B isDarkMode={isDarkMode}>Feminiq reserves the right to refuse services to fraudulent individuals.</B>
          </Text>
        </Section>

        <Section title="5. Customer Responsibilities" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            <B isDarkMode={isDarkMode}>Customers must:</B>{"\n"}• Make payments only through Feminiq's official platform{"\n"}• Confirm bookings and payment status within the app{"\n"}• Refrain from direct or offline payment arrangements{"\n"}• Protect OTPs, banking credentials, and personal information{"\n"}• Use only legitimate and authorized payment methods inside the Platform{"\n"}• Cooperate promptly with Feminiq during dispute or verification processes{"\n"}{"\n"}<B isDarkMode={isDarkMode}>Failure to comply may lead to account restrictions or financial liability.</B>
          </Text>
        </Section>

        <Section title="6. Fraud Prevention for Customers" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            6.1 <B isDarkMode={isDarkMode}>Off-Platform Payment Requests Are Strictly Prohibited</B>{"\n"}• Treat the following as fraud indicators:{"\n"} - Requests for cash{"\n"} - Sharing personal UPI IDs or bank details{"\n"} - Asking you to cancel the platform booking and pay directly{"\n"} - Offering discounts for off-app payments{"\n"} - Attempting to complete or reschedule services privately{"\n"}• You must immediately report any such attempts.{"\n"}{"\n"}6.2 <B isDarkMode={isDarkMode}>Misuse of Feminiq's Name or Identity</B>{"\n"}• Feminiq is not responsible for unauthorized payment collection by Artists or impersonation.{"\n"}• Feminiq will never request payment outside the app or via third-party links.{"\n"}{"\n"}6.3 <B isDarkMode={isDarkMode}>Risks of Off-Platform Deals</B>{"\n"}• Customers engaging in off-platform transactions accept full risk including loss, theft, no refunds, and safety risks.{"\n"}{"\n"}<B isDarkMode={isDarkMode}>Feminiq protection applies only to official platform bookings and payments.</B>
          </Text>
        </Section>

        <Section title="7. Reporting Fraud or Suspicious Activity" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            Customers must immediately report:{"\n"}• Fake payment requests{"\n"}• Attempts by Artists to receive offline payments{"\n"}• Suspicious calls, links, messages, or QR codes{"\n"}• Unauthorized charges or incorrect transactions{"\n"}Contact Us:{"\n"}• Email: <Text style={{ color: "#FF5ACC" }}>support@feminiq.in</Text>{"\n"}• In-App Help & Support{"\n"}{"\n"}<B isDarkMode={isDarkMode}>Feminiq's Fraud & Safety Team will investigate and take appropriate action.</B>
          </Text>
        </Section>

        <Section title="8. Amendments to This Policy" isDarkMode={isDarkMode}>
          <Text style={{ color: textColor, lineHeight: 24, fontFamily: "Poppins_400Regular", fontSize: 16 }}>
            Feminiq may update or modify this Policy at any time. Continued use of the platform constitutes acceptance of the updated Policy.
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

export default PaymentFraud;
