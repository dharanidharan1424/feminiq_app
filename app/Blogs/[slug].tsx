import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from "react-native";
import BLOGS_OBJECT from "../../constants/Blogs.json";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/UserContext"; // add your auth context import
import { SafeAreaView } from "react-native-safe-area-context";

export default function BlogDetails() {
  const { slug } = useLocalSearchParams();
  const blog =
    BLOGS_OBJECT[
      (Array.isArray(slug) ? slug[0] : slug) as keyof typeof BLOGS_OBJECT
    ];
  const { isDarkMode } = useAuth(); // Get dark mode status

  if (!blog) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#18181b" : "#fff",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isDarkMode ? "#f3f3fa" : "#232323",
          }}
        >
          Blog not found
        </Text>
      </SafeAreaView>
    );
  }

  const onShare = async () => {
    try {
      const url = `https://feminiq.in/blog-details.html?slug=${blog.slug}`;
      const message = `${blog.title}\nRead more here: ${url}`;

      const result = await Share.share({
        message,
        url, // optional: some platforms use URL separately
      });

      if (result) {
        console.log(result);
      }

      // handle result if needed
    } catch (error: any) {
      Alert.alert("Error", "Failed to share the blog.", error);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#18181b" : "#fff",
      }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <SafeAreaView>
        {/* Header Navigation */}
        <View className="flex-row items-center px-4 py-3 justify-between">
          <Pressable onPress={() => router.back()} className="mr-2">
            <Ionicons
              name="arrow-back"
              size={25}
              color={isDarkMode ? "#fafafa" : "#222"}
            />
          </Pressable>

          <Pressable onPress={onShare} className="mr-2">
            <Ionicons
              name="share-social-outline"
              size={25}
              color={isDarkMode ? "#fafafa" : "#222"}
            />
          </Pressable>
        </View>

        {/* Hero Image */}
        <Image
          source={{ uri: blog.hero }}
          style={{
            width: "94%",
            alignSelf: "center",
            borderRadius: 20,
            height: 220,
            marginVertical: 8,
            backgroundColor: isDarkMode ? "#202026" : "#eee",
          }}
          resizeMode="cover"
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginTop: 6,
          }}
        >
          {/* Category Badge */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 99,
              backgroundColor: isDarkMode ? "#403346" : "#ff5acc22",
            }}
          >
            <Text
              style={{
                color: "#ff5acc",
                fontFamily: "Poppins_600SemiBold",
                fontSize: 12,
              }}
            >
              {blog.badge}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: isDarkMode ? "#a1a1aa" : "#888",
              fontFamily: "Poppins_400Regular",
            }}
          >
            {blog.date} • {blog.author}
          </Text>
        </View>

        {/* Title & Excerpt */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Poppins_600SemiBold",
              color: isDarkMode ? "#fafafa" : "#232323",
              marginBottom: 6,
            }}
          >
            {blog.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDarkMode ? "#a8a8ae" : "#7b899e",
              fontFamily: "Poppins_400Regular",
              marginBottom: 13,
            }}
          >
            {blog.excerpt}
          </Text>
        </View>

        {/* Quick Tips Section */}
        {blog.quickTips && blog.quickTips.length > 0 && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 4,
              marginBottom: 18,
              backgroundColor: isDarkMode ? "#312e3a" : "#ff5acc16",
              borderLeftWidth: 4,
              borderLeftColor: isDarkMode ? "#ff5acc77" : "#ff5acc",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text
              style={{
                marginBottom: 6,
                fontSize: 15,
                fontFamily: "Poppins_600SemiBold",
                color: "#ff5acc",
              }}
            >
              Quick Tips
            </Text>
            {blog.quickTips.map((tip, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 6,
                  marginBottom: 3,
                }}
              >
                <Ionicons name="bulb-outline" size={16} color="#ff5acc" />
                <Text
                  style={{
                    fontSize: 13,
                    color: isDarkMode ? "#f3f3fa" : "#ea4c89",
                    fontFamily: "Poppins_500Medium",
                    flexShrink: 1,
                    flexWrap: "wrap",
                    width: "92%",
                  }}
                >
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Main Blog Content */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {blog.content.map((block, index) => {
            if (block.type === "paragraph") {
              return (
                <Text
                  key={index}
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: 15,
                    color: isDarkMode ? "#cbd5e1" : "#232323",
                    marginTop: 12,
                    lineHeight: 24,
                  }}
                >
                  {block.text}
                </Text>
              );
            }
            if (block.type === "heading") {
              return (
                <Text
                  key={index}
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: block.level === 2 ? 20 : 16,
                    color: "#ff5acc",
                    marginTop: 20,
                    marginBottom: 8,
                  }}
                >
                  {block.text}
                </Text>
              );
            }
            if (block.type === "list" && Array.isArray(block.items)) {
              return (
                <View key={index} style={{ marginLeft: 12, marginTop: 6 }}>
                  {block.items.map((li, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#ff5acc",
                          marginRight: 2,
                        }}
                      >
                        •
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: 15,
                          color: isDarkMode ? "#e5e5e7" : "#444",
                          flexShrink: 1,
                        }}
                      >
                        {li}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            }
            if (block.type === "tip") {
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 14,
                    backgroundColor: isDarkMode ? "#fee2a8" : "#fffbf0",
                    borderLeftWidth: 4,
                    borderLeftColor: "#facc15",
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  <Ionicons
                    name="flash-outline"
                    size={18}
                    color="#facc15"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      color: "#f59e42",
                      fontSize: 13,
                      flexShrink: 1,
                    }}
                  >
                    {block.text}
                  </Text>
                </View>
              );
            }
            if (block.type === "pullquote") {
              return (
                <Text
                  key={index}
                  style={{
                    fontStyle: "italic",
                    fontFamily: "Poppins_400Regular",
                    fontSize: 14,
                    paddingVertical: 10,
                    marginVertical: 10,
                    color: isDarkMode ? "#c7aaff" : "#9655fc",
                  }}
                >
                  “{block.text}”
                </Text>
              );
            }
            return null;
          })}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
