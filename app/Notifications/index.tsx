import React, { useEffect, useState, useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/UserContext";
import { router } from "expo-router";
import { Chase } from "react-native-animated-spinkit";

// Notification type description
type NotificationType = {
  id: number;
  user_id: number;
  message: string;
  type?: string | null;
  is_read: 0 | 1;
  created_at: string;
};

// Icon/color with tailwind
const iconMap: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; twBg: string; twTone: string }
> = {
  payment: { icon: "card", twBg: "bg-blue-500", twTone: "bg-blue-50" },
  cancel: { icon: "close", twBg: "bg-red-500", twTone: "bg-red-50" },
  "reschedule-request": {
    icon: "time",
    twBg: "bg-yellow-400",
    twTone: "bg-yellow-50",
  },
  offer: { icon: "pricetag", twBg: "bg-emerald-500", twTone: "bg-emerald-50" },
  refund: { icon: "card", twBg: "bg-red-500", twTone: "bg-red-50" },
  order: { icon: "add-circle", twBg: "bg-purple-500", twTone: "bg-purple-50" },
  setup: { icon: "person", twBg: "bg-green-500", twTone: "bg-green-50" },
  booking: { icon: "calendar", twBg: "bg-pink-400", twTone: "bg-pink-50" },
  default: { icon: "notifications", twBg: "bg-pink-400", twTone: "bg-gray-50" },
};
// Split bold title/subtitle for message
const splitMessage = (message: string) => {
  const match = message.match(/^(.+?[!.])\s(.*)$/);
  if (match) {
    return { title: match[1], subtitle: match[2] };
  }
  return { title: message, subtitle: "" };
};

// Section date label
const formatDateSection = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function removeEmoji(str: string): string {
  return str
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])+/g,
      ""
    )
    .trim();
}

const NotificationCard = ({ type, message, created_at }: NotificationType) => {
  const { icon, twBg, twTone } = iconMap[type as string] || iconMap["default"];
  const { title, subtitle } = splitMessage(removeEmoji(message));
  return (
    <View
      className={`flex-row items-center rounded-xl p-4 mb-3 shadow-md ${twTone}`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${twBg}`}
      >
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-poppins-medium text-base text-gray-800">
          {title}
        </Text>
        {subtitle.length > 0 && (
          <Text className="text-xs text-gray-500 mt-1 font-poppins-regular">
            {subtitle}
          </Text>
        )}
        <Text className="text-[11px] font-poppins-regular text-gray-400 mt-2">
          {new Date(created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
};

const tabs = [
  { key: "all", label: "All" },
  { key: "offer", label: "Offers" },
  { key: "payment", label: "Payments" },
  { key: "cancel", label: "Cancels" },
  { key: "reschedule-request", label: "Reschedules" },
  { key: "others", label: "Others" },
];

const NotificationHistory = () => {
  const { isDarkMode, profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only trigger when notifications are fetched and user is known
    if (profile?.id && notifications.length > 0) {
      fetch("https://feminiq-backend.onrender.com/notification/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, is_read: 1 }))
          );
        })
        .catch(console.error);
    }
  }, [profile?.id, notifications.length]);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    fetch(`https://feminiq-backend.onrender.com/notification/${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setNotifications(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "others")
      return notifications.filter(
        (n) =>
          ![
            "payment",
            "cancel",
            "reschedule-request",
            "refund",
            "order",
            "setup",
            "booking",
            "offer",
          ].includes(n.type || "")
      );
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationType[]> = {};
    filteredNotifications.forEach((notif) => {
      const section = formatDateSection(notif.created_at);
      if (!groups[section]) groups[section] = [];
      groups[section].push(notif);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      const dateA =
        a === "Today"
          ? new Date()
          : a === "Yesterday"
            ? new Date(new Date().setDate(new Date().getDate() - 1))
            : new Date(a);
      const dateB =
        b === "Today"
          ? new Date()
          : b === "Yesterday"
            ? new Date(new Date().setDate(new Date().getDate() - 1))
            : new Date(b);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredNotifications]);

  return (
    <SafeAreaView
      className={`${isDarkMode ? "bg-gray-900" : "bg-white"} flex-1`}
    >
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#eee" : "#222"}
          />
        </TouchableOpacity>
        <Text
          className={`ml-3 font-poppins-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-800"}`}
        >
          Notification History
        </Text>
      </View>

      <View>
        <ScrollView
          className=" mt-3 mb-3"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              className={`px-4 py-2 mx-2 rounded-full border ${
                filter === tab.key
                  ? "bg-pink-400 border-pink-400"
                  : "border-pink-400"
              }`}
            >
              <Text
                className={`font-poppins-semibold ${filter === tab.key ? "text-white" : "text-pink-400"}`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Chase size={50} color="#ff5acc" style={{ marginTop: 50 }} />
        </View>
      ) : groupedNotifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-base italic text-gray-400">
            No notifications found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          keyExtractor={([section]) => section}
          contentContainerStyle={{ padding: 18 }}
          renderItem={({ item }) => {
            const [section, notifs] = item;
            return (
              <View className="mb-7">
                <Text
                  className={`mb-3 text-sm font-poppins-semibold ${isDarkMode ? "text-white " : "text-gray-800"}`}
                >
                  {section}
                </Text>
                {notifs.map((notif) => (
                  <NotificationCard key={notif.id} {...notif} />
                ))}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationHistory;
