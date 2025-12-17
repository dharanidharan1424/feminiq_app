import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  // Removed Alert, as we are using a custom modal
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import Modal from "react-native-modal";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LoadingIndicator } from "@/components/Animation/Countdown"; // Assuming path is correct
import ValidationAlertModal from "@/components/Profile/ValidationModal"; // Import the new validation modal

// --- Component Props ---
type DeleteAccountModalProps = {
  isVisible: boolean;
  isDarkMode: boolean;
  toggleModal: () => void;
  deleteReasons: string[];
  handleDeleteAccount: (
    reasons: string[],
    otherReason: string
  ) => Promise<string | null>; // Returns error message or null
};

// --- CONSTANTS ---
const OTHER_REASON_LABEL = "Others";

// Note: Removed the inline ValidationMessage component

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  isDarkMode,
  toggleModal,
  deleteReasons,
  handleDeleteAccount,
}) => {
  // Stages: "reasons" -> "confirmation" -> "loading" -> "success"
  const [modalStage, setModalStage] = useState<
    "reasons" | "confirmation" | "loading" | "success"
  >("reasons");
  const [selectedReasons, setSelectedReasons] = useState<number[]>([]);
  const [otherReasonText, setOtherReasonText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for the validation error message shown in the separate modal
  const [validationError, setValidationError] = useState<string | null>(null);

  // Checks if any reason is selected to show the text input
  const isAnyReasonSelected = selectedReasons.length > 0;

  const OTHER_REASON_INDEX = useMemo(
    () => deleteReasons.findIndex((r) => r === OTHER_REASON_LABEL),
    [deleteReasons]
  );
  const isOtherReasonSelected =
    OTHER_REASON_INDEX !== -1 && selectedReasons.includes(OTHER_REASON_INDEX);

  // Handler to close the separate validation modal
  const handleCloseValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  // --- HANDLERS ---

  // Handle closing and state reset
  const handleToggleModal = useCallback(() => {
    if (modalStage === "loading") return; // Prevent closing during loading
    toggleModal();

    if (isVisible) {
      setSelectedReasons([]);
      setOtherReasonText("");
      setModalStage("reasons");
      setDeleteError(null);
      setValidationError(null); // Reset validation error on close
    }
  }, [toggleModal, isVisible, modalStage]);

  const handleReasonToggle = useCallback((index: number) => {
    // Clear validation error when user interacts
    setValidationError(null);
    setSelectedReasons((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }, []);

  const handleProceedValidation = useCallback(() => {
    // Clear previous errors
    setValidationError(null);

    // 1. Must select at least one reason
    if (selectedReasons.length === 0) {
      setValidationError(
        "Please select at least one reason for account deletion."
      );
      return;
    }

    // 2. Text input must be filled (Compulsory for all deletions)
    if (otherReasonText.trim() === "") {
      setValidationError(
        "Details are required. Please describe your reason(s) in the text box."
      );
      return;
    }

    // Validation passed, move to final confirmation stage
    setModalStage("confirmation");
  }, [selectedReasons, otherReasonText]);

  const handleFinalDelete = useCallback(async () => {
    setDeleteError(null);
    setModalStage("loading");

    try {
      const reasonsToSubmit = selectedReasons.map((idx) => deleteReasons[idx]);
      const error = await handleDeleteAccount(
        reasonsToSubmit,
        otherReasonText.trim()
      );

      if (error) {
        setDeleteError(error);
        setModalStage("reasons"); // Go back to the starting view on error
        setValidationError(
          "Deletion failed. Please try again or check your connection."
        ); // Show error on return
      } else {
        // Deletion succeeded
        setModalStage("success");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setDeleteError("An unexpected error occurred during deletion.");
      setModalStage("reasons");
      setValidationError("An unexpected error occurred during deletion."); // Show error on return
    }
  }, [selectedReasons, otherReasonText, deleteReasons, handleDeleteAccount]);

  // Determine dynamic colors
  const bgColor = isDarkMode ? "#333" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const secondaryTextColor = isDarkMode ? "#bbb" : "#555";
  const primaryColor = "#FF5ACC"; // Theme color
  const dangerColor = "#FF000D";

  // --- JSX RENDER ---
  return (
    <>
      {/* This is the main deletion modal.
        We wrap it in a Fragment (<>) so we can render the ValidationAlertModal separately.
      */}
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleToggleModal}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        statusBarTranslucent={true}
      >
        <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
          {/* --- Stage: REASONS SELECTION --- */}
          {modalStage === "reasons" && (
            <View style={{ width: "100%" }}>
              <Text style={[styles.deleteTitle, { color: dangerColor }]}>
                Delete Account
              </Text>

              {/* Removed inline ValidationMessage */}

              <Text
                style={[
                  styles.deleteMessage,
                  { color: textColor, textAlign: "left" },
                ]}
              >
                Why did you decide to delete the Account?
              </Text>
              <View style={{ marginVertical: 10 }}>
                {deleteReasons.map((reason, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.reasonRow}
                    onPress={() => handleReasonToggle(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.reasonText, { color: secondaryTextColor }]}
                    >
                      {reason}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: primaryColor,
                          backgroundColor: selectedReasons.includes(idx)
                            ? primaryColor
                            : isDarkMode
                              ? "#444"
                              : "white",
                        },
                      ]}
                    >
                      {selectedReasons.includes(idx) && (
                        <MaterialIcons name="check" size={18} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Text Input is shown ONLY if a reason is selected */}
                {isAnyReasonSelected && (
                  <TextInput
                    multiline
                    placeholder={
                      isOtherReasonSelected
                        ? "Enter your specific reason (Required)"
                        : "Add more details for the reason(s) selected (Required)"
                    }
                    placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                    value={otherReasonText}
                    onChangeText={(text) => {
                      setOtherReasonText(text);
                      setValidationError(null); // Clear error on typing
                    }}
                    style={[
                      styles.reasonTextInput,
                      {
                        backgroundColor: isDarkMode ? "#444" : "#eee",
                        color: textColor,
                        borderColor: dangerColor, // Always highlight as required
                      },
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.modalMessage,
                  { marginTop: 8, color: secondaryTextColor, marginBottom: 20 },
                ]}
              >
                Are you sure you want to proceed to delete your account?
              </Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleToggleModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={handleProceedValidation} // Uses internal validation
                >
                  <Text style={styles.logoutButtonText}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* --- Stage: FINAL CONFIRMATION (New Step) --- */}
          {modalStage === "confirmation" && (
            <View style={{ alignItems: "center", paddingVertical: 10 }}>
              <Ionicons
                name="warning-outline"
                size={80}
                color="red"
                style={{ marginBottom: 15 }}
              />
              <Text
                style={[styles.deleteTitle, { color: "red", marginBottom: 10 }]}
              >
                Final Confirmation
              </Text>
              <Text
                style={[
                  styles.modalMessage,
                  {
                    color: secondaryTextColor,
                    textAlign: "center",
                    marginBottom: 25,
                  },
                ]}
              >
                <Text className="font-poppins-semibold text-red-500">
                  Warning:
                </Text>{" "}
                Deleting your account is permanent and cannot be undone. All
                data will be lost. Are you{" "}
                <Text className="font-poppins-semibold text-red-500">
                  absolutely sure
                </Text>{" "}
                you want to delete your account?
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalStage("reasons")} // Go back
                >
                  <Text style={styles.cancelButtonText}>Go Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={handleFinalDelete} // Executes deletion, moves to 'loading'
                >
                  <Text style={styles.logoutButtonText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* --- Stage: LOADING --- */}
          {modalStage === "loading" && (
            <View style={styles.loadingContainer}>
              <LoadingIndicator color="#21d943" size={100} strokeWidth={10} />
              <Text style={[styles.loadingText, { color: textColor }]}>
                Deleting your account... (This may take a moment)
              </Text>
              {deleteError && (
                <Text style={styles.errorText}>{deleteError}</Text>
              )}
            </View>
          )}

          {/* --- Stage: SUCCESS --- */}
          {modalStage === "success" && (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color="#4BB543"
                style={{ marginBottom: 12 }}
              />
              <Text style={[styles.successText, { color: textColor }]}>
                Account deletion initiated successfully!
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* --- SEPARATE VALIDATION ALERT MODAL (Overlays main modal) --- */}
      <ValidationAlertModal
        isVisible={!!validationError && modalStage === "reasons"} // Only show if error exists and we are on the 'reasons' stage
        message={validationError || ""}
        isDarkMode={isDarkMode}
        onClose={handleCloseValidationError}
      />
    </>
  );
};

// --- STYLES (Validation styles removed from here as they are now in the new component) ---
const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center", // Center content by default for confirmation/loading
  },
  deleteTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
    textAlign: "center",
  },
  deleteMessage: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 16,
    flex: 1,
    fontFamily: "Poppins_400Regular",
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  reasonTextInput: {
    marginTop: 8,
    minHeight: 60,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlignVertical: "top",
    borderWidth: 1,
    // Note: border color for required field is set inline
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#eee", // Light shade of primary color
  },
  cancelButtonText: {
    color: "#000",
    fontFamily: "Poppins_600SemiBold",
  },
  logoutButton: {
    backgroundColor: "red", // Primary Color
  },
  logoutButtonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 18,
    fontFamily: "Poppins_400Regular",
    fontSize: 18,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  successText: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Poppins_500Medium",
  },
});

export default DeleteAccountModal;
