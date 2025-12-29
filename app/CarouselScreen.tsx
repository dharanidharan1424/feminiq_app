import Paginator from "@/components/Paginator";
import { images } from "@/constants";
import Carousel from "@/screens/Carousel";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

const CarouselScreen: React.FC = () => {
  const data: CarouselItem[] = [
    {
      id: "1",
      title: "title-1",
      description: "Effortlessly discover your perfect makeup artist.",
      image: images.carousel1,
    },
    {
      id: "2",
      title: "title-1",
      description: "Effortlessly discover your perfect makeup artist.",
      image: images.carousel2,
    },
    {
      id: "3",
      title: "title-1",
      description: "Effortlessly discover your perfect makeup artist.",
      image: images.carousel3,
    },
  ];

  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get("window");

  const [currIndex, setCurrIndex] = useState<number>(0);

  const viewItemChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrIndex(viewableItems[0].index!);
      }
    }
  ).current;

  const slidesRef = useRef<FlatList<CarouselItem>>(null);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = currIndex === data.length - 1 ? 0 : currIndex + 1;
      setCurrIndex(nextIndex);
      slidesRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 2000);

    return () => clearInterval(timer);
  }, [currIndex, data.length]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={{ flex: 3 }}>
          <FlatList
            data={data}
            renderItem={({ item }) => <Carousel item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewItemChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
            snapToInterval={screenWidth} // snap exactly on screen width
            decelerationRate="fast" // smooth fast snap
            snapToAlignment="start"
          />
        </View>
        <Paginator color="#FF5ACC" data={data} scrollX={scrollX} />
        <TouchableOpacity
          onPress={() => router.push("/Auth/SignUp")}
          style={{
            backgroundColor: "#FF5ACC",
            width: "100%",
            padding: 10,
            margin: 10,
            marginTop: 10,
            borderRadius: 50,
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: "Poppins_600SemiBold", color: "white" }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
});

export default CarouselScreen;
