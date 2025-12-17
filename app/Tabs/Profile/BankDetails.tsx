/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/UserContext";
import { encryptData, decryptData } from "@/utils/Encryption";

const API_URL = "https://feminiq-backend.onrender.com/bank";

const isValidIfsc = (ifsc: string) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim());
const isValidUpi = (upi: string) => upi.trim().length > 0;
const isValidAccount = (acc: string) => acc.trim().length >= 6;

const BankUpiFormScreen: React.FC = () => {
  const { profile } = useAuth();

  const [upiId, setUpiId] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [validIfsc, setValidIfsc] = useState<boolean | null>(null);
  const [verifyingIfsc, setVerifyingIfsc] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [showAccount, setShowAccount] = useState<boolean>(true);

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const validUpi = isValidUpi(upiId);
  const validAccount = isValidAccount(accountNumber);

  const verifyIfsc = async () => {
    if (!isValidIfsc(ifscCode)) {
      setValidIfsc(false);
      setBankName("");
      setBranchName("");
      return;
    }
    setVerifyingIfsc(true);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${ifscCode.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setBankName(data.BANK || "");
        setBranchName(data.BRANCH || "");
        setValidIfsc(true);
      } else {
        setBankName("");
        setBranchName("");
        setValidIfsc(false);
      }
    } catch (e) {
      setBankName("");
      setBranchName("");
      setValidIfsc(false);
    } finally {
      setVerifyingIfsc(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) return;
      try {
        const res = await fetch(`${API_URL}/${profile.id}`);
        const data = await res.json();
        if (data.status === "success") {
          const d = data.data;

          setUpiId(decryptData(d.upi_id) || "");
          setBankName(decryptData(d.bank_name) || "");
          setBranchName(decryptData(d.branch_name) || "");
          setIfscCode(decryptData(d.ifsc_code) || "");
          setAccountNumber(decryptData(d.account_number) || "");
          setLastUpdated(
            d.updated_at
              ? new Date(d.updated_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          );
          if (isValidIfsc(d.ifsc_code || "")) {
            await verifyIfsc();
          } else {
            setValidIfsc(null);
          }
        }
      } catch {}
    };
    loadData();
  }, [profile?.id]);

  const handleSubmit = async () => {
    if (!validUpi || !bankName || !branchName || !validAccount) {
      setValidationMessage(
        "Please ensure all fields are correctly filled and verified."
      );
      setShowValidationModal(true);
      return;
    }
    if (!validIfsc) {
      setValidationMessage("Please verify the IFSC Code.");
      setShowValidationModal(true);
      return;
    }

    setLoading(true);
    try {
      const encUpi = encryptData(upiId);
      const encBank = encryptData(bankName);
      const encBranch = encryptData(branchName);
      const encIfsc = encryptData(ifscCode);
      const encAccount = encryptData(accountNumber);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upi_id: encUpi,
          bank_name: encBank,
          branch_name: encBranch,
          ifsc_code: encIfsc,
          account_number: encAccount,
          user_id: profile?.id,
          user_name: profile?.name,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (data.status === "success") {
        setSuccessModal(true);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const maskedAccountNumber = accountNumber
    ? accountNumber.slice(0, -4).replace(/./g, "*") + accountNumber.slice(-4)
    : "";

  const getValidation = (
    valid: boolean | null
  ): { borderColor: string; icon?: keyof typeof Ionicons.glyphMap } => {
    if (valid === null) return { borderColor: "gray" };
    return valid
      ? { borderColor: "green", icon: "checkmark-circle" }
      : { borderColor: "red", icon: "close-circle" };
  };

  const ifscValidation = getValidation(validIfsc);
  const upiValidation = getValidation(validUpi);
  const accountValidation = getValidation(validAccount);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="border-b border-gray-300 flex-row items-center py-3 px-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-2">
            <Ionicons name="chevron-back" size={24} color="#FF5ACC" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-gray-600 font-poppins-semibold text-lg">
            🏦 Bank / UPI Details
          </Text>
        </View>

        <View className="my-7 rounded-xl border border-gray-300 p-6 shadow-md bg-white mx-4">
          {/* IFSC + Verify */}
          <Text className="mb-2 font-poppins-semibold text-gray-700">
            IFSC Code *
          </Text>
          <View
            className={`flex-row items-center rounded-lg border px-3 py-2 mb-4 ${
              ifscValidation.borderColor === "green"
                ? "border-green-500"
                : ifscValidation.borderColor === "red"
                  ? "border-red-500"
                  : "border-gray-300"
            }`}
          >
            <TextInput
              className="flex-1 font-poppins-regular py-1"
              placeholder="IFSC Code"
              autoCapitalize="characters"
              value={ifscCode}
              onChangeText={(text) => {
                setIfscCode(text.toUpperCase());
                setValidIfsc(null);
                setBankName("");
                setBranchName("");
              }}
              editable={!loading}
            />
            {!verifyingIfsc ? (
              <TouchableOpacity
                disabled={!isValidIfsc(ifscCode) || loading}
                onPress={verifyIfsc}
                className={`ml-3 rounded-md px-4 py-1 ${
                  isValidIfsc(ifscCode) ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <Text className="text-white font-poppins-semibold">Verify</Text>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator
                size="small"
                color="#4CAF50"
                style={{ marginLeft: 8 }}
              />
            )}
            {ifscValidation.icon && !verifyingIfsc && (
              <Ionicons
                name={ifscValidation.icon}
                size={20}
                color={ifscValidation.borderColor}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>

          {/* Bank Name (read-only) */}
          <Text className="mb-2 font-poppins-semibold text-gray-700">
            Bank Name *
          </Text>
          <View className="mb-4 rounded-lg border border-gray-300 bg-gray-100 p-3 ">
            <Text
              className={`${bankName ? "text-black font-poppins-regular" : "text-gray-400"} text-base`}
            >
              {bankName || "Auto-filled after IFSC verification"}
            </Text>
          </View>

          {/* Branch Name (read-only) */}
          <Text className="mb-2 font-poppins-semibold text-gray-700">
            Branch Name *
          </Text>
          <View className="mb-4 rounded-lg border border-gray-300 bg-gray-100 p-3">
            <Text
              className={`${branchName ? "text-black font-poppins-regular " : "text-gray-400"} text-base`}
            >
              {branchName || "Auto-filled after IFSC verification"}
            </Text>
          </View>

          {/* Account Number with eye toggle */}
          <Text className="mb-2 font-poppins-semibold text-gray-700">
            Account Number *
          </Text>
          <View
            className={`flex-row items-center rounded-lg border px-3 py-2 mb-6 ${
              accountValidation.borderColor === "green"
                ? "border-green-500"
                : accountValidation.borderColor === "red"
                  ? "border-red-500"
                  : "border-gray-300"
            }`}
          >
            <TextInput
              className="flex-1  font-poppins-regular py-1"
              keyboardType="number-pad"
              placeholder="Account Number"
              maxLength={20}
              editable={!loading}
              value={showAccount ? accountNumber : maskedAccountNumber}
              onChangeText={(text) => {
                // Only digits allowed
                const numeric = text.replace(/\D/g, "");
                setAccountNumber(numeric);
              }}
              secureTextEntry={false}
            />
            <TouchableOpacity onPress={() => setShowAccount(!showAccount)}>
              <Ionicons
                name={showAccount ? "eye" : "eye-off"}
                size={24}
                color="#666"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
            {accountValidation.icon && (
              <Ionicons
                name={accountValidation.icon}
                size={20}
                color={accountValidation.borderColor}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>

          {/* UPI ID */}
          <Text className="mb-2 font-poppins-semibold text-gray-700">
            UPI ID *
          </Text>
          <View
            className={`flex-row items-center rounded-lg border px-3 py-2 mb-4 ${
              upiValidation.borderColor === "green"
                ? "border-green-500"
                : upiValidation.borderColor === "red"
                  ? "border-red-500"
                  : "border-gray-300"
            }`}
          >
            <TextInput
              className="flex-1 py-1 font-poppins-regular"
              placeholder="UPI"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
              editable={!loading}
            />
            {upiValidation.icon && (
              <Ionicons
                name={upiValidation.icon}
                size={20}
                color={upiValidation.borderColor}
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${
              loading ? "bg-green-400" : "bg-green-600"
            }`}
          >
            <Text className="text-white font-poppins-semibold text-lg">
              {loading ? "Saving..." : "Update Details"}
            </Text>
          </TouchableOpacity>

          {/* Last Updated */}
          <Text className="mt-4 text-center text-gray-400 text-xs font-poppins-regular">
            Last updated: {lastUpdated || "-"}
          </Text>
        </View>
      </ScrollView>

      {/* Success Modal */}
      {successModal && (
        <View className="absolute inset-0 flex-1 bg-black/40 z-50 justify-center items-center">
          <View className="bg-white p-10 rounded-3xl w-80 shadow-lg items-center">
            <Ionicons name="checkmark-circle" size={58} color="#13b94c" />
            <Text className="font-poppins-semibold text-2xl text-green-700 mt-3">
              Success
            </Text>
            <Text className="mt-3 mb-2 text-base text-center font-poppins-regular text-gray-800">
              Bank/UPI details updated successfully.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
                router.back();
              }}
              className="mt-4 bg-green-600 rounded-xl px-9 py-3"
            >
              <Text className="text-white font-poppins-semibold text-base">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
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
              maxWidth: 400,
              alignItems: "center",
            }}
          >
            <Ionicons name="alert-circle" size={50} color={"red"} />
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 18,
                marginVertical: 12,
              }}
            >
              Validation Error
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {validationMessage}
            </Text>
            <Pressable
              onPress={() => setShowValidationModal(false)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "red",
                borderRadius: 8,
              }}
            >
              <Text
                style={{ color: "white", fontFamily: "Poppins_600SemiBold" }}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default BankUpiFormScreen;
