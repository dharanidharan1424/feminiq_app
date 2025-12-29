import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/UserContext";
import { Chase } from "react-native-animated-spinkit";

interface ReportBookingModalProps {
    visible: boolean;
    onClose: () => void;
    booking: {
        orderId?: string | number;
        service?: string;
        staff?: string;
        location?: string;
    };
}

export const ReportBookingModal: React.FC<ReportBookingModalProps> = ({
    visible,
    onClose,
    booking,
}) => {
    const { profile } = useAuth();
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!subject || !description) {
            Alert.alert("Please fill out all required fields.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("https://feminiq-backend.onrender.com/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: profile?.id,
                    user_name: profile?.fullname,
                    report_type: "Order Issue",
                    subject,
                    message: description,
                    order_ref: booking?.orderId,
                }),
            });
            const json = await res.json();
            if (json.success) {
                Alert.alert("Success", "Report submitted successfully!");
                setSubject("");
                setDescription("");
                onClose();
            } else {
                Alert.alert("Error", json.error || "Error submitting report.");
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Error", "Network error.");
        }
        setLoading(false);
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/40">
                <View className="w-11/12 max-w-md bg-white rounded-2xl p-5 shadow-lg">
                    <Pressable className="absolute top-4 right-4 z-10" onPress={onClose}>
                        <Text className="text-2xl text-gray-400">×</Text>
                    </Pressable>

                    <Text className="text-2xl font-poppins-semibold text-center mb-4 text-black">
                        Report Booking Issue
                    </Text>

                    <View className="bg-gray-100 rounded-lg p-4 mb-4">
                        <Text className="text-base font-poppins-regular mb-1">
                            <Text className="font-poppins-medium">Order ID: </Text>
                            {booking.orderId}
                        </Text>
                        <Text className="text-base font-poppins-regular mb-1">
                            <Text className="font-poppins-medium">Service: </Text>
                            {booking.service}
                        </Text>
                        <Text className="text-base font-poppins-regular mb-1">
                            <Text className="font-poppins-medium">Staff: </Text>
                            {booking.staff}
                        </Text>
                        <Text className="text-base font-poppins-regular">
                            <Text className="font-poppins-medium">Location: </Text>
                            {booking.location}
                        </Text>
                    </View>

                    <Text className="mb-1 text-gray-700 font-poppins-semibold">
                        Subject
                    </Text>
                    <TextInput
                        className="border rounded-lg px-4 py-2 mb-3 bg-gray-50 text-base font-poppins-regular"
                        placeholder="Brief summary"
                        placeholderTextColor="#888"
                        value={subject}
                        onChangeText={setSubject}
                    />

                    <Text className="mb-1 text-gray-700 font-poppins-semibold">
                        Describe the issue
                    </Text>
                    <TextInput
                        className="border rounded-lg px-4 py-2 mb-4 bg-gray-50 text-base h-20 font-poppins-regular"
                        placeholder="Provide details"
                        placeholderTextColor="#888"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <TouchableOpacity
                        className={`bg-pink-400 rounded-lg py-3 items-center ${loading ? "opacity-60" : ""}`}
                        disabled={loading}
                        onPress={handleSubmit}
                    >
                        {loading ? (
                            <Chase color="#fff" size={20} />
                        ) : (
                            <Text className="text-white font-poppins-semibold text-lg">
                                Send Report
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
