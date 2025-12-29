import { getApiUrl } from "@/config/api.config";
import { useAuth } from "@/context/UserContext";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Review = {
  id: number;
  reviewer_id: number;
  name: string;
  avatar: any;
  text: string;
  date: string;
  rating: number;
  likes: number;
};

const StarRating: React.FC<{
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
}> = ({ rating, onChange, size = 18 }) => {
  return (
    <View
      style={[
        styles.starContainer,
        { justifyContent: onChange ? "center" : "flex-start" },
      ]}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange && onChange(star)}
          activeOpacity={onChange ? 0.7 : 1}
          disabled={!onChange}
          style={{ marginHorizontal: 4 }}
        >
          <MaterialIcons
            name={star <= rating ? "star" : "star-border"}
            size={size}
            color="#FF49AC"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewsScreen: React.FC = () => {
  const { profile, token, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<"byYou" | "toYou">("byYou");
  const [reviewsByYou, setReviewsByYou] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      if (!profile || !token) return;
      if (activeTab !== "byYou") return;
      setLoading(true);
      try {
        const res = await fetch(
          `${getApiUrl("/reviews/user")}/${profile.id}`
        );
        if (!res.ok) throw new Error("Failed to load reviews");
        const json = await res.json();
        const data: Review[] = json.data.map((r: any) => ({
          id: r.id,
          reviewer_id: r.reviewer_id,
          name: r.staff_name,
          avatar: r.staff_image,
          text: r.comment,
          date: new Date(r.created_at).toLocaleDateString(),
          rating: parseFloat(r.rating),
          likes: r.likes || 0,
        }));
        setReviewsByYou(data);
      } catch (error) {
        console.error(error);
        showToast("Failed to load reviews", "remove");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [profile, token, activeTab]);

  const openEditModal = (review: Review) => {
    setEditReview(review);
    setEditText(review.text);
    setEditRating(review.rating);
    setModalVisible(true);
  };

  const handleEditReview = async () => {
    if (!editReview || !profile) return;
    if (!editText.trim()) {
      showToast("Please enter review text", "info");
      return;
    }
    try {
      const res = await fetch(
        `${getApiUrl("/reviews")}/${editReview.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewer_id: profile.id,
            rating: editRating,
            comment: editText.trim(),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update review");

      setReviewsByYou((prev) =>
        prev.map((r) =>
          r.id === editReview.id
            ? { ...r, text: editText.trim(), rating: editRating }
            : r
        )
      );
      setModalVisible(false);
      showToast("Review updated", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update review", "remove");
    }
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteReview(review.id),
        },
      ]
    );
  };

  const deleteReview = async (id: number) => {
    if (!profile) return;
    try {
      const res = await fetch(
        `${getApiUrl("/reviews")}/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewer_id: profile.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete review");

      setReviewsByYou((prev) => prev.filter((r) => r.id !== id));
      showToast("Review deleted", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete review", "remove");
    }
  };

  return (
    <ScrollView className="bg-white flex-1 px-2 py-1">
      <View className="my-4">
        <TouchableOpacity
          onPress={() => router.push("/Tabs/Profile")}
          className="flex-row items-center gap-2"
        >
          <Ionicons name="arrow-back" size={28} />
          <Text className="font-poppins-semibold text-2xl">Reviews</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-around mb-6">
        <TouchableOpacity
          className={`px-5 py-2 rounded-full flex-row items-center gap-1 ${activeTab === "byYou" ? "bg-primary" : "bg-gray-300"
            }`}
          onPress={() => setActiveTab("byYou")}
        >
          <Ionicons
            name="person-circle-outline"
            size={20}
            color={activeTab === "byYou" ? "white" : "black"}
          />
          <Text
            className={`text-center font-poppins-medium ${activeTab === "byYou" ? "text-white" : "text-black"
              }`}
          >
            You to artists
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-5 py-2 rounded-full flex-row items-center gap-1 ${activeTab === "toYou" ? "bg-primary" : "bg-gray-300"
            }`}
          onPress={() => setActiveTab("toYou")}
        >
          <Ionicons
            name="star-outline"
            size={20}
            color={activeTab === "toYou" ? "white" : "black"}
          />
          <Text
            className={`text-center font-poppins-medium  ${activeTab === "toYou" ? "text-white" : "text-black"
              }`}
          >
            Artists to You
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "byYou" ? (
        loading ? (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <Text className="text-gray-500">Loading...</Text>
          </View>
        ) : reviewsByYou.length === 0 ? (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <Text className="text-gray-500">No reviews by you yet.</Text>
          </View>
        ) : (
          reviewsByYou.map((review) => (
            <View
              key={review.id}
              style={styles.card}
              className="border border-gray-100"
            >
              <View style={[styles.row, { justifyContent: "space-between" }]}>
                <View style={styles.row}>
                  <Image
                    source={{ uri: review.avatar }}
                    style={styles.avatar}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.name}>{review.name}</Text>
                    <Text style={styles.time}>{review.date}</Text>
                  </View>
                  <View className="flex-row gap-1 items-center justify-center border border-primary rounded-3xl py-1 px-2">
                    <Ionicons name="star-half" size={15} color={"#FF5ACC"} />
                    <Text className="font-poppins-semibold text-sm">
                      {review.rating}.0
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>

              <View className="flex-row justify-between items-center mt-2">
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity>
                    <Ionicons name={"heart"} size={20} color={"#FF5ACC"} />
                  </TouchableOpacity>
                  <Text style={styles.likesCount} className="mt-1">
                    {review.likes}
                  </Text>
                </View>

                <View />
                <View>
                  <View style={{ flexDirection: "row", gap: 20 }}>
                    <TouchableOpacity onPress={() => openEditModal(review)}>
                      <MaterialCommunityIcons
                        name="square-edit-outline"
                        size={20}
                        color={"#FF5ACC"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteReview(review)}
                    >
                      <Ionicons name="trash-bin" size={20} color={"red"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )
      ) : (
        <View className="mt-20 items-center">
          <Text className="text-gray-500">Reviews to You tab coming soon.</Text>
        </View>
      )}

      {/* Edit Review Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 20,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Edit Your Review
            </Text>
            <StarRating
              rating={editRating}
              onChange={setEditRating}
              size={32}
            />
            <TextInput
              multiline
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit your review..."
              style={{
                borderColor: "#ddd",
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
                height: 100,
                marginTop: 15,
                marginBottom: 16,
                textAlignVertical: "top",
                fontFamily: "Poppins_400Regular",
              }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#eee",
                  borderRadius: 10,
                  flex: 1,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "Poppins_600SemiBold",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditReview}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#FF49AC",
                  borderRadius: 10,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "Poppins_600SemiBold",
                    color: "white",
                  }}
                >
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 13,
    elevation: 1,
    shadowColor: "#eee",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eee",
  },
  name: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#232323",
  },
  time: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  rating: {
    color: "#FF5ACC",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  reviewText: {
    color: "#444",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 8,
  },
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 2,
    gap: 5,
  },
  likesCount: {
    color: "#888",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    color: "#222",
    paddingHorizontal: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    height: 100,
    textAlignVertical: "top",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
});

export default ReviewsScreen;
