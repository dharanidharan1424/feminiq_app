import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { images } from "@/constants";

interface PaymentMethod {
  label: string;
  value: string;
  icon: any;
  details: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    label: "UPI",
    value: "upi",
    icon: images.upi,
    details: "Pay using your UPI ID securely and instantly.",
  },
  {
    label: "Debit Card",
    value: "debit_card",
    icon: images.Debit_card,
    details: "Pay using your debit card.",
  },
  {
    label: "Credit Card",
    value: "credit_card",
    icon: images.Credit_card,
    details: "Pay using your credit card.",
  },
  {
    label: "Net Banking",
    value: "net_banking",
    icon: images.Net_Banking,
    details: "Pay securely via net banking.",
  },
];

const PaymentAccordion: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(
    null
  );

  // New state to control info modal visibility
  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);

  const openModal = (method: PaymentMethod) => {
    setCurrentMethod(method);
    setModalVisible(true);
  };

  return (
    <>
      <ScrollView
        style={{
          paddingHorizontal: 16,
          paddingTop: 24,
          backgroundColor: "white",
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Ionicons name="arrow-back" size={28} />
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Poppins_600SemiBold",
              marginLeft: 12,
            }}
          >
            Payment Methods
          </Text>
        </TouchableOpacity>

        <Text className="text-primary font-poppins-regular text-center italic mb-5 ">
          (Available Payment Methods)
        </Text>

        {/* Payment Methods List */}
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.value}
            className="flex-row items-center border border-gray-300 rounded-lg px-5 py-3 mb-4"
            activeOpacity={0.8}
            onPress={() => openModal(method)}
          >
            <Image
              source={method.icon}
              style={{ width: 40, height: 40, marginRight: 16 }}
              resizeMode="contain"
            />
            <Text className="text-lg font-poppins-semibold">
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View
          className="px-10 flex-row items-center justify-center gap-3"
          style={{ marginTop: 12 }}
        >
          {/* Add Bank / UPI details button */}
          <TouchableOpacity
            className="flex-row  my-3 py-2 border gap-3 items-center justify-center rounded-full border-primary bg-primary/30"
            onPress={() => router.push("/Tabs/Profile/BankDetails")}
            style={{ flex: 1 }}
          >
            <Ionicons name="add-circle" color={"#ff5acc"} size={24} />
            <Text className="font-poppins-semibold text-center mt-1 text-primary">
              Add Bank / Upi details
            </Text>
          </TouchableOpacity>

          {/* Info icon button */}
          <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
            <Feather name="info" size={28} color="#ff5acc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Payment method modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 20,
              width: "100%",
              maxWidth: 350,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Image
              source={currentMethod?.icon}
              style={{ width: 80, height: 80, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {currentMethod?.label}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#555",
                textAlign: "center",
                fontFamily: "Poppins_400Regular",
                marginBottom: 24,
              }}
            >
              {currentMethod?.details ||
                "Thank you for choosing this payment method."}
            </Text>

            <Pressable
              style={{
                backgroundColor: "#ff5acc",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 25,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 16,
                }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Info modal for bank details explanation */}
      <Modal
        animationType="fade"
        transparent
        visible={infoModalVisible}
        statusBarTranslucent
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 350,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Why add Bank Details?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#555",
                fontFamily: "Poppins_400Regular",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              We require your bank details for refund purposes. Rest assured,
              your information will be encrypted and stored securely with the
              highest privacy standards.
            </Text>

            <Pressable
              style={{
                backgroundColor: "#ff5acc",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 25,
                alignSelf: "center",
              }}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 16,
                }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PaymentAccordion;
