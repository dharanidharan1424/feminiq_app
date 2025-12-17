import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const faqItems = [
  {
    question: "What is the purpose of the app?",
    answer:
      "Feminiq helps users find, book, and review services. It streamlines booking and support for personal service providers.",
  },
  {
    question: "How do I delete an account?",
    answer:
      "Navigate to Profile > Delete Account and follow the on-screen instructions, including selecting your reasons.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Browse available providers, select one, choose a service, and pick your schedule to make a booking.",
  },
  {
    question: "Can I reschedule or cancel a booking?",
    answer:
      "Yes. Go to 'My Bookings' in your profile and select the booking to reschedule or cancel following app prompts.",
  },
  {
    question: "How do I pay for services?",
    answer:
      "Payments can be made via integrated online payment options during booking, or in-person as chosen.",
  },
  {
    question: "How do I leave a review for a service provider?",
    answer:
      "After your service appointment, you can leave a review through the provider's profile or your completed bookings section.",
  },
  {
    question: "How is my personal information protected?",
    answer:
      "Feminiq follows strict privacy protocols and uses encryption to keep your data secure and private.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "Email feminiqcustomersupport@Feminiq.com or call 98123 00001 for any inquiries.",
  },
  {
    question: "How do I report a bug or technical issue?",
    answer:
      "Contact support via email or the app's feedback system from Profile > Help & Feedback.",
  },
  {
    question: "Can I edit or delete my review?",
    answer:
      "Yes, visit your profile's review section to edit or remove reviews as needed.",
  },
];

const Faq = () => {
  const { isDarkMode } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const headerTextColor = isDarkMode ? "#eee" : "#222";
  const textColor = isDarkMode ? "#eee" : "#222";
  const placeholderColor = isDarkMode ? "#999" : "#888";
  const answerTextColor = isDarkMode ? "#bbb" : "#555";

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: headerTextColor }]}>
          FAQ & Help
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer]}>
        <Ionicons
          name="search"
          size={18}
          color={placeholderColor}
          style={{ marginLeft: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={placeholderColor}
        />
      </View>

      {/* FAQ Accordion */}
      <View style={styles.faqList}>
        {filteredFaq.map((item, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
              activeOpacity={0.8}
            >
              <Text style={[styles.faqQuestion, { color: textColor }]}>
                {`${idx + 1}. ${item.question}`}
              </Text>
              <Ionicons
                name={openIndex === idx ? "chevron-up" : "chevron-down"}
                size={22}
                color="#FF5ACC"
              />
            </TouchableOpacity>
            {openIndex === idx && (
              <Text style={[styles.faqAnswer, { color: answerTextColor }]}>
                {item.answer}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Contact Support Section */}
      <View style={{ marginTop: 30 }}>
        <Text style={[styles.contactTitle, { color: textColor }]}>
          Contact Support
        </Text>
        <Text style={[styles.contactLabel, { color: answerTextColor }]}>
          Email:{" "}
          <Text style={styles.contactEmail}>
            feminiqcustomersupport@Feminiq.com
          </Text>
        </Text>
        <Text style={[styles.contactLabel, { color: answerTextColor }]}>
          Ph No: 98123 00001
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 12,
    marginBottom: 18,
    paddingHorizontal: 8,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  faqList: {
    marginTop: 6,
  },
  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 4,
    marginBottom: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
  },
  faqAnswer: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 21,
  },
  contactTitle: {
    marginTop: 20,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 17,
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 15,
    marginBottom: 3,
    fontFamily: "Poppins_400Regular",
  },
  contactEmail: {
    fontSize: 15,
    color: "#FF5ACC",
  },
});

export default Faq;
