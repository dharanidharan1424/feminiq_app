import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "remove" | "info";
  onHide: () => void;
  duration?: number;
  position?: "top" | "bottom";
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "info",
  onHide,
  duration = 2500,
  position = "bottom",
}) => {
  const translateY = useRef(
    new Animated.Value(position === "top" ? -80 : 100)
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: 12,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(onHide);
        }, duration);
      });
    } else {
      opacity.setValue(0);
      translateY.setValue(position === "top" ? -80 : 80);
    }
  }, [visible, position]);

  if (!visible) return null;

  // Choose icon and icon color based on type
  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color="#2DC72D"
            style={{ marginRight: 10 }}
          />
        );
      case "remove":
        return (
          <MaterialCommunityIcons
            name="trash-can"
            size={22}
            color="#E53935"
            style={{ marginRight: 10 }}
          />
        );
      case "info":
      default:
        return (
          <MaterialCommunityIcons
            name="information"
            size={22}
            color="#1976D2"
            style={{ marginRight: 10 }}
          />
        );
    }
  };

  // Background color based on type
  const backgroundColor =
    type === "remove" ? "#FFCDD2" : type === "success" ? "#E8F5E9" : "#E3F2FD";

  const textColor =
    type === "remove" ? "#C62828" : type === "success" ? "#1B5E20" : "#0D47A1";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor,
          top: position === "top" ? 40 : undefined,
          bottom: position === "bottom" ? 80 : undefined,
        },
      ]}
    >
      {renderIcon()}
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
        <MaterialCommunityIcons name="close" size={18} color="#444" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    left: 50,
    right: 30,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 9999,
    minHeight: 44,
  },
  text: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 10,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Toast;
