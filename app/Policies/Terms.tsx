import { useAuth } from "@/context/UserContext";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface BoldTextProps {
  children: React.ReactNode;
}

const B = ({ children }: BoldTextProps) => (
  <Text className="font-poppins-semibold text-gray-900 dark:text-gray-200">
    {children}
  </Text>
);

const Terms = () => {
  const { isDarkMode } = useAuth();
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";
  const primaryColor = "text-primary";

  return (
    <ScrollView contentContainerStyle={[]}>
      <View className="flex-row items-center mb-2 px-3 py-4 bg-transparent border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#eee" : "#222"}
          />
        </TouchableOpacity>
        <Text className={`ml-4 text-xl font-poppins-semibold ${textColor}`}>
          Terms & Conditions
        </Text>
      </View>
      <View className="px-6 pb-12">
        <View className="mb-4  pb-4 border-b border-gray-200">
          <Text className="font-poppins-regular">
            Effective Date: <B>14 November 2025</B>
          </Text>
          <Text
            className={`mt-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            By accessing or using the Feminiq platform, you agree to be bound by
            these Terms and Conditions.
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            1. Eligibility
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • Users must be <B> 18 years of age or older</B>
            {"\n"}• Users below 18 may use the platform only with verifiable
            parental or guardian consent
            {"\n"}• By using our services, you represent that you meet the
            eligibility requirements
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            2. Services
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            Feminiq provides a digital platform connecting customers with
            verified beauty and wellness professionals for:
            {"\n"}• In-salon services
            {"\n"}• At-home beauty and wellness services
            {"\n"}• Product purchases
            {"\n"}• Appointment booking and management
            {"\n"}We act as an intermediary platform and are not directly
            responsible for service delivery by third-party professionals.
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            3. Bookings & Cancellations
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • Users may book, reschedule, or cancel appointments based on the 0
            <B> Cancellation Policy</B> displayed at the time of booking
            {"\n"}• <B>No-show charges</B> may apply if you fail to cancel
            within the specified timeframe
            {"\n"}• Cancellation and refund timelines vary by service provider
            {"\n"}• Refunds are governed by our<B> Refund Policy</B>
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            4. Payments
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • All payments are processed securely in <B>Indian Rupees (INR)</B>
            {"\n"}• We use third-party payment gateways for transaction
            processing
            {"\n"}• Feminiq is <B>not liable</B> for payment gateway failures,
            transaction errors, or bank-related issues
            {"\n"}• You are responsible for ensuring sufficient funds and
            accurate payment information
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            5. User Responsibilities
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            As a user of the Feminiq platform, you agree to:
            {"\n"}• Provide <B>accurate and complete </B> information during
            registration and booking
            {"\n"}• Ensure a <B>safe and appropriate environment</B> for at-home
            services
            {"\n"}• Treat professionals with respect and courtesy
            {"\n"}• <B>Avoid abusive, fraudulent</B>, or unlawful conduct
            {"\n"}• Not misuse the platform or attempt to gain unauthorized
            access
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            6. Professional Safety
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • Service professionals have the right to<B> refuse service</B> if
            they determine the environment is unsafe
            {"\n"}• Feminiq supports the safety and dignity of all professionals
            on the platform
            {"\n"}• Any harassment, abuse, or threatening behavior will result
            in immediate account termination
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            7. Service Disclaimer
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • <B>Results may vary</B> based on individual factors such as skin
            type, hair texture, and health conditions
            {"\n"}• Feminiq is <B>not liable</B> for:
            {"\n"} o Allergic reactions or adverse outcomes
            {"\n"} o Dissatisfaction with service quality
            {"\n"} o Professional conduct issues (though we facilitate grievance
            resolution)
            {"\n"}• Users are advised to disclose allergies, sensitivities, and
            medical conditions to service providers
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            8. Intellectual Property
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • All platform content, including logos, trademarks, text, images,
            and software, belongs to <B>Feminiq</B> unless otherwise stated
            {"\n"}• You may not reproduce, distribute, or create derivative
            works without written permission
            {"\n"}• User-generated content (reviews, photos) may be used by
            Feminiq for promotional purposes
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            9. Account Security
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • You are <B>responsible</B> for maintaining the confidentiality of
            your login credentials
            {"\n"}• Notify us immediately at{" "}
            <Text className={primaryColor}>support@feminiq.in</Text> if you
            suspect unauthorized access
            {"\n"}• Feminiq is not liable for losses arising from unauthorized
            account use due to your negligence
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            10. Liability Limitation
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            Feminiq is <B>not responsible</B> for:
            {"\n"}• Indirect, incidental, or consequential damages arising from
            platform use
            {"\n"}• Losses arising from:
            {"\n"} o Service delays or cancellations
            {"\n"} o Third-party conduct or service quality
            {"\n"} o Technical issues, downtime, or data loss
            {"\n"} o Misuse of the platform by users or professionals
            {"\n"}Our <B>liability</B> is limited to the amount paid for the
            specific service in question.
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            11. Termination
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • Feminiq reserves the right to <B>suspend or terminate</B> user
            accounts for:
            {"\n"} o Violation of these Terms and Conditions
            {"\n"} o Fraudulent or abusive behavior
            {"\n"} o Non-payment or chargebacks
            {"\n"} o Legal or regulatory requirements
            {"\n"}• Terminated users may be prohibited from re-registering
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            12. Governing Law
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            • These Terms and Conditions are governed by the laws of India
            {"\n"}• Any disputes arising from the use of the Feminiq platform
            shall be subject to the exclusive jurisdiction of the courts in
            Chennai, Tamil Nadu, India
          </Text>
        </View>

        <View className="border-b border-gray-300 dark:border-gray-600 pb-6 mb-6">
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            13. Data Protection Officer & Grievance Officer
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed`}
          >
            <B>Data Protection Officer</B>
            {"\n"}Email: <Text className={primaryColor}>dpo@feminiq.in</Text>
            {"\n"}Phone: +91-XXXXXXXXXX
            {"\n"}For grievances related to data protection, privacy, or
            platform usage, please contact our DPO or Grievance Officer.
          </Text>
        </View>

        <View>
          <Text
            className={`mb-2 text-lg font-poppins-semibold ${primaryColor}`}
          >
            14. Changes to Terms and Conditions
          </Text>
          <Text
            className={`text-base font-poppins-regular ${textColor} leading-relaxed mb-12`}
          >
            • We may update these Terms and Conditions from time to time
            {"\n"}• Updated terms will be published on the platform with a
            revised effective date
            {"\n"}• Your continued use of the platform after updates constitutes
            acceptance of the revised terms
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Terms;
