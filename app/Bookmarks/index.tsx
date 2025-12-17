import React, { useState, useEffect } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import { useAuth } from "@/context/UserContext";
import ProfileCard from "@/components/CustomCard";
import { router } from "expo-router";
import PackageCard from "@/components/PackageCard";
import ServiceCard from "@/components/ServiceCard";

interface Staff {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  mobile_image_url?: string;
}
interface Service {
  id: number;
  category_id: number;
  name: string;
  image: string;
  booked: number;
  price: string;
  original_price: string | null;
  staff_id: number;
  discount_price: string | null;
  duration: string;
  description: string;
  procedure: string;
  mobile_url: string;
}
interface PackageType {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  mobile_url: string;
  staff_id: number;
  booked: string;
  process: string;
  original_price: string;
}

type TabKey = "staffs" | "services" | "packages";

const TAB_META = [
  { key: "staffs" as TabKey, label: "Artists", icon: "people" },
  { key: "services" as TabKey, label: "Services", icon: "color-palette-sharp" },
  { key: "packages" as TabKey, label: "Packages", icon: "cube" },
];

function RemoveModal({
  visible,
  item,
  tab,
  onCancel,
  onConfirm,
  isDarkMode,
}: {
  visible: boolean;
  item: Staff | Service | PackageType | null;
  tab: TabKey;
  onCancel: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}) {
  if (!item) return null;

  const title =
    tab === "staffs"
      ? (item as Staff).name
      : (item as Service | PackageType).name;
  const address = tab === "staffs" ? (item as Staff).address : null;
  const distance = tab === "staffs" ? (item as Staff).distance : null;
  const rating = tab === "staffs" ? (item as Staff).rating : null;
  const price = tab !== "staffs" ? (item as Service | PackageType).price : null;
  const booked =
    tab !== "staffs" ? (item as Service | PackageType).booked : null;
  const avatarUrl =
    tab === "staffs"
      ? (item as Staff).mobile_image_url
      : (item as Service | PackageType).mobile_url;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onCancel}
      style={{ justifyContent: "flex-end", margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
    >
      <View
        className={`rounded-t-3xl p-6 ${
          isDarkMode ? "bg-zinc-900" : "bg-white"
        }`}
        style={{ elevation: 12, shadowOpacity: 0.15, shadowRadius: 16 }}
      >
        <Text
          className={`text-xl font-poppins-semibold text-center mb-4 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Remove from Bookmarks?
        </Text>

        <View
          className={`flex-row items-center p-4 mb-5 rounded-xl border ${
            isDarkMode
              ? "bg-zinc-800 border-zinc-700"
              : "bg-gray-100 border-primary/50"
          }`}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-14 h-14 rounded-lg mr-4 bg-zinc-700"
            />
          ) : (
            <View className="w-14 h-14 bg-zinc-700 rounded-lg mr-4" />
          )}
          <View className="flex-1">
            <Text
              className={`text-lg font-poppins-semibold mb-1 ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              {title}
            </Text>
            {tab === "staffs" && address && (
              <Text
                className={`text-sm mb-1 font-poppins-regular ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {address}
              </Text>
            )}
            {tab === "staffs" && distance !== null && rating !== null && (
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="location-pin"
                    size={16}
                    color="#FF49AC"
                  />
                  <Text
                    className={`text-sm font-poppins-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {Number(distance).toFixed(1)} km
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons
                    name={rating < 5 ? "star-half" : "star"}
                    size={16}
                    color="#FF49AC"
                  />
                  <Text
                    className={`text-sm font-poppins-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {Number(rating).toFixed(1)}
                  </Text>
                </View>
              </View>
            )}
            {(tab === "services" || tab === "packages") && (
              <>
                <Text
                  className={`text-sm font-poppins-regular ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Price: ₹{price}
                </Text>
                {booked !== null && (
                  <Text
                    className={`text-sm font-poppins-regular ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Booked: {booked}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={onCancel}
            className={`flex-1 py-3 rounded-full border border-primary items-center ${
              isDarkMode ? "bg-primary/90/40" : "bg-white"
            }`}
          >
            <Text
              className={`text-lg font-poppins-semibold ${
                isDarkMode ? "text-primary/20" : "text-primary"
              }`}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            className="flex-1 py-3 rounded-full bg-primary items-center"
          >
            <Text className="text-white text-lg font-poppins-semibold">
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const Bookmarks = () => {
  const { token, isDarkMode, showToast } = useAuth();

  const [bookmarkedStaffs, setBookmarkedStaffs] = useState<Staff[]>([]);
  const [bookmarkedServices, setBookmarkedServices] = useState<Service[]>([]);
  const [bookmarkedPackages, setBookmarkedPackages] = useState<PackageType[]>(
    []
  );

  const [activeTab, setActiveTab] = useState<TabKey>("staffs");
  useEffect(() => {
    async function loadBookmarks() {
      try {
        if (!token) return;
        const staffsData = await AsyncStorage.getItem(
          `bookmarkedStaffs_${token}`
        );
        const servicesData = await AsyncStorage.getItem(
          `bookmarkedServices_${token}`
        );
        const packagesData = await AsyncStorage.getItem(
          `bookmarkedPackages_${token}`
        );

        setBookmarkedStaffs(staffsData ? JSON.parse(staffsData) : []);
        setBookmarkedServices(servicesData ? JSON.parse(servicesData) : []);
        setBookmarkedPackages(packagesData ? JSON.parse(packagesData) : []);
      } catch {
        setBookmarkedStaffs([]);
        setBookmarkedServices([]);
        setBookmarkedPackages([]);
      }
    }
    loadBookmarks();
  }, [token]);

  // Remove bookmark handlers
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<
    Staff | Service | PackageType | null
  >(null);

  const openRemoveModal = (item: Staff | Service | PackageType) => {
    setItemToRemove(item);
    setModalVisible(true);
  };

  const closeRemoveModal = () => {
    setModalVisible(false);
    setItemToRemove(null);
  };

  const removeItem = async () => {
    if (!itemToRemove) return;

    let updated,
      key,
      showRemoveToast = false;

    if (activeTab === "staffs") {
      updated = bookmarkedStaffs.filter(
        (s) => s.id !== (itemToRemove as Staff).id
      );
      setBookmarkedStaffs(updated);
      key = `bookmarkedStaffs_${token}`;
      showRemoveToast = true;
    } else if (activeTab === "services") {
      updated = bookmarkedServices.filter(
        (s) => s.id !== (itemToRemove as Service).id
      );
      setBookmarkedServices(updated);
      key = `bookmarkedServices_${token}`;
      showRemoveToast = true;
    } else {
      updated = bookmarkedPackages.filter(
        (s) => s.id !== (itemToRemove as PackageType).id
      );
      setBookmarkedPackages(updated);
      key = `bookmarkedPackages_${token}`;
      showRemoveToast = true;
    }

    await AsyncStorage.setItem(key, JSON.stringify(updated));
    closeRemoveModal();
    if (showRemoveToast) showToast("Bookmark removed", "remove", "top");
  };

  // Content for each tab
  const renderContent = () => {
    if (activeTab === "staffs") {
      return bookmarkedStaffs.length ? (
        bookmarkedStaffs.map((staff) => (
          <ProfileCard
            key={staff.id}
            data={staff}
            avatar={{ uri: staff.mobile_image_url }}
            name={staff.name}
            address={staff.address}
            distance={Number(staff.distance).toFixed(1)}
            rating={Number(staff.rating).toFixed(1)}
            bookmarked={true}
            onPress={() =>
              router.push({
                pathname: "/Details",
                params: { ...staff },
              })
            }
            onBookmarkPress={() => openRemoveModal(staff)}
          />
        ))
      ) : (
        <View className="flex-1 items-center mt-20">
          <Text className="text-gray-400 text-base font-poppins-semibold">
            No bookmarked Artists found.
          </Text>
        </View>
      );
    } else if (activeTab === "services") {
      return bookmarkedServices.length ? (
        bookmarkedServices.map((service, idx) => (
          <View key={idx}>
            <ServiceCard
              isBookmarked={true}
              onBookmarkPress={() => openRemoveModal(service)}
              service={service}
              staffView={true}
            />
          </View>
        ))
      ) : (
        <View className="flex-1 items-center mt-20">
          <Text className="text-gray-400 text-base font-poppins-semibold">
            No bookmarked services found.
          </Text>
        </View>
      );
    } else {
      return bookmarkedPackages.length ? (
        bookmarkedPackages.map((pkg, idx) => (
          <View key={idx}>
            <PackageCard
              isBookmarked={true}
              packageItem={pkg}
              onBookmarkPress={() => openRemoveModal(pkg)}
              staffView={true}
            />
          </View>
        ))
      ) : (
        <View className="flex-1 items-center mt-20">
          <Text className="text-gray-400 text-base font-poppins-semibold">
            No bookmarked packages found.
          </Text>
        </View>
      );
    }
  };

  return (
    <ScrollView
      className={`flex-1 ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
        className={`text-2xl font-poppins-semibold text-center mb-6 ${isDarkMode ? "text-white" : "text-primary"}`}
      >
        My Bookmarks
      </Text>

      {/* Tabs */}
      <View className="flex-row justify-center mb-4">
        {TAB_META.map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            className={`flex-row items-center py-2 px-4 mx-1 rounded-3xl border border-primary ${activeTab === key ? "bg-primary" : "bg-primary/20"}`}
            style={{ minWidth: 100 }}
          >
            <Ionicons
              name={icon}
              size={20}
              color={activeTab === key ? "white" : "#FF5ACC"}
              className="mr-2"
            />
            <Text
              className={`font-poppins-semibold  text-sm ${activeTab === key ? "text-white" : "text-primary"}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View>{renderContent()}</View>

      {/* Remove Bookmark Modal */}
      <RemoveModal
        visible={modalVisible}
        item={itemToRemove}
        tab={activeTab}
        isDarkMode={isDarkMode}
        onCancel={closeRemoveModal}
        onConfirm={removeItem}
      />
    </ScrollView>
  );
};

export default Bookmarks;
