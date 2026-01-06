import { useAuth } from "@/context/UserContext";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface BoldTextProps {
  children: React.ReactNode;
  isDarkMode: boolean;
}

const B = ({ children, isDarkMode }: BoldTextProps) => (
  <Text style={{ fontFamily: "Poppins_600SemiBold", color: isDarkMode ? "#e5e7eb" : "#111827" }}>
    {children}
  </Text>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isDarkMode: boolean;
}

const Section = ({ title, children, isDarkMode }: SectionProps) => (
  <View style={[styles.section, { borderBottomColor: isDarkMode ? "#444" : "#d1d5db" }]}>
    <Text style={[styles.sectionTitle, { color: "#FF5ACC" }]}>
      {title}
    </Text>
    {children}
  </View>
);

const Terms = () => {
  const { isDarkMode } = useAuth();
  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#d1d5db" : "#374151";
  const headerTextColor = isDarkMode ? "#eee" : "#222";

  return (
    <ScrollView style={{ backgroundColor }} contentContainerStyle={{ paddingBottom: 48 }}>
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
          Terms & Conditions
        </Text>
      </View>
      
      <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#444" : "#d1d5db" }}>
          <Text style={{ fontFamily: "Poppins_400Regular", color: textColor }}>
            Effective Date: <B isDarkMode={isDarkMode}>14 November 2025</B>
          </Text>
          <Text style={{ marginTop: 8, fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FF5ACC" }}>
            By accessing or using the Feminiq platform, you agree to be bound by these Terms and Conditions.
          </Text>
        </View>

        <Section title="1. Eligibility" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • Users must be <B isDarkMode={isDarkMode}> 18 years of age or older</B>{"\n"}• Users below 18 may use the platform only with verifiable parental or guardian consent{"\n"}• By using our services, you represent that you meet the eligibility requirements
          </Text>
        </Section>

        <Section title="2. Services" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            Feminiq provides a digital platform connecting customers with verified beauty and wellness professionals for:{"\n"}• In-salon services{"\n"}• At-home beauty and wellness services{"\n"}• Product purchases{"\n"}• Appointment booking and management{"\n"}We act as an intermediary platform and are not directly responsible for service delivery by third-party professionals.
          </Text>
        </Section>

        <Section title="3. Bookings & Cancellations" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • Users may book, reschedule, or cancel appointments based on the <B isDarkMode={isDarkMode}>Cancellation Policy</B> displayed at the time of booking{"\n"}• <B isDarkMode={isDarkMode}>No-show charges</B> may apply if you fail to cancel within the specified timeframe{"\n"}• Cancellation and refund timelines vary by service provider{"\n"}• Refunds are governed by our <B isDarkMode={isDarkMode}>Refund Policy</B>
          </Text>
        </Section>

        <Section title="4. Payments" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • All payments are processed securely in <B isDarkMode={isDarkMode}>Indian Rupees (INR)</B>{"\n"}• We use third-party payment gateways for transaction processing{"\n"}• Feminiq is <B isDarkMode={isDarkMode}>not liable</B> for payment gateway failures, transaction errors, or bank-related issues{"\n"}• You are responsible for ensuring sufficient funds and accurate payment information
          </Text>
        </Section>

        <Section title="5. User Responsibilities" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            As a user of the Feminiq platform, you agree to:{"\n"}• Provide <B isDarkMode={isDarkMode}>accurate and complete </B> information during registration and booking{"\n"}• Ensure a <B isDarkMode={isDarkMode}>safe and appropriate environment</B> for at-home services{"\n"}• Treat professionals with respect and courtesy{"\n"}• <B isDarkMode={isDarkMode}>Avoid abusive, fraudulent</B>, or unlawful conduct{"\n"}• Not misuse the platform or attempt to gain unauthorized access
          </Text>
        </Section>

        <Section title="6. Professional Safety" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • Service professionals have the right to <B isDarkMode={isDarkMode}>refuse service</B> if they determine the environment is unsafe{"\n"}• Feminiq supports the safety and dignity of all professionals on the platform{"\n"}• Any harassment, abuse, or threatening behavior will result in immediate account termination
          </Text>
        </Section>

        <Section title="7. Service Disclaimer" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • <B isDarkMode={isDarkMode}>Results may vary</B> based on individual factors such as skin type, hair texture, and health conditions{"\n"}• Feminiq is <B isDarkMode={isDarkMode}>not liable</B> for:{"\n"} o Allergic reactions or adverse outcomes{"\n"} o Dissatisfaction with service quality{"\n"} o Professional conduct issues (though we facilitate grievance resolution){"\n"}• Users are advised to disclose allergies, sensitivities, and medical conditions to service providers
          </Text>
        </Section>

        <Section title="8. Intellectual Property" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • All platform content, including logos, trademarks, text, images, and software, belongs to <B isDarkMode={isDarkMode}>Feminiq</B> unless otherwise stated{"\n"}• You may not reproduce, distribute, or create derivative works without written permission{"\n"}• User-generated content (reviews, photos) may be used by Feminiq for promotional purposes
          </Text>
        </Section>

        <Section title="9. Account Security" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • You are <B isDarkMode={isDarkMode}>responsible</B> for maintaining the confidentiality of your login credentials{"\n"}• Notify us immediately at <Text style={{ color: "#FF5ACC" }}>support@feminiq.in</Text> if you suspect unauthorized access{"\n"}• Feminiq is not liable for losses arising from unauthorized account use due to your negligence
          </Text>
        </Section>

        <Section title="10. Liability Limitation" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            Feminiq is <B isDarkMode={isDarkMode}>not responsible</B> for:{"\n"}• Indirect, incidental, or consequential damages arising from platform use{"\n"}• Losses arising from:{"\n"} o Service delays or cancellations{"\n"} o Third-party conduct or service quality{"\n"} o Technical issues, downtime, or data loss{"\n"} o Misuse of the platform by users or professionals{"\n"}Our <B isDarkMode={isDarkMode}>liability</B> is limited to the amount paid for the specific service in question.
          </Text>
        </Section>

        <Section title="11. Termination" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • Feminiq reserves the right to <B isDarkMode={isDarkMode}>suspend or terminate</B> user accounts for:{"\n"} o Violation of these Terms and Conditions{"\n"} o Fraudulent or abusive behavior{"\n"} o Non-payment or chargebacks{"\n"} o Legal or regulatory requirements{"\n"}• Terminated users may be prohibited from re-registering
          </Text>
        </Section>

        <Section title="12. Governing Law" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • These Terms and Conditions are governed by the laws of India{"\n"}• Any disputes arising from the use of the Feminiq platform shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu, India
          </Text>
        </Section>

        <Section title="13. Data Protection Officer & Grievance Officer" isDarkMode={isDarkMode}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            <B isDarkMode={isDarkMode}>Data Protection Officer</B>{"\n"}Email: <Text style={{ color: "#FF5ACC" }}>dpo@feminiq.in</Text>{"\n"}Phone: +91-XXXXXXXXXX{"\n"}For grievances related to data protection, privacy, or platform usage, please contact our DPO or Grievance Officer.
          </Text>
        </Section>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ marginBottom: 12, fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FF5ACC" }}>
            14. Changes to Terms and Conditions
          </Text>
          <Text style={{ fontSize: 16, fontFamily: "Poppins_400Regular", color: textColor, lineHeight: 24 }}>
            • We may update these Terms and Conditions from time to time{"\n"}• Updated terms will be published on the platform with a revised effective date{"\n"}• Your continued use of the platform after updates constitutes acceptance of the revised terms
          </Text>
        </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
});

export default Terms;
