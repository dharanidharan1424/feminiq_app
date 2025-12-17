import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  BackHandler,
  Modal,
} from "react-native";

import { supabase } from "@/config/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parse } from "@babel/core";

interface Message {
  is_read: any;
  id: number;
  sender_id: number;
  sender_type: "user" | "staff";
  message: string;
  timestamp: string;
}

interface ChatParams {
  userId: string;
  userType: "user" | "staff";
  chatWithId: string;
  chatWithType: "user" | "staff";
  staffName: string;
  staffImage: string;
  staffData: any;
}

type GroupedItem =
  | { type: "date"; id: string; label: string }
  | { type: "message"; data: Message };

const formatDateLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const dateStr = date.toDateString();
  const nowStr = now.toDateString();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (dateStr === nowStr) return "Today";
  else if (diffDays === 1) return "Yesterday";
  else
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
};

const groupMessagesByDate = (messages: Message[]): GroupedItem[] => {
  const groupedItems: GroupedItem[] = [];
  let lastDateLabel = "";

  messages.forEach((msg) => {
    const dateLabel = formatDateLabel(msg.timestamp);

    if (dateLabel !== lastDateLabel) {
      groupedItems.push({
        type: "date",
        id: `date_${dateLabel}_${msg.id}`,
        label: dateLabel,
      });
      lastDateLabel = dateLabel;
    }

    groupedItems.push({ type: "message", data: msg });
  });

  return groupedItems;
};

const Chat = () => {
  const params = useLocalSearchParams<ChatParams>();

  const userId = parseInt(params.userId as string, 10);
  const userType = params.userType;
  const chatWithId = parseInt(params.chatWithId as string, 10);
  const chatWithType = params.chatWithType;
  const staffName = params.staffName;
  const staffImage = params.staffImage;
  const staffData = params.staffData ? JSON.parse(params.staffData) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const DELETED_FOR_ME_KEY = "deletedMessagesForMe";

  const getDeletedForMe = async (): Promise<number[]> => {
    const data = await AsyncStorage.getItem(DELETED_FOR_ME_KEY);
    return data ? JSON.parse(data) : [];
  };

  const addDeletedForMe = async (id: number) => {
    const list = await getDeletedForMe();
    if (!list.includes(id)) {
      list.push(id);
      await AsyncStorage.setItem(DELETED_FOR_ME_KEY, JSON.stringify(list));
    }
  };

  const clearAllForMe = async () => {
    try {
      // Get all message IDs currently loaded
      const allMessageIds = messages.map((msg) => msg.id);

      // Get previously deleted IDs, add new ones
      const deletedIds = await getDeletedForMe();
      const newDeletedIds = Array.from(
        new Set([...deletedIds, ...allMessageIds])
      );

      // Save updated deleted message IDs to AsyncStorage
      await AsyncStorage.setItem(
        DELETED_FOR_ME_KEY,
        JSON.stringify(newDeletedIds)
      );

      // Update local state to remove all messages
      setMessages([]);

      // Optionally exit selection mode and clear selected messages
      setSelectionMode(false);
      setSelectedMessageIds([]);
      setShowClearConfirmModal(false);
    } catch (error) {
      console.error("Failed to clear all messages for me:", error);
    }
  };

  const deleteForMe = async (messageId: number) => {
    await addDeletedForMe(messageId);
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const deleteForEveryone = async (messageId: number) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);
    if (!error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${chatWithId}),and(sender_id.eq.${chatWithId},receiver_id.eq.${userId})`
      )
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Failed to fetch messages:", error);
    } else if (data) {
      const deletedIds = await getDeletedForMe();
      setMessages(data.filter((msg) => !deletedIds.includes(msg.id)));
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender_type: payload.new.sender_type,
            message: payload.new.message,
            timestamp: payload.new.timestamp,
            is_read: payload.new.is_read,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, messages]);

  const groupedMessages = groupMessagesByDate(messages);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: userId,
        sender_type: userType,
        receiver_id: chatWithId,
        receiver_type: chatWithType,
        message: input.trim(),
        is_read: false,
      },
    ]);

    if (error) {
      console.error("Failed to send message:", error);
    } else {
      setInput("");
    }
  };

  useEffect(() => {
    const markMessagesRead = async () => {
      if (!userId || !chatWithId) return;

      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", userId)
        .eq("sender_id", chatWithId)
        .eq("is_read", false);

      if (error) {
        console.error("Failed to mark messages read:", error);
      }
    };

    markMessagesRead();
  }, [userId, chatWithId, messages]);

  useEffect(() => {
    const backAction = () => {
      router.push("/Tabs/Inbox");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Check if any selected message is received (not sent by user)
  const anySelectedIsReceived = selectedMessageIds.some(
    (id) => messages.find((m) => m.id === id)?.sender_id !== userId
  );

  const renderItem = ({ item }: { item: GroupedItem }) => {
    if (item.type === "date") {
      return (
        <View className="items-center my-2">
          <Text className="text-gray-500 bg-gray-200 px-3 py-1 rounded-lg font-semibold text-sm">
            {item.label}
          </Text>
        </View>
      );
    }

    const msg = item.data;
    const isSender = msg.sender_id === userId && msg.sender_type === userType;
    const messageRead = msg.is_read;
    const isSelected = selectedMessageIds.includes(msg.id);
    const toggleSelection = (msgId: number) => {
      setSelectedMessageIds((prev) => {
        const newSelected = prev.includes(msgId)
          ? prev.filter((id) => id !== msgId)
          : [...prev, msgId];

        if (newSelected.length === 0) {
          setSelectionMode(false);
        }

        return newSelected;
      });
    };

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (!selectionMode) setSelectionMode(true);
          toggleSelection(msg.id);
        }}
        onPress={() => {
          if (selectionMode) {
            toggleSelection(msg.id);
          }
        }}
        className={`w-full flex-row px-2 my-1 ${
          selectionMode && isSelected ? "bg-primary/30" : ""
        }`}
        style={{ justifyContent: isSender ? "flex-end" : "flex-start" }}
      >
        <TouchableOpacity
          onLongPress={() => {
            if (!selectionMode) setSelectionMode(true);
            toggleSelection(msg.id);
          }}
          onPress={() => {
            if (selectionMode) {
              toggleSelection(msg.id);
            }
          }}
          activeOpacity={0.8}
          className={`flex-row items-end gap-2 max-w-4/5 rounded-xl p-3  ${
            isSender ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-poppins-regular text-base ${
              isSender ? "text-white" : "text-black"
            }`}
          >
            {msg.message}
          </Text>

          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className={`text-[8px] ${isSender ? "text-white" : "text-black"}`}
          >
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isSender && (
            <Ionicons
              name={messageRead ? "checkmark-done" : "checkmark"}
              size={16}
              color={messageRead ? "#3b82f6" : "white"}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
      className="flex-1 bg-white px-1"
    >
      <View className="flex-row items-center justify-between border-b border-gray-300 py-2 px-3">
        <View className="flex-row items-center">
          <Ionicons
            onPress={() => {
              if (params.staffData) {
                router.push({
                  pathname: "/Details",
                  params: { ...staffData },
                });
              } else {
                router.push("/Tabs/Inbox");
              }
            }}
            name="arrow-back"
            size={25}
            className="mr-2 text-black"
          />
          <Image
            source={{ uri: staffImage }}
            className="w-12 h-12 rounded-full"
          />
          <Text className="ml-2 text-black font-poppins-medium text-lg">
            {staffName}
          </Text>
          <MaterialIcons
            name="verified"
            color={"#3B82F6"}
            size={20}
            className="ml-1"
          />
        </View>
        <View className="mr-2 flex-row items-center gap-4">
          {selectionMode ? (
            <FontAwesome6
              name="trash-can"
              color={"#FF5ACC"}
              size={20}
              onPress={() => setShowDeleteModal(true)}
            />
          ) : (
            <>
              <Ionicons name="call" color={"#FF5ACC"} size={20} />
              <MaterialCommunityIcons
                name="dots-vertical"
                color={"#FF5ACC"}
                size={26}
                onPress={() => setShowDropdown((prev) => !prev)}
              />
            </>
          )}
        </View>
      </View>
      {showDropdown && (
        <View className="absolute top-14 right-3 bg-white rounded-md shadow-lg z-50 w-40 p-2">
          <TouchableOpacity
            className="py-2 px-3 border-b flex-row items-center gap-2 border-gray-200 hover:bg-gray-200"
            onPress={() => {
              setShowDropdown(false);
              setShowClearConfirmModal(true);
            }}
          >
            <FontAwesome5 name="trash" color={"red"} size={15} />
            <Text className="text-base text-red-600 font-poppins-medium">
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={groupedMessages}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.type === "date" ? item.id : item.data.id.toString()
        }
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      />

      <View className="flex-row p-3 border-t border-gray-300 bg-white">
        <TextInput
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
          className="flex-1 border border-gray-300 rounded-2xl px-4 py-4 text-base font-poppins-regular"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={sendMessage}
          className="rounded-full px-4 justify-center items-center ml-3"
        >
          <Ionicons name="send" size={20} color={"#ff5acc"} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-lg font-poppins-semibold mb-4 text-center">
              Delete Messages
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-lg py-3 mb-4"
              onPress={() => {
                selectedMessageIds.forEach((id) => deleteForMe(id));
                setShowDeleteModal(false);
                setSelectionMode(false);
                setSelectedMessageIds([]);
              }}
            >
              <Text className="text-white text-center text-base font-poppins-medium">
                Delete for Me
              </Text>
            </TouchableOpacity>

            {!anySelectedIsReceived && (
              <TouchableOpacity
                className="bg-primary rounded-lg py-3 mb-4"
                onPress={async () => {
                  for (const id of selectedMessageIds) {
                    await deleteForEveryone(id);
                  }
                  setShowDeleteModal(false);
                  setSelectionMode(false);
                  setSelectedMessageIds([]);
                }}
              >
                <Text className="text-white text-center text-base font-poppins-medium">
                  Delete for Everyone
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="border border-gray-300 rounded-lg py-3"
              onPress={() => {
                setShowDeleteModal(false);
                setSelectionMode(false);
                setSelectedMessageIds([]);
              }}
            >
              <Text className="text-center text-base font-poppins-regular text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showClearConfirmModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowClearConfirmModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-xl font-poppins-semibold mb-5 text-center">
              Clear All Messages?
            </Text>
            <Text className="text-center font-poppins-regular mb-6 text-gray-700">
              This will remove all messages in this chat. Are you sure you want
              to continue?
            </Text>
            <TouchableOpacity
              className="border-red-500 border bg-red-500/50 rounded-lg py-3 mb-4"
              onPress={clearAllForMe}
            >
              <Text className="text-white text-center text-base font-poppins-semibold">
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg py-3"
              onPress={() => setShowClearConfirmModal(false)}
            >
              <Text className="text-center text-base font-poppins-regular text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Chat;
