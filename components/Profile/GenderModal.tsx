import { images } from "@/constants";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

const genderOptions = [
  {
    key: "Male",
    label: "Male",
    image: images.Male_img, // replace with your local male image
  },
  {
    key: "Female",
    label: "Female",
    image: images.Female_img, // replace with your local female image
  },
  {
    key: "Other",
    label: "Others",
    image: images.Others_img, // replace with your local others image
  },
];

const windowWidth = Dimensions.get("window").width;

const GenderModal = ({
  visible,
  onClose,
  onSelectGender,
  selectedGender,
  isDarkMode,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectGender: (gender: string) => void;
  selectedGender?: string;
  isDarkMode: boolean;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalBackground}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDarkMode ? "#222" : "#fff" },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: isDarkMode ? "#eee" : "#222" }]}
          >
            Select Gender
          </Text>
          <View style={styles.genderRow}>
            {/* Male on left */}
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === "Male" && styles.genderButtonSelected,
              ]}
              onPress={() => {
                onSelectGender("Male");
                onClose();
              }}
            >
              <Image
                source={genderOptions[0].image}
                style={styles.genderImage}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.genderLabel,
                  selectedGender === "Male" && styles.genderLabelSelected,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            {/* Female on right */}
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === "Female" && styles.genderButtonSelected,
              ]}
              onPress={() => {
                onSelectGender("Female");
                onClose();
              }}
            >
              <Image
                source={genderOptions[1].image}
                style={styles.genderImage}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.genderLabel,
                  selectedGender === "Female" && styles.genderLabelSelected,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === "Other" && styles.genderButtonSelected,
              ]}
              onPress={() => {
                onSelectGender("Other");
                onClose();
              }}
            >
              <Image
                source={genderOptions[2].image}
                style={styles.genderImage}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.genderLabel,
                  selectedGender === "Other" && styles.genderLabelSelected,
                ]}
              >
                Others
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 12,
    width: windowWidth * 0.9,
    alignItems: "center",
    height: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FF5ACC",
    paddingBottom: 8,
    width: "90%",
    textAlign: "center",
  },
  genderRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
    paddingHorizontal: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF5ACC",
  },
  genderButtonSelected: {
    backgroundColor: "#FF5ACC66",
  },
  genderLabel: {
    marginTop: 8,
    fontSize: 16,
    color: "#FF5ACC",
    fontFamily: "Poppins_500Medium",
  },
  genderLabelSelected: {
    color: "#FF5ACC",
  },
  genderImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});

export default GenderModal;
