import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Modal,
  Animated,
  PanResponder,
  StyleSheet,
  Pressable,
} from "react-native";
import { Wave } from "react-native-animated-spinkit";
import { useAuth } from "@/context/UserContext";

const { width, height } = Dimensions.get("window");
const numColumns = 3;
const IMAGE_SIZE = (width - 50) / numColumns;

const Gallery = ({ data }: { data: any }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { isDarkMode } = useAuth();

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const response = await fetch(
          "https://feminiq-backend.onrender.com/api/get-staffs"
        );
        const json = await response.json();
        if (response.ok) {
          const filteredImages = json.data
            .filter(
              (staff: { service_id: any }) =>
                Number(staff.service_id) === Number(data.service_id)
            )
            .map((staff: { mobile_image_url: any }) => staff.mobile_image_url);
          setImages(filteredImages);
        } else {
          setError("Failed to load images");
          setImages([]);
        }
      } catch {
        setError("Error loading images");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, [data]);

  // Animated values for zoom and pan
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const resetZoomAndPosition = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        gestureState.numberActiveTouches === 2 ||
        Math.abs(gestureState.dx) > 10 ||
        Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          const touches = evt.nativeEvent.touches;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const newScale = Math.min(Math.max(distance / 200, 1), 3);
          scale.setValue(newScale);
        } else if (gestureState.numberActiveTouches === 1) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
        }
      },
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  const flatListRef = useRef<FlatList>(null);

  const openImageModal = (idx: number) => {
    setActiveIndex(idx);
    resetZoomAndPosition();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetZoomAndPosition();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white dark:bg-neutral-800">
        <Wave size={50} color={isDarkMode ? "#FF69B4" : "#FF5ACC"} />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white dark:bg-neutral-800">
        <Text className="text-red-600 dark:text-pink-400">{error}</Text>
      </View>
    );
  }
  if (images.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white dark:bg-neutral-800">
        <Text className="text-neutral-400 dark:text-neutral-200">
          No images found.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View
        style={{ backgroundColor: isDarkMode ? "#121212" : "#fff" }}
        className="flex-1 pt-3"
      >
        <Text
          style={{ color: isDarkMode ? "#fff" : "#000" }}
          className={`text-2xl font-poppins-semibold mb-4 ml-2 border-b border-gray-200 pb-1 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          Our Gallery
        </Text>
        <FlatList
          data={images}
          keyExtractor={(_, idx) => idx.toString()}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => openImageModal(index)}>
              <Image
                source={{ uri: item }}
                className="rounded-xl bg-neutral-300 dark:bg-neutral-700 mb-4 mx-1"
                style={{ width: IMAGE_SIZE - 2, height: IMAGE_SIZE - 2 }}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={modalStyles.container}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle={isDarkMode ? "light-content" : "dark-content"}
          />
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeIndex}
            keyExtractor={(_, index) => index.toString()}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <Pressable onPress={closeModal} style={modalStyles.imageWrapper}>
                <Animated.View
                  style={[
                    modalStyles.animatedImage,
                    {
                      transform: [
                        { translateX: translateX },
                        { translateY: translateY },
                        { scale: scale },
                      ],
                    },
                  ]}
                >
                  <Image
                    {...panResponder.panHandlers}
                    source={{ uri: item }}
                    style={modalStyles.image}
                    resizeMode="contain"
                  />
                </Animated.View>
              </Pressable>
            )}
            // ✅ Correct pagination index
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / width
              );
              setActiveIndex(newIndex);
              resetZoomAndPosition();
            }}
          />
          <TouchableOpacity style={modalStyles.closeBtn} onPress={closeModal}>
            <Text style={modalStyles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={modalStyles.pagination}>
            <Text style={modalStyles.paginationText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  animatedImage: {},
  image: {
    width: width,
    height: height * 0.75,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 24,
  },
  pagination: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paginationText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Gallery;
