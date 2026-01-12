import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
    question: "What is Feminiq and how does it work?",
    answer:
      "Feminiq is a beauty and wellness booking platform that connects you with professional Artists offering a wide range of services - including Makeup, Bridal Makeup, Manicure, Pedicure, Threading, Mehndi, and more. Simply browse available Artists, book your preferred service, and enjoy it at your home or preferred location.",
  },
  {
    question: "How do I Create an account?",
    answer:
      "Tap Create an Account in Log In, enter your details, verify your email, and start booking instantly.",
  },
  {
    question: "Can I reshedule or cancel my booking?",
    answer:
      "Yes. Go to My Bookings, select your appointment, and choose Reschedule or Cancel. Read the Cancellation and Reschedule Policy for further information.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We currently accept UPI, debit/credit cards, and net banking. Feminiq supports digital payments only at this time.",
  },
  {
    question: "How do I rate or review a service provider?",
    answer:
      "After your session, open the Artist Profile, scroll to the Reviews section, and share your feedback along with a star rating.",
  },
  {
    question: "How do I apply offers or promo code?",
    answer:
      "Enter your promo code at checkout before making the payment to apply your discount instantly.",
  },
  {
    question: "is my payment and data secure?",
    answer:
      "Absolutely! Feminiq uses end-to-end encryption and secure payment gateways for all transactions. Your personal information is stored safely and used only to improve our platform and user experience.",
  },
  {
    question: "can I book at a different address?",
    answer:
      "Yes. During booking, you can select an Alternate Address before making the payment.",
  },
  {
    question: "How do I report an issue?",
    answer:
      "Go to My Profile -> Report a Problem after logging in, or contact our support team directly through email.",
  },
  {
    question: "How do I report an issue with mybooking or about the Artist?",
    answer:
      "Click the three dots (⋮) on your booking card, choose Report, and describe the issue.",
  },
  {
    question: "What happen if the Artist is late or doesn't show up?",
    answer:
      "If your Artist is late or fails to arrive, you can report the issue from your booking. Our support team will help you resolve the issue.",
  },
  {
    question: "Do Artists bring their own tools and products?",
    answer:
      "Yes, all registered Feminiq Artists bring their own professional-grade tools and products to ensure hygiene and quality service.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach us anytime at support@feminiq.inYes, all registered Feminiq Artists bring their own professional-grade tools and products to ensure hygiene and quality service.",
  },
  {
    question: "Where is feminiq available?",
    answer:
      "Feminiq is currently available in Chennai. We’re expanding rapidly - stay tuned for updates on new locations!",
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
        <TouchableOpacity onPress={() => router.push("/Tabs")}>
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
            support@feminiq.in
          </Text>
        </Text>
        <Text style={[styles.contactLabel, { color: answerTextColor }]}>
          Ph No: +91 9600579857
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
