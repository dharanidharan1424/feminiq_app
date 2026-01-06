import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Profile" }} />
            <Stack.Screen name="Faq" />
            <Stack.Screen name="Invite" />
            <Stack.Screen name="Report" />
            <Stack.Screen name="Update" />
            <Stack.Screen name="Payment" />
            <Stack.Screen name="Reviews" />
            <Stack.Screen name="Language" />
            <Stack.Screen name="Security" />
            <Stack.Screen name="BankDetails" />
            <Stack.Screen name="Cancellation" />
            <Stack.Screen name="Notification" />
        </Stack>
    );
}