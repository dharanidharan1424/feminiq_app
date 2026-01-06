import { images } from "@/constants";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const callsData = [
  {
    id: 1,
    name: "Geetha Kumar",
    type: "Outgoing",
    date: "Mar 20, 2024",
    avatar: "https://example.com/avatar1.jpg",
  },
  {
    id: 2,
    name: "Pretty Parlour",
    type: "Incoming",
    date: "Mar 07, 2024",
    avatar: "https://example.com/avatar2.jpg",
  },
  {
    id: 3,
    name: "Your’s Mehndi",
    type: "Outgoing",
    date: "Feb 19, 2024",
    avatar: "https://example.com/avatar4.jpg",
  },
  {
    id: 4,
    name: "The Bridal's",
    type: "Missed",
    date: "Feb 12, 2024",
    avatar: "https://example.com/avatar3.jpg",
  },
  {
    id: 5,
    name: "Your’s Mehndi",
    type: "Outgoing",
    date: "Jan 23, 2024",
    avatar: "https://example.com/avatar4.jpg",
  },
  {
    id: 6,
    name: "She Nails",
    type: "Incoming",
    date: "Jan 05, 2024",
    avatar: "https://example.com/avatar5.jpg",
  },
  {
    id: 7,
    name: "Sharon’s Hair and Makeup",
    type: "Missed",
    date: "Dec 21, 2023",
    avatar: "https://example.com/avatar6.jpg",
  },
];

const typeBgMap: Record<string, string> = {
  Incoming: "#3B82F6", // blue-500
  Outgoing: "#22C55E", // green-500
  Missed: "#EF4444", // red-500
};

const Calls = () => {
  const { isDarkMode } = useAuth();

  return (
    <ScrollView
      style={{
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? "#222" : "#fff",
      }}
    >
      {callsData.map(({ id, name, type, date, avatar }) => (
        <View
          key={id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#333" : "#eee",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Image
              source={avatar ? { uri: avatar } : images.Female_img}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              resizeMode="cover"
            />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: isDarkMode ? "#fff" : "#000",
                }}
              >
                {name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: typeBgMap[type],
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? "#bbb" : "#4B5563",
                    marginRight: 8,
                  }}
                >
                  {type}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? "#777" : "#9CA3AF",
                  }}
                >
                  | {date}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="call" size={22} color="#F472B6" />
        </View>
      ))}
    </ScrollView>
  );
};

export default Calls;
