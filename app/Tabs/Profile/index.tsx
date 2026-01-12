import { useAuth } from "@/context/UserContext";
import {
    Feather,
    FontAwesome5,
    Ionicons,
    MaterialIcons
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";

console.log("PROFILE INDEX FILE LOADED 🔥");

// FAQ items for guest view
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
        question: "How do I contact customer support?",
        answer:
            "You can reach us anytime at support@feminiq.in",
    },
];




// Main ProfileIndex Component
export default function ProfileIndex() {
    const { token, profile } = useAuth();

    // TEMPORARY DEBUG - Remove this after testing
    // console.log("==========================================");
    // console.log("🔍 DEBUG - Token value:", token);
    // console.log("🔍 DEBUG - Token exists:", !!token);
    // console.log("🔍 DEBUG - Profile:", JSON.stringify(profile, null, 2));
    // console.log("==========================================");

    // console.log("🔍 ProfileIndex - Full token:", token);
    // console.log("🔍 ProfileIndex - Token type:", typeof token);
    // console.log("🔍 ProfileIndex - Profile data:", profile);
    // console.log("🔍 ProfileIndex - Will render:", !token ? "GuestProfileView" : "ProfileScreen");

    if (!token) {
        return <GuestProfileView />;
    }

    return <ProfileScreen />;
}

// Guest Profile View Component
const GuestProfileView: React.FC = () => {
    const { isDarkMode } = useAuth();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const backgroundColor = isDarkMode ? "#222" : "#fff";
    const textColor = isDarkMode ? "#eee" : "#222";
    const answerTextColor = isDarkMode ? "#bbb" : "#555";

    return (
        <ScrollView
            contentContainerStyle={[
                styles.guestContainer,
                { backgroundColor },
            ]}
        >
            <View style={styles.guestHeader}>
                <Ionicons
                    name="person-circle-outline"
                    size={80}
                    color={isDarkMode ? "#999" : "#ccc"}
                />
                <Text style={[styles.guestTitle, { color: textColor }]}>
                    Welcome to Feminiq
                </Text>
                <Text style={[styles.guestSubtitle, { color: answerTextColor }]}>
                    Sign up to access your profile and book services
                </Text>
            </View>

            <View style={styles.faqSection}>
                <Text style={[styles.faqSectionTitle, { color: textColor }]}>
                    Frequently Asked Questions
                </Text>
                {faqItems.map((item, idx) => (
                    <View key={idx}>
                        <TouchableOpacity
                            style={styles.faqItem}
                            onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.faqQuestion, { color: textColor }]}>
                                {item.question}
                            </Text>
                            <Ionicons
                                name={openIndex === idx ? "chevron-up" : "chevron-down"}
                                size={20}
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

            <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push("/Auth/SignUp")}
            >
                <Text style={styles.signupButtonText}>Sign up to create profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/Auth/Login")}
            >
                <Text style={[styles.loginButtonText, { color: "#FF5ACC" }]}>
                    Already have an account? Sign in
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// ProfileMenu Component
type ProfileMenuProps = {
    icon: React.ReactNode;
    text: string;
    rightText?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
    isDarkMode: boolean;
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
    icon,
    text,
    rightText,
    rightComponent,
    onPress,
    isDarkMode,
}) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
        <View style={{ flexDirection: "row" }}>
            {icon}
            <Text style={[styles.menuText, { color: isDarkMode ? "#fff" : "#222" }]}>
                {text}
            </Text>
        </View>
        {rightText ? (
            <Text
                style={[styles.menuRightText, { color: isDarkMode ? "#fff" : "#888" }]}
            >
                {rightText}
            </Text>
        ) : rightComponent ? (
            rightComponent
        ) : (
            <Ionicons
                name="chevron-forward"
                size={18}
                color={isDarkMode ? "#fff" : "#bbb"}
            />
        )}
    </TouchableOpacity>
);

// ProfileScreen Component
const ProfileScreen: React.FC = () => {
    const { profile, language, setIsDarkMode, isDarkMode } = useAuth();

    const toggleTheme = useCallback(() => {
        setIsDarkMode(!isDarkMode);
    }, [isDarkMode, setIsDarkMode]);

    return (
        <>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                style={[
                    styles.container,
                    { backgroundColor: isDarkMode ? "#222" : "#fff" },
                ]}
            >
                <View style={{ alignItems: "center", marginTop: 12 }}>
                    <View style={styles.avatarContainer}>
                        {profile?.image ? (
                            <Image source={{ uri: profile.image }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="people" size={32} color="#666" />
                            </View>
                        )}
                    </View>
                    <View
                        style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
                    >
                        <Text
                            style={[styles.fullName, { color: isDarkMode ? "#eee" : "#222" }]}
                        >
                            {profile?.fullname ?? "Unknown User"}
                        </Text>
                    </View>
                    <Text style={[styles.email, { color: isDarkMode ? "#bbb" : "#888" }]}>
                        {profile?.email ?? "unknown@yourdomain.com"}
                    </Text>
                </View>

                <View
                    style={[
                        styles.menuList,
                        { backgroundColor: isDarkMode ? "#222" : "#fff" },
                    ]}
                >
                    <ProfileMenu
                        icon={
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        isDarkMode={isDarkMode}
                        text="Edit Profile"
                        onPress={() => router.push("/Tabs/Profile/Update")}
                    />
                    <ProfileMenu
                        icon={
                            <MaterialIcons
                                name="star-outline"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Reviews"
                        onPress={() => router.push("/Tabs/Profile/Reviews")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <Ionicons
                                name="notifications-outline"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Notification"
                        onPress={() => router.push("/Tabs/Profile/Notification")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <FontAwesome5
                                name="credit-card"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Payment"
                        onPress={() => router.push("/Tabs/Profile/Payment")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <Feather
                                name="lock"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Security"
                        onPress={() => router.push("/Tabs/Profile/Security")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <Ionicons
                                name="moon-outline"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Dark Mode"
                        rightComponent={
                            <Switch value={isDarkMode} onValueChange={toggleTheme} />
                        }
                        isDarkMode={isDarkMode}
                    />

                    <ProfileMenu
                        icon={
                            <MaterialIcons
                                name="report"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Reports"
                        onPress={() => router.push("/Tabs/Profile/Report")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <Feather
                                name="shield"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Policies"
                        onPress={() => router.push("/Policies")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <Ionicons
                                name="help-circle-outline"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="FAQ & Help"
                        onPress={() => router.push("/Tabs/Profile/Faq")}
                        isDarkMode={isDarkMode}
                    />
                    <ProfileMenu
                        icon={
                            <Ionicons
                                name="share-outline"
                                size={18}
                                color={isDarkMode ? "#fff" : "#222"}
                            />
                        }
                        text="Invite Friends"
                        onPress={() => router.push("/Tabs/Profile/Invite")}
                        isDarkMode={isDarkMode}
                    />
                </View>
            </ScrollView>
        </>
    );
};

// STYLESHEET
const styles = StyleSheet.create({
    container: { backgroundColor: "#fff", flex: 1 },
    avatarContainer: { position: "relative", marginTop: 15 },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },
    avatarPlaceholder: {
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
    },
    fullName: { fontFamily: "Poppins_600SemiBold", fontSize: 20, color: "#222" },
    email: {
        fontSize: 15,
        color: "#888",
        fontFamily: "Poppins_400Regular",
        marginTop: 2,
    },
    menuList: {
        marginTop: 18,
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        paddingVertical: 2,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f3f3",
        paddingHorizontal: 4,
    },
    menuText: { fontSize: 16, marginLeft: 12, fontFamily: "Poppins_400Regular" },
    menuRightText: {
        color: "#888",
        fontFamily: "Poppins_400Regular",
        fontSize: 15,
    },

    // Guest View Styles
    guestContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    guestHeader: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    guestTitle: {
        fontSize: 24,
        fontFamily: "Poppins_600SemiBold",
        marginTop: 16,
        textAlign: "center",
    },
    guestSubtitle: {
        fontSize: 15,
        fontFamily: "Poppins_400Regular",
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    faqSection: {
        marginTop: 10,
        marginBottom: 30,
    },
    faqSectionTitle: {
        fontSize: 18,
        fontFamily: "Poppins_600SemiBold",
        marginBottom: 16,
    },
    faqItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    faqQuestion: {
        fontSize: 14,
        fontFamily: "Poppins_500Medium",
        flex: 1,
        paddingRight: 10,
    },
    faqAnswer: {
        fontSize: 13,
        fontFamily: "Poppins_400Regular",
        marginTop: 8,
        marginBottom: 12,
        lineHeight: 20,
        paddingLeft: 4,
    },
    signupButton: {
        backgroundColor: "#FF5ACC",
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 20,
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
    },
    loginButton: {
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 12,
    },
    loginButtonText: {
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
    },
});