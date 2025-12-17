import Paginator from "@/components/Paginator";
import Carousel2 from "@/screens/Carousel2";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, StyleSheet, View, ViewToken } from "react-native";

interface CarouselItem2 {
  id: string;
  title: string;
  description: string;
  offer: string;
  highlight: string;
}

const HeroCarousel: React.FC = () => {
  const data: CarouselItem2[] = [
    {
      id: "1",
      offer: "30% OFF",
      title: "Today's Special",
      description:
        "Get a discount for every service order!\nOnly valid for today!",
      highlight: "30%",
    },
    {
      id: "2",
      offer: "20% OFF",
      title: "Weekend Deal",
      description: "Save 20% on select services this weekend only!",
      highlight: "20%",
    },
    {
      id: "3",
      offer: "Free Gift",
      title: "Bonus Offer",
      description: "Free gift with every order above $100!",
      highlight: "100%",
    },
  ];

  const scrollX = useRef(new Animated.Value(0)).current;
  const [currIndex, setCurrIndex] = useState<number>(0);

  const viewItemChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrIndex(viewableItems[0].index!);
      }
    }
  ).current;

  const slidesRef = useRef<FlatList<CarouselItem2>>(null);

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
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={data}
          renderItem={({ item }) => <Carousel2 item={item} />}
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
        />
      </View>
      <View className="mt-1 absolute -bottom-3">
        <Paginator color="#fff" data={data} scrollX={scrollX} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
});

export default HeroCarousel;
