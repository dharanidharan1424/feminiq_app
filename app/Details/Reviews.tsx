import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useAuth } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pulse } from "react-native-animated-spinkit";
import { router } from "expo-router";

interface Review {
  id: number;
  reviewer_id?: number; // Added reviewer id to verify ownership
  name: string;
  avatar_url: string;
  rating: number;
  review: string;
  likes: number;
  time: string;
}

interface ReviewsProps {
  data: any;
}

const StarRating: React.FC<{
  rating: number;
  onChange: (rating: number) => void;
}> = ({ rating, onChange }) => (
  <View style={styles.starContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => onChange(star)}
        activeOpacity={0.7}
      >
        <FontAwesome
          name={star <= rating ? "star" : "star-o"}
          size={32}
          color="#FF5ACC"
          style={{ marginHorizontal: 3 }}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const Reviews: React.FC<ReviewsProps> = ({ data }) => {
  const { profile, token, showToast, isDarkMode } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState(1);
  const [loading, setLoading] = useState(true);

  const entityId = data.id;
  const LIKED_STORAGE_KEY = `likedReviews_${profile?.id}`;

  useEffect(() => {
    async function fetchReviews() {
      if (!entityId) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://feminiq-backend.onrender.com/reviews/staff/${entityId}`
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const json = await res.json();

        const loadedReviews: Review[] = json.data.map((r: any) => ({
          id: r.id,
          reviewer_id: r.reviewer_id,
          name: r.reviewer_name,
          avatar_url:
            r.reviewer_image || "https://randomuser.me/portraits/lego/1.jpg",
          rating: parseFloat(r.rating),
          review: r.comment,
          likes: r.likes || 0,
          time: new Date(r.created_at).toLocaleDateString(),
        }));
        setReviews(loadedReviews);
      } catch (e) {
        console.error(e);
        showToast("Failed to load reviews", "remove", "bottom");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [entityId]);

  useEffect(() => {
    async function loadLikedIds() {
      try {
        const stored = await AsyncStorage.getItem(LIKED_STORAGE_KEY);
        if (stored) {
          const likedArray: number[] = JSON.parse(stored);
          setLikedIds(new Set(likedArray));
        }
      } catch (e) {
        // ignore
      }
    }
    loadLikedIds();
  }, []);

  const handleAddReview = async () => {
    if (!newReviewText.trim()) {
      Alert.alert("Please enter your review.");
      return;
    }
    if (!token || !profile) {
      showToast("Please login to leave a review", "info", "bottom");
      return;
    }

    try {
      const reviewPayload = {
        reviewer_id: profile.id,
        reviewee_id: data.id,
        rating: selectedRating,
        comment: newReviewText.trim(),
      };
      const res = await fetch("https://feminiq-backend.onrender.com/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      const json = await res.json();

      const newReview: Review = {
        id: json.review_id,
        reviewer_id: Number(profile.id),
        name: profile.fullname,
        avatar_url:
          profile.image || "https://randomuser.me/portraits/lego/1.jpg",
        rating: selectedRating,
        review: newReviewText.trim(),
        likes: 0,
        time: "Just now",
      };

      setReviews([newReview, ...reviews]);
      setModalVisible(false);
      setNewReviewText("");
      setSelectedRating(5);
      showToast("Review submitted successfully", "success", "bottom");
    } catch (e) {
      console.error(e);
      showToast("Failed to submit review", "remove", "bottom");
    }
  };

  const toggleLike = async (id: number) => {
    const liked = likedIds.has(id);
    const newLikedIds = new Set(likedIds);

    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === id
          ? { ...rev, likes: liked ? rev.likes - 1 : rev.likes + 1 }
          : rev
      )
    );

    if (liked) {
      newLikedIds.delete(id);
    } else {
      newLikedIds.add(id);
    }

    setLikedIds(newLikedIds);

    try {
      await AsyncStorage.setItem(
        LIKED_STORAGE_KEY,
        JSON.stringify(Array.from(newLikedIds))
      );
    } catch (e) {
      console.log(e);
    }

    try {
      const url = `https://feminiq-backend.onrender.com/reviews/${id}/${liked ? "unlike" : "like"}`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      showToast("Failed to update like status", "remove", "bottom");
    }
  };

  const openEditModal = (review: Review) => {
    if (profile?.id !== review.reviewer_id) {
      Alert.alert("You can only edit your own reviews.");
      return;
    }
    setEditReviewId(review.id);
    setSelectedRating(review.rating);
    setNewReviewText(review.review);
    setEditModalVisible(true);
  };

  const handleEditReview = async () => {
    if (!newReviewText.trim() || !editReviewId) {
      console.log(newReviewText, editReviewId);
      Alert.alert("Please enter your review.");
      return;
    }
    try {
      const editPayload = {
        reviewer_id: profile?.id,
        rating: selectedRating,
        comment: newReviewText.trim(),
      };
      const res = await fetch(
        `https://feminiq-backend.onrender.com/reviews/${editReviewId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editPayload),
        }
      );
      if (!res.ok) throw new Error("Failed to update review");

      // Update local list
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editReviewId
            ? { ...r, rating: selectedRating, review: newReviewText.trim() }
            : r
        )
      );
      setEditModalVisible(false);
      setNewReviewText("");
      setSelectedRating(5);
      setEditReviewId(null);
      showToast("Review updated successfully", "success", "bottom");
    } catch (e) {
      console.error(e);
      showToast("Failed to update review", "remove", "bottom");
    }
  };

  const handleDeleteReview = (review: Review) => {
    if (profile?.id !== review.reviewer_id) {
      Alert.alert("You can only delete your own reviews.");
      return;
    }
    Alert.alert(
      "Confirm Delete",
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

  const deleteReview = async (reviewId: number) => {
    try {
      const res = await fetch(
        `https://feminiq-backend.onrender.com/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewer_id: profile?.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete review");

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showToast("Review deleted successfully", "remove", "bottom");
    } catch (e) {
      console.error(e);
      showToast("Failed to delete review", "remove", "bottom");
    }
  };

  const handleSeeAll = () => {
    router.push({
      pathname: "/Details/ReviewDetials",
      params: {
        data: JSON.stringify(data),
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#fff" },
      ]}
    >
      <View className="flex-col">
        <View
          className={`flex-row justify-between items-center border-b pb-3 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star-half" size={25} color={"#FF5ACC"} />
            <Text
              className="font-poppins-semibold"
              style={{ color: isDarkMode ? "#fff" : "#232323" }}
            >
              {reviews.length > 0
                ? (
                    reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
                  ).toFixed(1)
                : "0.0"}{" "}
              ({reviews.length} reviews)
            </Text>
          </View>
          <TouchableOpacity onPress={handleSeeAll}>
            <Text className="font-poppins-semibold text-primary text-md">
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-end my-2">
          <TouchableOpacity
            className="bg-primary px-3 py-2 rounded-full gap-2 flex-row justify-end items-center"
            onPress={() => setModalVisible(true)}
          >
            <Text className="font-poppins-semibold text-white text-center text-sm">
              Leave a review
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Pulse size={50} color="#FF5ACC" style={{ marginTop: 40 }} />
      ) : reviews.length === 0 ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text
            style={{
              color: isDarkMode ? "#aaa" : "#888",
              fontFamily: "Poppins_400Regular",
            }}
          >
            No reviews yet.
          </Text>
          <Text className="font-poppins-semibold text-xl text-primary">
            Be the first to leave a review!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 12 }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                  borderColor: isDarkMode ? "#333" : "#eee",
                },
              ]}
              className="border"
            >
              <View style={[styles.row, { justifyContent: "space-between" }]}>
                <View style={styles.row}>
                  <Image
                    source={{ uri: item.avatar_url }}
                    style={styles.avatar}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.name,
                        { color: isDarkMode ? "#fff" : "#232323" },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.time,
                        { color: isDarkMode ? "#aaa" : "#aaa" },
                      ]}
                    >
                      {item.time}
                    </Text>
                  </View>
                  <View className="flex-row gap-1 items-center justify-center border border-primary rounded-3xl py-1 px-2">
                    <MaterialIcons
                      name="star-half"
                      color={"#FF5ACC"}
                      size={18}
                    />
                    <Text
                      className="mt-1"
                      style={[
                        styles.rating,
                        { color: isDarkMode ? "#FF5ACC" : "#FF5ACC" },
                      ]}
                    >
                      {item.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.reviewText,
                  { color: isDarkMode ? "#ccc" : "#444" },
                ]}
              >
                {item.review}
              </Text>
              <View className="flex-row justify-between items-center mt-2">
                <View style={styles.likesRow}>
                  <TouchableOpacity onPress={() => toggleLike(item.id)}>
                    <Ionicons
                      name={likedIds.has(item.id) ? "heart" : "heart-outline"}
                      size={20}
                      color={"#FF5ACC"}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.likesCount,
                      { color: isDarkMode ? "#aaa" : "#888" },
                    ]}
                    className="mt-1"
                  >
                    {item.likes}
                  </Text>
                </View>
                <View>
                  {profile?.id === item.reviewer_id && (
                    <View style={{ flexDirection: "row", gap: 20 }}>
                      <TouchableOpacity onPress={() => openEditModal(item)}>
                        <MaterialCommunityIcons
                          name="square-edit-outline"
                          size={20}
                          color={"#FF5ACC"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteReview(item)}
                      >
                        <Ionicons name="trash-bin" size={20} color={"red"} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Review Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        statusBarTranslucent
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? "#fff" : "#222" },
              ]}
            >
              Add Your Review
            </Text>
            <StarRating rating={selectedRating} onChange={setSelectedRating} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#2C2C2C" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  borderColor: isDarkMode ? "#555" : "#ddd",
                },
              ]}
              placeholder="Write your review..."
              placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
              multiline
              value={newReviewText}
              onChangeText={setNewReviewText}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="border border-primary px-4 py-2 rounded-3xl mr-4"
                onPress={() => setModalVisible(false)}
              >
                <Text className="font-poppins-semibold text-primary text-sm text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary rounded-3xl px-4 py-2"
                onPress={handleAddReview}
              >
                <Text className="font-poppins-semibold text-white text-sm text-center">
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        statusBarTranslucent
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? "#fff" : "#222" },
              ]}
            >
              Edit Your Review
            </Text>
            <StarRating rating={selectedRating} onChange={setSelectedRating} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#2C2C2C" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  borderColor: isDarkMode ? "#555" : "#ddd",
                },
              ]}
              placeholder="Edit your review..."
              placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
              multiline
              value={newReviewText}
              onChangeText={setNewReviewText}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="border border-primary px-4 py-2 rounded-3xl mr-4"
                onPress={() => {
                  setEditModalVisible(false);
                  setNewReviewText("");
                  setSelectedRating(5);
                  setEditReviewId(null);
                }}
              >
                <Text className="font-poppins-semibold text-primary text-sm text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary rounded-3xl px-4 py-2"
                onPress={handleEditReview}
              >
                <Text className="font-poppins-semibold text-white text-sm text-center">
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", paddingTop: 10 },
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
  time: { color: "#aaa", fontSize: 12, fontFamily: "Poppins_400Regular" },
  rating: { color: "#FF5ACC", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
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

export default Reviews;
