import { images } from "@/constants";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

interface CarouselItem2 {
  id: string;
  title: string;
  description: string;
  offer: string;
  highlight: string;
}

interface Carousel2Props {
  item: CarouselItem2;
}

const Carousel2: React.FC<Carousel2Props> = ({ item }) => {
  const { width, height } = useWindowDimensions();

  return (
    <View
      style={[
        styles.cardContainer,
        { width: width * 0.9, height: height * 0.2 },
      ]}
    >
      <Image
        source={images.carouselBg_2}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <Text style={styles.offer}>{item.offer}</Text>
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.highlight}>{item.highlight}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
};

export default Carousel2;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 28,
    paddingHorizontal: 28,
    marginHorizontal: 10,
    justifyContent: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  offer: {
    fontSize: 12,
    color: "#fff",
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
    letterSpacing: 0.3,
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    maxWidth: "100%",
  },
  highlight: {
    fontSize: 40,
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 8,
    position: "absolute",
    right: -10,
  },
  description: {
    fontSize: 12,
    color: "#fff",

    fontFamily: "Poppins_400Regular",
    textAlign: "left",
    lineHeight: 12,
    zIndex: 1,
  },
});
