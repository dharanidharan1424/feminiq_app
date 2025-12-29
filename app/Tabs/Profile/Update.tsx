/* eslint-disable @typescript-eslint/no-unused-vars */
import CustomInput from "@/components/CustomInput";
import GenderModal from "@/components/Profile/GenderModal";
import indiaStatesCities from "@/constants/Locations2.json";
import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Chase } from "react-native-animated-spinkit";

type AvatarUri = string | null;

const Update: React.FC = () => {
  const { profile, updateProfile, token, isDarkMode } = useAuth();
  const unique_id: string = profile?.unique_id ?? "";

  const { from, staff } = useLocalSearchParams();

  const [avatar, setAvatar] = useState<AvatarUri>(profile?.image || null);
  const [fullName, setFullName] = useState<string>(profile?.fullname || "");
  const [nickname, setNickname] = useState<string>(profile?.name || "");
  const [dob, setDob] = useState<Date | null>(
    profile?.dob ? new Date(profile.dob) : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState<string>(profile?.email || "");
  const [phone, setPhone] = useState<string>(profile?.mobile || "");
  const [gender, setGender] = useState<string>(profile?.gender || "");
  const [addr, setAddr] = useState<string>(profile?.address || "");
  const [addr2, setAddr2] = useState<string>(profile?.altaddress || "");
  const [country, setCountry] = useState<string>("India");
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [modalAddressType, setModalAddressType] = useState<
    "address" | "altaddress"
  >("address");

  // Individual fields for address modal
  const [modalStreet, setModalStreet] = useState("");
  const [modalCity, setModalCity] = useState("");
  const [modalState, setModalState] = useState("");
  const [modalArea, setModalArea] = useState("");
  const [modalDoorNo, setModalDoorNo] = useState("");
  const [modalPincode, setModalPincode] = useState("");
  const [modalLandmark, setModalLandmark] = useState("");

  // Toggle for "Same as Main Address"
  const [sameAsMainAddress, setSameAsMainAddress] = useState(false);

  // Cloudinary upload preset and URL
  const uploadToCloudinary = async (
    imageUri: any,
    fileName = "avatar_yourUserId"
  ) => {
    const data: any = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg", // or get the type dynamically
      name: `${fileName}.jpg`,
    });
    data.append("upload_preset", "Profile_image upload");
    data.append("folder", "feminiq/UserProfiles"); // 👈 this actually makes the folder
    data.append("public_id", fileName);

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dv9s7sm0x/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const cloudinaryData = await res.json();
    return cloudinaryData;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      const fileName =
        profile?.fullname?.replace(/\s+/g, "_") || "default_avatar";
      const cloudinaryResult = await uploadToCloudinary(localUri, fileName);
      setAvatar(cloudinaryResult.secure_url);
    }
  };

  const onChangeDob = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDob(selectedDate);
  };

  const handleContinue = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }

    if (!token) {
      Alert.alert(
        "Error",
        "Authentication token not found. Please login again."
      );
      return;
    }

    const newProfile = {
      image: avatar,
      fullname: fullName,
      name: nickname,
      dob: dob ? dob.toISOString().split("T")[0] : null,
      email,
      mobile: phone,
      gender,
      address: addr,
      altaddress: addr2,
      country: null,
    };

    try {
      showModal("Updating Profile", "", true);
      setIsLoading(true);
      const response = await fetch(
        "http://192.168.1.6:3000/update-profile/",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newProfile),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const json = await response.json();

      if (json.status === "success" && json.profile) {
        await updateProfile(json.profile);
        showModal("Success", "Your profile information was updated.", false);
      } else {
        showModal("Error", json.message || "Failed to update profile.", false);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      showModal("Error", "Network error, please try again.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const [states, setStates] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const loadedStates = Object.keys(indiaStatesCities).map((state) => ({
      label: state,
      value: state,
    }));
    setStates(loadedStates);
  }, []);

  useEffect(() => {
    if (modalState) {
      const stateKey = modalState as keyof typeof indiaStatesCities;
      const loadedCities = indiaStatesCities[stateKey].map((city: string) => ({
        label: city,
        value: city,
      }));
      setCities(loadedCities);
    } else {
      setCities([]);
    }
  }, [modalState]);

  const showModal = (
    title: string,
    message: string,
    isLoading: boolean = false
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setLoading(isLoading);
    setModalVisible(true);
  };

  const hideModal = () => {
    if (!loading) setModalVisible(false);
  };

  const openAddressModal = (type: "address" | "altaddress") => {
    setModalAddressType(type);
    setSameAsMainAddress(false); // Reset toggle when opening modal
    const addrToParse = type === "address" ? addr : addr2;

    if (addrToParse && addrToParse.trim() !== "") {
      const parts = addrToParse.split(",");
      // Expected minimum parts: DoorNo, Street, Area, City, State - Pincode
      const doorNo = parts[0]?.trim() || "";
      const street = parts[1]?.trim() || "";
      const area = parts[2]?.trim() || "";
      const city = parts[3]?.trim() || "";

      let state = "";
      let pincode = "";
      let landmark = "";

      if (parts[4]) {
        // parts[4] should be "State - Pincode" often
        const stateZip = parts[4].split("-").map((s) => s.trim());
        state = stateZip[0] || "";
        pincode = stateZip[1] || "";
      }
      if (parts[5]) {
        landmark = parts[5].replace(/^Landmark:\s*/, "").trim();
      }

      setModalDoorNo(doorNo);
      setModalStreet(street);
      setModalArea(area);
      setModalCity(city);
      setModalState(
        Object.keys(indiaStatesCities).includes(state) ? state : ""
      );
      setModalPincode(pincode);
      setModalLandmark(landmark);
    } else {
      // Clear all modal fields for fresh input
      setModalDoorNo("");
      setModalStreet("");
      setModalArea("");
      setModalCity("");
      setModalState("");
      setModalPincode("");
      setModalLandmark("");
    }

    setAddressModalVisible(true);
  };

  let staffData: any = null;
  let serviceId = "";
  if (staff) {
    try {
      const staffString = Array.isArray(staff) ? staff[0] : staff;
      const parsed =
        typeof staffString === "string" ? JSON.parse(staffString) : staffString;
      staffData = parsed;
      serviceId = parsed?.service_id ?? "";
    } catch {
      serviceId = "";
    }
  }

  const backNavigation = () => {
    if (from === "cart") {
      router.push("/Cart");
    } else if (from === "package") {
      router.push({
        pathname: "/Details",
        params: { ...staffData },
      });
    } else {
      router.back();
    }
  };

  useEffect(() => {
    const backAction = () => {
      backNavigation();
      return true; // prevent default back
    };
    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => handler.remove();
  }, [from, staffData]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: isDarkMode ? "#333" : "#fff", flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 20,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              marginBottom: 20,
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDarkMode ? "#eee" : "#000"}
              onPress={backNavigation}
            />
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 24,
                color: isDarkMode ? "#eee" : "#000",
              }}
            >
              Fill Your Profile
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
              position: "relative",
            }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: "#ccc",
                }}
              />
            ) : (
              <View
                style={{
                  width: 144,
                  height: 144,
                  borderRadius: 72,
                  backgroundColor: "#ddd",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="person" size={96} color="#aaa" />
              </View>
            )}
            <TouchableOpacity
              style={{
                position: "absolute",
                right: 100,
                bottom: 0,
                backgroundColor: "rgba(255, 102, 153, 0.7)",
                borderRadius: 12,
                padding: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={pickImage}
            >
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16 }}>
            <CustomInput
              placeholder="Profile Id"
              value={unique_id}
              leftIconName="id-card"
              isDarkMode={isDarkMode}
              editable={false}
              profileId={true}
            />
            <CustomInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              leftIconName="person"
              isDarkMode={isDarkMode}
              isEditing={isEditing}
              editable={isEditing}
            />
            <CustomInput
              placeholder="Nickname"
              value={nickname}
              onChangeText={setNickname}
              leftIconName="person-outline"
              isDarkMode={isDarkMode}
              isEditing={isEditing}
              editable={isEditing}
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              disabled={!isEditing}
              activeOpacity={0.8}
            >
              <CustomInput
                placeholder="Date of Birth"
                value={dob ? dob.toISOString().split("T")[0] : ""}
                editable={false}
                leftIconName="calendar"
                isDarkMode={isDarkMode}
                isEditing={isEditing}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                maximumDate={new Date()}
                display="spinner"
                onChange={onChangeDob}
                themeVariant={isDarkMode ? "dark" : "light"}
              />
            )}

            <CustomInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              leftIconName="mail"
              keyboardType="email-address"
              isDarkMode={isDarkMode}
              isEditing={isEditing}
              editable={isEditing}
            />
            <CustomInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIconName="call"
              isDarkMode={isDarkMode}
              isEditing={isEditing}
              editable={isEditing}
            />
            <TouchableOpacity
              disabled={!isEditing}
              onPress={() => setGenderModalVisible(true)}
            >
              <CustomInput
                editable={false}
                placeholder="Gender"
                value={gender}
                onChangeText={setGender}
                leftIconName="person"
                isDarkMode={isDarkMode}
                isEditing={isEditing}
              />
            </TouchableOpacity>

            <GenderModal
              visible={genderModalVisible}
              onClose={() => setGenderModalVisible(false)}
              onSelectGender={(selected) => setGender(selected)}
              selectedGender={gender}
              isDarkMode={isDarkMode}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isEditing}
              onPress={() => openAddressModal("address")}
            >
              <CustomInput
                placeholder="Address"
                value={addr}
                onChangeText={setAddr}
                leftIconName="location"
                multiline
                isDarkMode={isDarkMode}
                editable={false}
                isEditing={isEditing}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isEditing}
              onPress={() => openAddressModal("altaddress")}
            >
              <CustomInput
                placeholder="Alternative Address"
                value={addr2}
                onChangeText={setAddr2}
                leftIconName="location"
                multiline
                isDarkMode={isDarkMode}
                editable={false}
                isEditing={isEditing}
              />
            </TouchableOpacity>

            <CustomInput
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
              leftIconName="location"
              multiline
              isDarkMode={isDarkMode}
              profileId={true}
              editable={false}
            />
          </View>

          <TouchableOpacity
            style={{
              marginTop: 32,
              backgroundColor: "#ff5acc",
              borderRadius: 24,
              paddingVertical: 8,
              paddingHorizontal: 32,
              width: "100%",
            }}
            onPress={() => {
              if (isEditing) {
                // Currently in edit mode, so save changes
                handleContinue();
                setIsEditing(false);
              } else {
                // Not editing, switch to editing mode
                setIsEditing(true);
              }
            }}
            disabled={isLoading} // disable button while loading
          >
            <Text
              style={{
                color: "white",

                fontSize: 18,
                textAlign: "center",
              }}
              className="font-poppins-semibold"
            >
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal
          visible={addressModalVisible}
          transparent
          statusBarTranslucent
          animationType="slide"
          onRequestClose={() => setAddressModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: isDarkMode ? "#222" : "#fff",
                borderRadius: 12,
                padding: 20,
              }}
              className="gap-3"
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  marginBottom: 20,
                  color: isDarkMode ? "#eee" : "#222",
                }}
                className="border-b border-gray-300 pb-2 mb-4"
              >
                Edit{" "}
                {modalAddressType === "address" ? "Address" : "Alt. Address"}
              </Text>

              {/* Toggle for "Same as Main Address" - only show for alternative address */}
              {modalAddressType === "altaddress" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Poppins_500Medium",
                      color: isDarkMode ? "#eee" : "#222",
                    }}
                  >
                    Same as Main Address
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newValue = !sameAsMainAddress;
                      setSameAsMainAddress(newValue);

                      if (newValue && addr && addr.trim() !== "") {
                        // Copy main address to alternative address fields
                        const parts = addr.split(",");
                        const doorNo = parts[0]?.trim() || "";
                        const street = parts[1]?.trim() || "";
                        const area = parts[2]?.trim() || "";
                        const city = parts[3]?.trim() || "";

                        let state = "";
                        let pincode = "";
                        let landmark = "";

                        if (parts[4]) {
                          const stateZip = parts[4].split("-").map((s) => s.trim());
                          state = stateZip[0] || "";
                          pincode = stateZip[1] || "";
                        }
                        if (parts[5]) {
                          landmark = parts[5].replace(/^Landmark:\s*/, "").trim();
                        }

                        setModalDoorNo(doorNo);
                        setModalStreet(street);
                        setModalArea(area);
                        setModalCity(city);
                        setModalState(
                          Object.keys(indiaStatesCities).includes(state) ? state : ""
                        );
                        setModalPincode(pincode);
                        setModalLandmark(landmark);
                      } else if (!newValue) {
                        // Clear fields when toggle is turned off
                        setModalDoorNo("");
                        setModalStreet("");
                        setModalArea("");
                        setModalCity("");
                        setModalState("");
                        setModalPincode("");
                        setModalLandmark("");
                      }
                    }}
                    style={{
                      width: 50,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: sameAsMainAddress ? "#ff5acc" : "#ccc",
                      justifyContent: "center",
                      paddingHorizontal: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#fff",
                        alignSelf: sameAsMainAddress ? "flex-end" : "flex-start",
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* State Dropdown */}
              <Dropdown
                style={{
                  borderColor: "#ddd",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 48,
                  marginBottom: 12,
                }}
                data={states}
                labelField="label"
                valueField="value"
                placeholder="Select State"
                fontFamily="Poppins_400Regular"
                value={modalState}
                onChange={(item: any) => {
                  setModalState(item.value);
                  setModalCity(""); // Reset city when state changes
                }}
                disable={!isEditing || (modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              {/* City Dropdown */}
              <Dropdown
                style={{
                  borderColor: "#ddd",
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 48,
                  marginBottom: 12,
                }}
                data={cities}
                labelField="label"
                valueField="value"
                placeholder="Select City"
                fontFamily="Poppins_400Regular"
                value={modalCity}
                onChange={(item: any) => setModalCity(item.value)}
                disable={!modalState || (modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              <CustomInput
                placeholder="Area"
                value={modalArea}
                onChangeText={setModalArea}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                editable={!(modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              <CustomInput
                placeholder="Street"
                value={modalStreet}
                onChangeText={setModalStreet}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                editable={!(modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              <CustomInput
                placeholder="Door No"
                value={modalDoorNo}
                onChangeText={setModalDoorNo}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                editable={!(modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              <CustomInput
                placeholder="Pincode (6 digits)"
                value={modalPincode}
                onChangeText={(txt) => {
                  // Only allow numbers, max 6 digits
                  if (/^\d{0,6}$/.test(txt)) setModalPincode(txt);
                }}
                keyboardType="numeric"
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                editable={!(modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              <CustomInput
                placeholder="Landmark (optional)"
                value={modalLandmark}
                onChangeText={setModalLandmark}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                editable={!(modalAddressType === "altaddress" && sameAsMainAddress)}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={{ marginRight: 12 }}
                  onPress={() => setAddressModalVisible(false)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#888",
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (
                      !modalState ||
                      !modalCity ||
                      !modalArea ||
                      !modalStreet ||
                      !modalDoorNo ||
                      !modalPincode ||
                      modalPincode.length !== 6
                    ) {
                      Alert.alert(
                        "Incomplete Address",
                        "Please fill all required address fields and enter a valid 6 digit pincode."
                      );
                      return;
                    }
                    const formattedAddress = `${modalDoorNo}, ${modalStreet}, ${modalArea}, ${modalCity}, ${modalState} - ${modalPincode}${modalLandmark ? `, Landmark: ${modalLandmark}` : ""}`;
                    if (modalAddressType === "address") {
                      setAddr(formattedAddress);
                    } else {
                      setAddr2(formattedAddress);
                    }
                    setAddressModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#FF5ACC",
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#333" : "#fff",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 12,
                color: isDarkMode ? "#eee" : "#222",
                textAlign: "center",
              }}
            >
              {modalTitle}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
                marginBottom: 20,
                color: isDarkMode ? "#ccc" : "#444",
              }}
            >
              {modalMessage}
            </Text>

            {loading && (
              <Chase size={50} color="#FF5ACC" style={{ marginBottom: 12 }} />
            )}

            {!loading && (
              <TouchableOpacity
                onPress={() => {
                  hideModal();
                }}
                style={{
                  backgroundColor: "#FF5ACC",
                  borderRadius: 25,
                  paddingVertical: 12,
                  paddingHorizontal: 36,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Update;
