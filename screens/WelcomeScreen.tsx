import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeScreen = () => {
  const handleNext = () => {
    // Always navigate to CarouselScreen to show authentication flow
    router.push("/CarouselScreen");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={{
          uri: "https://res.cloudinary.com/dv9s7sm0x/image/upload/v1759553083/9668032_c4x9nu.jpg",
        }}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,1)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "80%", // Adjust for your design, usually 40-60% works well
          }}
          pointerEvents="none"
        />

        <StatusBar hidden />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingHorizontal: 25,
            paddingBottom: 40,
            zIndex: 99,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Poppins_600SemiBold",
              color: "white",
              textAlign: "center",
            }}
          >
            Get Ready to Glow With
          </Text>

          <Text
            style={{
              fontSize: 70,
              fontFamily: "Poppins_700Bold",
              color: "#FF5ACC",
              textAlign: "center",
            }}
          >
            feminiq
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "400",
              fontFamily: "Poppins_400Regular",
              color: "white",
              textAlign: "center",
              marginTop: -35,
              marginBottom: 10,
            }}
          >
            Your Glam Squad, In Your Pocket
          </Text>

          <Text
            className="text-white"
            style={{
              textAlign: "center",
              fontSize: 13,
              fontFamily: "Poppins_400Regular",
            }}
          >
            The Best Beauty Professionals App for your Good Looks and Beauty At
            Your Convenience
          </Text>
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: "#FF5ACC",
              width: "100%",
              padding: 10,
              margin: 10,
              marginTop: 20,
              borderRadius: 50,
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "Poppins_600SemiBold", color: "white" }}>
              Next
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
