import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

type ValidationAlertModalProps = {
  isVisible: boolean;
  message: string;
  isDarkMode: boolean;
  onClose: () => void;
};

const ValidationAlertModal: React.FC<ValidationAlertModalProps> = ({
  isVisible,
  message,
  isDarkMode,
  onClose,
}) => {
  const bgColor = isDarkMode ? "#444" : "#fff";

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.8}
      style={styles.modal}
      statusBarTranslucent
    >
      <View style={[styles.alertContainer, { backgroundColor: bgColor }]}>
        <Ionicons
          name="alert-circle-outline"
          size={40}
          color="#FF000D"
          style={styles.icon}
        />
        <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
          Validation Required
        </Text>
        <Text style={styles.messageText}>{message}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
    color: "#FF000D",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FF5ACC", // Primary Color
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
});

export default ValidationAlertModal;
