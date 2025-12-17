import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

interface CarouselProps {
  item: CarouselItem;
}

const Carousel: React.FC<CarouselProps> = ({ item }) => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <Image
        source={item.image}
        style={[
          styles.image,
          {
            width: width * 0.7,
            height: height * 0.4,
          },
        ]}
        resizeMode="contain"
      />
      <View>
        {/* <Text style={styles.title}>{item.title}</Text> */}
        <Text style={styles.desc}>{item.description}</Text>
      </View>
    </View>
  );
};

export default Carousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    marginBottom: 10,
  },
  title: {
    fontWeight: "800",
    marginBottom: 10,
    color: "#493d8a",
    textAlign: "center",
  },
  desc: {
    fontFamily: "Poppins_600SemiBold",
    color: "black",
    textAlign: "center",
    fontSize: 20,
    paddingHorizontal: 5,
    marginTop: 50,
  },
});
