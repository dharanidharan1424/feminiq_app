import { useAuth } from "@/context/UserContext";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/config/supabase";
import { router } from "expo-router";
import { Chase } from "react-native-animated-spinkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StaffChat {
  staff_id: number;
  staff_name: string;
  staff_image: string;
  last_message: string;
  last_message_id?: number; // Ensure this exists if returned
  last_timestamp: string;
  unread_count: number;
}

interface Staff {
  id: number;
  name: string;
  mobile_image_url: string;
  // other staff fields from your API
}

const formatDateLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();

  const dateStr = date.toDateString();
  const nowStr = now.toDateString();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (dateStr === nowStr) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Chats = () => {
  const { isDarkMode, profile } = useAuth();
  const [chatList, setChatList] = useState<StaffChat[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletedLastMessageIds, setDeletedLastMessageIds] = useState<
    Set<number>
  >(new Set());

  const DELETED_FOR_ME_KEY = "deletedMessagesForMe";

  const getDeletedForMe = async (): Promise<number[]> => {
    const data = await AsyncStorage.getItem(DELETED_FOR_ME_KEY);
    return data ? JSON.parse(data) : [];
  };

  const fetchChatList = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase.rpc("get_user_chat_list", {
      _user_id: profile.id,
    });

    if (error) {
      console.error("Error fetching chat list:", error);
    } else {
      // Save all chats
      setChatList(data);

      // Get locally deleted last message IDs
      const deletedIds = await getDeletedForMe();
      setDeletedLastMessageIds(new Set(deletedIds));
    }
  };

  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://feminiq-backend.onrender.com/api/get-staffs"
        );
        const json = await response.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setStaffs(json.data);
        } else {
          setStaffs([]);
        }
      } catch (error) {
        console.error("Failed to fetch staffs:", error);
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, []);

  useEffect(() => {
    fetchChatList();
  }, []);

  const mergedChats = chatList.map((chat) => {
    const staffInfo = staffs.find((s) => s.id === chat.staff_id);

    return {
      ...chat,
      staffName: staffInfo?.name || "Unknown",
      staffAvatar: staffInfo?.mobile_image_url || "",
    };
  });

  const onPress = (
    staff: Staff & { id: number; name: string; mobile_image_url: string }
  ) => {
    if (!profile?.id || !staff) return;
    router.push({
      pathname: "/Tabs/Inbox/Chat", // your chat screen route
      params: {
        userId: profile.id,
        userType: "user", // or 'staff' if applicable
        chatWithId: staff.id,
        chatWithType: "staff",
        staffName: staff.name,
        staffImage: staff.mobile_image_url,
      },
    });
  };

  if (loading) {
    return <Chase color="#FF5AC" size={30} />;
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        paddingHorizontal: 16,
        marginTop: 10,
        backgroundColor: isDarkMode ? "#222" : "#fff",
      }}
    >
      {mergedChats.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text
            style={{
              color: isDarkMode ? "#bbb" : "#444",
              fontSize: 14,
            }}
            className="font-poppins-regular"
          >
            No chats available
          </Text>
        </View>
      ) : (
        mergedChats.map(
          ({
            staff_id,
            staffName,
            staffAvatar,
            last_message,
            last_message_id,
            last_timestamp,
            unread_count,
          }) => {
            const isLastMessageDeleted = last_message_id
              ? deletedLastMessageIds.has(last_message_id)
              : false;

            return (
              <TouchableOpacity
                key={staff_id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: isDarkMode ? "#333" : "#e5e7eb",
                }}
                onPress={() =>
                  onPress({
                    id: staff_id,
                    name: staffName,
                    mobile_image_url: staffAvatar,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    source={{ uri: staffAvatar }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    resizeMode="cover"
                  />
                  <View style={{ marginLeft: 12, maxWidth: 250 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        color: isDarkMode ? "#fff" : "#000",
                      }}
                    >
                      {staffName}
                    </Text>
                    {!isLastMessageDeleted ? (
                      <Text
                        style={{
                          color: isDarkMode ? "#9CA3AF" : "#6B7280",
                          fontSize: 14,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {last_message}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontStyle: "italic",
                          color: isDarkMode ? "#777" : "#bbb",
                          fontSize: 14,
                        }}
                      >
                        Message deleted
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      color: isDarkMode ? "#6B7280" : "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    {formatDateLabel(last_timestamp)}
                  </Text>
                  {unread_count > 0 && (
                    <View
                      style={{
                        backgroundColor: "#EC4899",
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginTop: 4,
                        minWidth: 22,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        {unread_count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }
        )
      )}
    </ScrollView>
  );
};

export default Chats;
