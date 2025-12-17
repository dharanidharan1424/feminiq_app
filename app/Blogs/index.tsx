import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import BLOGS_OBJECT from "../../constants/Blogs.json";
import { router } from "expo-router";
import { useAuth } from "../../context/UserContext"; // Import your hook
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [search, setSearch] = useState("");
  const { isDarkMode } = useAuth();

  const BLOGS = Object.values(BLOGS_OBJECT);

  const filteredBlogs = BLOGS.filter(
    (blog) =>
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.author.toLowerCase().includes(search.toLowerCase()) ||
      blog.badge.toLowerCase().includes(search.toLowerCase()) ||
      blog.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}
      style={{ flex: 1 }}
    >
      {/* Back Arrow */}
      <View className={`${isDarkMode ? "bg-zinc-900" : "bg-white"} px-2 pt-1`}>
        <Ionicons
          name="arrow-back"
          size={25}
          color={isDarkMode ? "#fafafa" : "#222"}
          onPress={() => router.back()}
        />
      </View>
      {/* Title */}
      <Text
        className={`font-poppins-semibold text-primary`}
        style={{
          fontSize: 28,
          textAlign: "center",
          marginTop: 10,
          marginBottom: 12,
          color: isDarkMode ? "#ff5acc" : "#ff5acc",
        }}
      >
        Latest Blogs
      </Text>
      {/* Search Box */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: isDarkMode ? "#2a2a2e" : "#fafafa",
          borderRadius: 24,
          marginHorizontal: 8,
          paddingHorizontal: 16,
          alignItems: "center",
          elevation: isDarkMode ? 0 : 2,
          marginBottom: 24,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 12,
            fontSize: 13,
            color: isDarkMode ? "#fafafa" : "#444",
          }}
          className="font-poppins-regular"
          placeholder="Search blogs by title, author, or keywords..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
        />
        <Ionicons
          name="search"
          size={20}
          color={isDarkMode ? "#ff5acc" : "#222"}
        />
      </View>
      {/* Blog Cards List */}
      <FlatList
        data={filteredBlogs}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/Blogs/[slug]",
                params: { slug: item.slug },
              })
            }
            style={{
              flexDirection: "row",
              backgroundColor: isDarkMode ? "#18181b" : "#fff",
              borderRadius: 16,
              elevation: isDarkMode ? 0 : 2,
              marginBottom: 18,
              alignItems: "flex-start",
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.04 : 0.08,
              shadowRadius: 5,
            }}
          >
            {/* Blog Image */}
            <Image
              source={{ uri: item.hero }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 12,
                marginRight: 14,
                backgroundColor: "#eee",
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: isDarkMode ? "#222" : undefined,
              }}
              resizeMode="cover"
            />
            {/* Blog Data */}
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: isDarkMode ? "#aaa" : "#888",
                    flexShrink: 1,
                    maxWidth: "48%",
                  }}
                  className="font-poppins-regular"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.date}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? "#fafafa" : "#222",
                    flexShrink: 1,
                    maxWidth: "48%",
                    textAlign: "right",
                  }}
                  className="font-poppins-medium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.author}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? "#ff5acc" : "#222",
                  marginTop: 4,
                  fontWeight: "600",
                }}
                className="font-poppins-semibold"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? "#ccc" : "#444",
                  marginTop: 4,
                }}
                className="font-poppins-regular"
                numberOfLines={2}
              >
                {item.excerpt}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
