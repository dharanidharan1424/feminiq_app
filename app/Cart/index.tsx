import { useAuth } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Flow, Wave } from "react-native-animated-spinkit";

interface ServiceTypeData {
  id: number;
  category_id: string;
  name: string;
  price: string;
  booked: number;
  mobile_url: string;
  staff_id: number;
  quantity?: number;
  type: string;
}

interface PackageType {
  mobile_url?: string;
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  staff_id: number;
  quantity?: number;
  type: string;
}

interface Staff {
  id: number;
  name: string;
}

const Index: React.FC = () => {
  const { token, isDarkMode, profile } = useAuth();

  const [bookedServices, setBookedServices] = useState<ServiceTypeData[]>([]);
  const [bookedPackages, setBookedPackages] = useState<PackageType[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedStaffData, setSelectedStaffData] = useState<Staff | null>(
    null
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "services" | "packages";
  } | null>(null);

  // Fetch booked services from AsyncStorage
  useEffect(() => {
    if (!token) return;

    const fetchBookedServices = async () => {
      try {
        const storedServices = await AsyncStorage.getItem(
          `selectedServices_${token}`
        );
        if (storedServices) {
          const services: ServiceTypeData[] = JSON.parse(storedServices).map(
            (s: any) => ({
              ...s,
              quantity: s.quantity ?? 1,
            })
          );
          setBookedServices(services);
        } else {
          setBookedServices([]);
        }
      } catch (error) {
        console.error("Error fetching booked services", error);
      }
    };

    const fetchBookedPackages = async () => {
      try {
        const storedPackages = await AsyncStorage.getItem(
          `cart_packages_${token}`
        );
        if (storedPackages) {
          const packages: PackageType[] = JSON.parse(storedPackages).map(
            (p: any) => ({
              ...p,
              quantity: p.quantity ?? 1,
            })
          );
          setBookedPackages(packages);
        } else {
          setBookedPackages([]);
        }
      } catch (error) {
        console.error("Error fetching booked packages", error);
      }
    };

    fetchBookedServices();
    fetchBookedPackages();
  }, [token]);

  // Fetch all staffs for name lookup
  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://femiiniq-backend.onrender.com/api/get-staffs"
        );
        const json = await response.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setStaffs(json.data);
        } else {
          setStaffs([]);
        }
      } catch (error) {
        console.log(error);
        setStaffs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffs();
  }, []);

  useEffect(() => {
    if (selectedStaffId === null) {
      setSelectedStaffData(null);
      return;
    }
    const staff = staffs.find((s) => s.id === selectedStaffId) ?? null;
    setSelectedStaffData(staff);
  }, [selectedStaffId, staffs]);

  // Group booked items by staff_id
  const itemsByStaff = useMemo(() => {
    const grouped: Record<
      number,
      { services: ServiceTypeData[]; packages: PackageType[] }
    > = {};
    bookedServices.forEach((s) => {
      if (!grouped[s.staff_id])
        grouped[s.staff_id] = { services: [], packages: [] };
      grouped[s.staff_id].services.push(s);
    });
    bookedPackages.forEach((p) => {
      if (!grouped[p.staff_id])
        grouped[p.staff_id] = { services: [], packages: [] };
      grouped[p.staff_id].packages.push(p);
    });
    return grouped;
  }, [bookedServices, bookedPackages]);

  // Calculate subtotal for currently selected staff only
  useEffect(() => {
    if (selectedStaffId === null) {
      setTotalPrice(0);
      return;
    }

    const group = itemsByStaff[selectedStaffId];
    if (!group) {
      setTotalPrice(0);
      return;
    }

    const priceSum =
      group.services.reduce(
        (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
        0
      ) +
      group.packages.reduce(
        (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
        0
      );
    setTotalPrice(priceSum);
  }, [selectedStaffId, itemsByStaff]);

  // Get staff name by id
  const getStaffName = (id: number) => {
    const staff = staffs.find((s) => s.id === id);
    return staff ? staff.name : "Unknown Artist";
  };

  const getStaffById = (id: number): Staff | null => {
    const staff = staffs.find((s) => s.id === id);
    return staff ?? null;
  };

  const handleNavigateToStaff = (staffId: number) => {
    const staffData = staffs.find((s) => s.id === staffId);
    console.log("Navigating to staff:", staffData);
    if (staffData) {
      router.push({
        pathname: "/Details",
        params: {
          staffData: JSON.stringify(staffData),
        },
      });
    } else {
      console.warn("Staff not found");
    }
  };

  // Toggle selected staff in accordion (only one allowed)
  const toggleStaff = (staffId: number) => {
    setSelectedStaffId((prev) => (prev === staffId ? null : staffId));
  };

  // Update quantity helper for selected staff's items
  const updateQuantity = async (
    id: number,
    type: "services" | "packages",
    increment: boolean
  ) => {
    if (!token || selectedStaffId === null) return;

    if (type === "services") {
      const updated = bookedServices.map((item) => {
        if (item.id === id && item.staff_id === selectedStaffId) {
          const newQty = increment
            ? (item.quantity ?? 1) + 1
            : (item.quantity ?? 1) - 1;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
      setBookedServices(updated);
      await AsyncStorage.setItem(
        `selectedServices_${token}`,
        JSON.stringify(updated)
      );
    } else {
      const updated = bookedPackages.map((item) => {
        if (item.id === id && item.staff_id === selectedStaffId) {
          const newQty = increment
            ? (item.quantity ?? 1) + 1
            : (item.quantity ?? 1) - 1;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
      setBookedPackages(updated);
      await AsyncStorage.setItem(
        `cart_packages_${token}`,
        JSON.stringify(updated)
      );
    }
  };

  const confirmDeleteItem = (id: number, type: "services" | "packages") => {
    setItemToDelete({ id, type });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !token || selectedStaffId === null) {
      setDeleteModalVisible(false);
      return;
    }

    if (itemToDelete.type === "services") {
      const filtered = bookedServices.filter(
        (s) => s.id !== itemToDelete.id || s.staff_id !== selectedStaffId
      );
      setBookedServices(filtered);
      await AsyncStorage.setItem(
        `selectedServices_${token}`,
        JSON.stringify(filtered)
      );
    } else {
      const filtered = bookedPackages.filter(
        (p) => p.id !== itemToDelete.id || p.staff_id !== selectedStaffId
      );
      setBookedPackages(filtered);
      await AsyncStorage.setItem(
        `cart_packages_${token}`,
        JSON.stringify(filtered)
      );
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  // Handle hardware back button to navigate Tabs
  useEffect(() => {
    const backAction = () => {
      router.push("/Tabs");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const staffIds = Object.keys(itemsByStaff);
    if (staffIds.length > 0 && selectedStaffId === null) {
      setSelectedStaffId(Number(staffIds[0]));
    }
  }, [itemsByStaff]);

  const handleCheckout = async (staffId: number) => {
    if (isCheckoutLoading) return; // prevent multiple calls

    setIsCheckoutLoading(true);
    try {
      const group = itemsByStaff[staffId];
      if (!group) return;

      await AsyncStorage.setItem(
        `selectedBookingItems_${token}`,
        JSON.stringify(group)
      );

      const staff = staffs.find((s) => s.id === staffId);
      router.push({
        pathname: "/CartBooking",
        params: { staff: JSON.stringify(staff) },
      });
      console.log(group);
    } catch (error) {
      console.error("Error storing booking group", error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const validateAndCheckOut = () => {
    if (
      !profile?.fullname?.trim() ||
      !profile?.mobile?.trim() ||
      !profile?.address?.trim()
    ) {
      setModalVisible(true);
      return;
    }
    handleCheckout(selectedStaffId);
  };

  const getColor = (lightColor: string, darkColor: string) =>
    isDarkMode ? darkColor : lightColor;

  const handleCardPress = (serviceId: number, name: string) => {
    router.push({
      pathname: "/Details/ServiceType",
      params: { serviceId, name },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getColor("#fff", "#121212") },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: getColor("#eee", "#444"),
            backgroundColor: getColor("#fff", "#1c1c1c"),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push("/Tabs")}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={getColor("#000", "#fff")}
          />
          <Text
            style={[styles.headerTitle, { color: getColor("#232323", "#eee") }]}
          >
            Cart Items
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={[
            {
              flex: 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 200,
              paddingHorizontal: 150,
            },
            { backgroundColor: getColor("#fff", "#121212") },
          ]}
        >
          <Wave size={50} color="#FF5ACC" style={{ flex: 1 }} />
        </View>
      ) : Object.keys(itemsByStaff).length === 0 ? (
        <Text
          style={[styles.noServicesText, { color: getColor("#666", "#bbb") }]}
        >
          No items in cart.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
          {Object.entries(itemsByStaff).map(
            ([staffIdStr, { services, packages }]) => {
              const staffId = Number(staffIdStr);
              const isSelected = staffId === selectedStaffId;

              return (
                <View
                  key={staffId}
                  style={[
                    styles.accordionContainer,
                    { backgroundColor: getColor("#fafafa", "#222") },
                  ]}
                >
                  {/* Accordion header */}
                  <TouchableOpacity
                    style={[
                      styles.staffHeader,
                      isSelected
                        ? styles.staffHeaderSelected
                        : { backgroundColor: getColor("#eee", "#333") },
                    ]}
                    onPress={() => toggleStaff(staffId)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.staffHeaderText,
                        isSelected
                          ? styles.staffHeaderTextSelected
                          : { color: getColor("#333", "#ddd") },
                      ]}
                    >
                      {getStaffName(staffId)}
                    </Text>
                    <Ionicons
                      name={isSelected ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={isSelected ? "#fff" : getColor("#666", "#bbb")}
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>

                  {/* Accordion content */}
                  {isSelected && (
                    <>
                      {/* Services */}
                      {services.map((service) => (
                        <View key={service.id}>
                          <TouchableOpacity
                            onPress={() =>
                              handleCardPress(service.id, service.name)
                            }
                          >
                            <View
                              key={service.id}
                              style={[
                                styles.cartCard,
                                { backgroundColor: getColor("#fff", "#111") },
                              ]}
                            >
                              <Image
                                source={{ uri: service.mobile_url }}
                                style={styles.itemImage}
                              />
                              <View style={styles.itemDetails}>
                                <View className="flex-row gap-2 items-center">
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.itemName,
                                      { color: getColor("#222", "#eee") },
                                    ]}
                                  >
                                    {service.name}
                                  </Text>
                                  <View
                                    className="px-1 py-[0.5px] rounded-md mb-1"
                                    style={[{ backgroundColor: "#FF5ACC" }]}
                                  >
                                    <Text style={styles.tagText}>Service</Text>
                                  </View>
                                </View>

                                <Text
                                  style={[
                                    styles.artistName,
                                    { color: getColor("#666", "#bbb") },
                                  ]}
                                >
                                  Artist Name: {getStaffName(service.staff_id)}
                                </Text>
                                <View style={styles.bottomRow}>
                                  <Text
                                    style={[
                                      styles.itemPrice,
                                      { color: "#FF5ACC" },
                                    ]}
                                  >
                                    ₹ {service.price}
                                  </Text>
                                  <View style={styles.qtyManager}>
                                    <TouchableOpacity
                                      style={[styles.qtyBtn, styles.decrease]}
                                      onPress={() =>
                                        updateQuantity(
                                          service.id,
                                          "services",
                                          false
                                        )
                                      }
                                    >
                                      <Text style={styles.qtyBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text
                                      style={[
                                        styles.qtyNum,
                                        { color: getColor("#333", "#ddd") },
                                      ]}
                                    >
                                      {service.quantity || 1}
                                    </Text>
                                    <TouchableOpacity
                                      style={[styles.qtyBtn, styles.increase]}
                                      onPress={() =>
                                        updateQuantity(
                                          service.id,
                                          "services",
                                          true
                                        )
                                      }
                                    >
                                      <Text style={styles.qtyBtnText}>+</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                              <TouchableOpacity
                                onPress={() =>
                                  confirmDeleteItem(service.id, "services")
                                }
                                style={styles.deleteButton}
                              >
                                <Ionicons
                                  name="trash"
                                  size={18}
                                  color="#FF5ACC"
                                />
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {/* Packages */}
                      {packages.map((pkg) => (
                        <TouchableOpacity
                          key={pkg.id}
                          onPress={() =>
                            router.push({
                              pathname: "/Details",
                              params: {
                                ...selectedStaffData,
                                type: "package",
                              },
                            })
                          }
                        >
                          <View
                            key={pkg.id}
                            style={[
                              styles.cartCard,
                              { backgroundColor: getColor("#fff", "#111") },
                            ]}
                          >
                            <Image
                              source={{ uri: pkg.mobile_url || pkg.image }}
                              style={styles.itemImage}
                            />
                            <View style={styles.itemDetails}>
                              <View className="flex-row gap-2 items-center">
                                <Text
                                  numberOfLines={1}
                                  style={[
                                    styles.itemName,
                                    { color: getColor("#222", "#eee") },
                                  ]}
                                >
                                  {pkg.name}
                                </Text>
                                <View
                                  className="px-1 py-[0.5px] rounded-md mb-1"
                                  style={[{ backgroundColor: "#FF5ACC" }]}
                                >
                                  <Text style={styles.tagText}>Package</Text>
                                </View>
                              </View>
                              <Text
                                style={[
                                  styles.artistName,
                                  { color: getColor("#666", "#bbb") },
                                ]}
                              >
                                Artist Name: {getStaffName(pkg.staff_id)}
                              </Text>
                              <View style={styles.bottomRow}>
                                <Text
                                  style={[
                                    styles.itemPrice,
                                    { color: "#FF5ACC" },
                                  ]}
                                >
                                  ₹ {pkg.price}
                                </Text>
                                <View style={styles.qtyManager}>
                                  <TouchableOpacity
                                    style={[styles.qtyBtn, styles.decrease]}
                                    onPress={() =>
                                      updateQuantity(pkg.id, "packages", false)
                                    }
                                  >
                                    <Text style={styles.qtyBtnText}>-</Text>
                                  </TouchableOpacity>
                                  <Text
                                    style={[
                                      styles.qtyNum,
                                      { color: getColor("#333", "#ddd") },
                                    ]}
                                  >
                                    {pkg.quantity || 1}
                                  </Text>
                                  <TouchableOpacity
                                    style={[styles.qtyBtn, styles.increase]}
                                    onPress={() =>
                                      updateQuantity(pkg.id, "packages", true)
                                    }
                                  >
                                    <Text style={styles.qtyBtnText}>+</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() =>
                                confirmDeleteItem(pkg.id, "packages")
                              }
                              style={styles.deleteButton}
                            >
                              <Ionicons
                                name="trash"
                                size={18}
                                color="#FF5ACC"
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={{
                          marginTop: 10,
                          marginBottom: 20,
                          alignSelf: "center",
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 6,
                          paddingHorizontal: 20,
                        }}
                        activeOpacity={0.8}
                        onPress={() => {
                          handleNavigateToStaff(staffId);
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#FF5ACC",
                            borderRadius: 999,
                            width: 20,
                            height: 20,
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 8,
                          }}
                        >
                          <Ionicons name="add" size={14} color="white" />
                        </View>
                        <Text
                          style={{
                            color: "#FF5ACC",
                            fontFamily: "Poppins_500Medium",
                            fontSize: 14,
                          }}
                        >
                          Add More
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }
          )}
        </ScrollView>
      )}

      {/* Footer with subtotal and checkout */}
      {selectedStaffId !== null && itemsByStaff[selectedStaffId] && (
        <View
          style={[
            styles.footer,
            { backgroundColor: getColor("#fff", "#121212") },
          ]}
        >
          <View>
            <Text
              style={[
                styles.subtotalLabel,
                { color: getColor("#888", "#aaa") },
              ]}
            >
              Subtotal
            </Text>
            <Text
              style={[
                styles.subtotalPrice,
                { color: getColor("#222", "#eee") },
              ]}
            >
              ₹ {totalPrice.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => validateAndCheckOut()}
          >
            {isCheckoutLoading ? (
              <Flow size={50} color="#fff" />
            ) : (
              <Text style={styles.checkoutText}>Checkout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
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
              maxWidth: 320,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 12,
                color: isDarkMode ? "#eee" : "#222",
                textAlign: "center",
              }}
            >
              Confirm Delete
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
                marginBottom: 20,
                color: isDarkMode ? "#ccc" : "#444",
              }}
            >
              Are you sure you want to remove this item from your cart?
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={{
                  flex: 1,
                  marginRight: 10,
                  paddingVertical: 10,
                  borderRadius: 25,
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#666" : "#ccc",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: isDarkMode ? "#eee" : "#333",
                    fontFamily: "Poppins_600SemiBold",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  paddingVertical: 10,
                  borderRadius: 25,
                  backgroundColor: "#FF5ACC",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontFamily: "Poppins_600SemiBold" }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Profile Verification Modal */}
      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: isDarkMode ? "#1E1E1E" : "white",
              borderRadius: 20,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_600SemiBold",
                marginBottom: 12,
                textAlign: "center",
                color: "#FF5ACC",
              }}
            >
              Complete Your Profile
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                textAlign: "center",
                marginBottom: 24,
                color: isDarkMode ? "#ccc" : "#232323",
              }}
            >
              Please update your profile with your name, mobile number, and
              address to continue booking.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#FF5ACC",
                paddingVertical: 14,
                paddingHorizontal: 40,
                borderRadius: 30,
              }}
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: "/Tabs/Profile/Update",
                  params: {
                    from: "cart",
                  },
                });
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                Update Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoButton: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#232323",
    marginLeft: 8,
  },
  noServicesText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginTop: 24,
  },
  accordionContainer: {
    marginBottom: 16,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  staffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#eee",
  },
  staffHeaderSelected: {
    backgroundColor: "#FF5ACC",
  },
  staffHeaderText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  staffHeaderTextSelected: {
    color: "#fff",
  },
  cartCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    position: "relative",
  },

  tagText: {
    fontSize: 8,
    fontFamily: "Poppins_400Regular",
    color: "#fff",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
  },
  artistName: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#888",
    marginVertical: 2,
  },
  itemPrice: {
    color: "#FF5ACC",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  qtyManager: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
  },
  increase: { backgroundColor: "#e5ffe5" }, // light green
  decrease: { backgroundColor: "#ffe5e5" }, // light red
  qtyBtnText: { color: "#333", fontSize: 14, fontWeight: "700" },
  qtyNum: { fontSize: 13, fontWeight: "600", marginHorizontal: 4 },
  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  subtotalLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#888",
  },
  subtotalPrice: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
    marginTop: 4,
  },
  checkoutButton: {
    backgroundColor: "#FF5ACC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
});

export default Index;
