import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Pulse } from "react-native-animated-spinkit";

interface Service {
  id: string;
  name?: string;
  description?: string;
  price?: string;
  duration?: string;
  mobile_images_url: string;
}

const ServicesSlider: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetch("https://feminiq-backend.onrender.com/api/service-categories")
      .then((res) => res.json())
      .then((json) => {
        setServices(json.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setServices([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View className="flex-row items-center justify-center">
        <Pulse size={60} color="#FF5ACC" />
      </View>
    );
  }

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => {
        const maxLengthForBigFont = 10;
        const labelFontSize =
          item.name && item.name.length > maxLengthForBigFont ? 10 : 10;
        return (
          <TouchableOpacity
            style={[styles.card, { width: width * 0.25 }]}
            onPress={() =>
              router.push({
                pathname: "/Catagories",
                params: { service_id: item.id, service_name: item.name },
              })
            }
          >
            <Image
              source={{ uri: item.mobile_images_url }}
              style={styles.image}
              resizeMode="cover"
            />
            {item.name && (
              <View style={styles.labelBox}>
                <Text
                  className="font-poppins-regular"
                  style={[styles.label, { fontSize: labelFontSize }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default ServicesSlider;

const styles = StyleSheet.create({
  card: { alignItems: "center", marginLeft: 4 },
  image: {
    width: 80,
    height: 70,
    borderRadius: 4,
    marginBottom: 6,
    backgroundColor: "#eee",
  },
  labelBox: {
    backgroundColor: "#d9534f",
    borderRadius: 4,
    width: "90%",
    paddingVertical: 3,
    alignItems: "center",
  },
  label: {
    color: "#fff",
    textAlign: "center",
    fontSize: 10,
  },
});
