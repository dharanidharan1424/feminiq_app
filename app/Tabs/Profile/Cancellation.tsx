import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const Cancellation: React.FC = () => {
    const { isDarkMode } = useAuth();

    const backgroundColor = isDarkMode ? "#222" : "#fff";
    const textColor = isDarkMode ? "#eee" : "#222";

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
            >
                <View
                    style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={textColor}
                            style={{ marginRight: 10 }}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 22,
                            fontFamily: "Poppins_600SemiBold",
                            color: textColor,
                        }}
                    >
                        Cancellation Policy
                    </Text>
                </View>

                <View style={{ gap: 16 }}>
                    <Text style={{ fontFamily: "Poppins_400Regular", color: textColor, fontSize: 16, lineHeight: 24 }}>
                        Our cancellation policy is designed to be fair to both our customers and our service providers.
                    </Text>

                    <View style={{ backgroundColor: isDarkMode ? "#333" : "#f9f9f9", padding: 16, borderRadius: 12 }}>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", color: "#FF5ACC", fontSize: 18, marginBottom: 8 }}>
                            Standard Cancellation
                        </Text>
                        <Text style={{ fontFamily: "Poppins_400Regular", color: textColor, fontSize: 14 }}>
                            • Free cancellation up to 24 hours before the appointment.{"\n"}
                            • 50% charge for cancellations within 24 hours.{"\n"}
                            • 100% charge for no-shows or cancellations within 2 hours.
                        </Text>
                    </View>

                    <View style={{ backgroundColor: isDarkMode ? "#333" : "#f9f9f9", padding: 16, borderRadius: 12 }}>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", color: "#FF5ACC", fontSize: 18, marginBottom: 8 }}>
                            Refund Process
                        </Text>
                        <Text style={{ fontFamily: "Poppins_400Regular", color: textColor, fontSize: 14 }}>
                            Refunds will be processed to your original payment method within 5-7 business days.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Cancellation;
