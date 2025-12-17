import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const friendsList = [
  { id: "1", name: "Sara", phone: "+91 98111 10001" },
  { id: "2", name: "Gowri", phone: "+91 98111 10002" },
  { id: "3", name: "Mom", phone: "+91 98111 10003" },
  { id: "4", name: "Divya", phone: "+91 98111 10004" },
  { id: "5", name: "Arjun", phone: "+91 98111 10005" },
  { id: "6", name: "Rohini", phone: "+91 98111 10006" },
  { id: "7", name: "Sharon", phone: "+91 98111 10007" },
  { id: "8", name: "Danny", phone: "+91 98111 10008" },
  { id: "9", name: "Cristina", phone: "+91 98111 10009" },
  { id: "10", name: "Alex", phone: "+91 98111 10010" },
];

const Invite = () => {
  const { isDarkMode } = useAuth();
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const handleInvitePress = (id: string) => {
    if (!invitedIds.includes(id)) {
      setInvitedIds([...invitedIds, id]);
    }
  };

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c || "#FF5ACC";
  };

  const backgroundColor = isDarkMode ? "#222" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#222";
  const secondaryTextColor = isDarkMode ? "#aaa" : "#888";
  const borderColor = isDarkMode ? "#444" : "#eee";
  const invitedBtnBg = isDarkMode ? "#4A235A" : "#F8E8F6";
  const invitedTextColor = isDarkMode ? "#FF85C3" : "#FF5ACC";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Invite Friends
        </Text>
      </View>
      <FlatList
        data={friendsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isInvited = invitedIds.includes(item.id);
          return (
            <View
              style={[styles.friendRow, { borderBottomColor: borderColor }]}
            >
              <View
                style={[
                  styles.avatarLetterContainer,
                  { backgroundColor: stringToColor(item.name) },
                ]}
              >
                <Text style={styles.avatarLetter}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.friendName, { color: textColor }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.friendPhone, { color: secondaryTextColor }]}
                >
                  {item.phone}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.inviteBtn,
                  isInvited && { backgroundColor: invitedBtnBg },
                ]}
                onPress={() => handleInvitePress(item.id)}
                disabled={isInvited}
              >
                <Text
                  style={[
                    styles.inviteText,
                    isInvited && { color: invitedTextColor },
                  ]}
                >
                  {isInvited ? "Invited" : "Invite"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 10,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatarLetterContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  friendPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  inviteBtn: {
    backgroundColor: "#FF5ACC",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Invite;
