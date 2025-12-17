import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "@/components/CustomToast"; // Your custom toast component

interface User {
  email: string;
  password: string;
}

interface UserProfile {
  type: string | number | (string | number)[] | null | undefined;
  id: string;
  fullname: string;
  email: string;
  address?: string | null;
  altaddress?: string | null;
  country?: string | null;
  created_at?: string | null;
  dob?: string | null;
  gender?: string | null;
  image?: string | null;
  last_password_change?: string | null;
  mobile?: string | null;
  name?: string | null;
  unique_id?: string | null;
}

interface Staff {
  longitude: null | string | number;
  latitude: null | string | number;
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  service_id: string;
  image: string;
  mobile_image_url: string;
  type: string;
  average_rating?: string; // if any
  hourly_rate?: string;
  reviews?: string;
  price?: string; // if 'pricets' is typo for 'price'
  city?: string;
}

const DARK_MODE_STORAGE_KEY = "app_isDarkMode";

interface AuthContextType {
  users: User[];
  addUser: (user: User) => void;
  showUsers: () => void;

  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => Promise<void>;

  token: string | null;
  setToken: (token: string | null) => Promise<void>;

  language: string;
  setLanguage: (lang: string) => void;

  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;

  bookmarkedStaffs: Staff[];
  toggleBookmark: (staff: Staff) => void;

  logout: () => Promise<void>;

  // Toast integration with direction
  showToast: (
    message: string,
    type?: "success" | "remove" | "info",
    direction?: "top" | "bottom"
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const [language, setLanguage] = useState<string>("English (IN)");

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(false);
  const [bookmarkedStaffs, setBookmarkedStaffs] = useState<Staff[]>([]);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "remove" | "info">(
    "info"
  );
  const [toastDirection, setToastDirection] = useState<"top" | "bottom">("top");

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedProfile = await AsyncStorage.getItem("profile");

        if (savedToken) setTokenState(savedToken);
        if (savedProfile) setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.log("Failed to load auth data", e);
      }
    };
    loadAuthData();
  }, []);

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    try {
      if (newToken) {
        await AsyncStorage.setItem("token", newToken);
      } else {
        await AsyncStorage.removeItem("token");
      }
    } catch (e) {
      console.error("Failed to save token to AsyncStorage", e);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      if (newProfile) {
        await AsyncStorage.setItem("profile", JSON.stringify(newProfile));
      } else {
        await AsyncStorage.removeItem("profile");
      }
    } catch (e) {
      console.error("Failed to save profile to AsyncStorage", e);
    }
  };

  const addUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  const showUsers = () => {
    console.log("All Users:", users);
  };

  const toggleBookmark = (staff: Staff) => {
    setBookmarkedStaffs((prev) => {
      const exists = prev.some((item) => item.id === staff.id);
      if (exists) {
        return prev.filter((item) => item.id !== staff.id);
      } else {
        return [...prev, staff];
      }
    });
  };

  const logout = async () => {
    setTokenState(null);
    setProfile(null);
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("profile");
    } catch (e) {
      console.error("Failed to remove auth data from AsyncStorage", e);
    }
  };

  useEffect(() => {
    const loadBookmarkedStaffs = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem(
          `bookmarkedStaffs_${token}`
        );
        if (storedBookmarks) {
          setBookmarkedStaffs(JSON.parse(storedBookmarks));
        }

        if (storedBookmarks) {
          setBookmarkedStaffs(JSON.parse(storedBookmarks));
        }
      } catch (e) {
        console.error("Failed to load bookmarked staffs", e);
      }
    };
    loadBookmarkedStaffs();
  }, [token]);
  useEffect(() => {
    const saveBookmarkedStaffs = async () => {
      try {
        await AsyncStorage.setItem(
          `bookmarkedStaffs_${token}`,
          JSON.stringify(bookmarkedStaffs)
        );
      } catch (e) {
        console.error("Failed to save bookmarked staffs", e);
      }
    };
    saveBookmarkedStaffs();
  }, [bookmarkedStaffs, token]);

  const showToast = (
    message: string,
    type: "success" | "remove" | "info" = "info",
    direction: "top" | "bottom" = "top"
  ) => {
    setToastVisible(false);

    // Use zero timeout to queue next visible update on next tick
    setTimeout(() => {
      setToastMessage(message);
      setToastType(type);
      setToastDirection(direction);
      setToastVisible(true);
    }, 0);
  };

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_STORAGE_KEY);
        if (savedDarkMode !== null) {
          setIsDarkModeState(savedDarkMode === "true");
        }
      } catch (e) {
        console.error("Failed to load dark mode from AsyncStorage", e);
      }
    };
    loadDarkMode();
  }, []);

  // Save dark mode setting whenever it changes
  const setIsDarkMode = async (value: boolean) => {
    setIsDarkModeState(value);
    try {
      await AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, value.toString());
    } catch (e) {
      console.error("Failed to save dark mode to AsyncStorage", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        addUser,
        showUsers,
        profile,
        updateProfile,
        token,
        setToken,
        language,
        setLanguage,
        isDarkMode,
        setIsDarkMode,
        bookmarkedStaffs,
        toggleBookmark,
        logout,
        showToast,
      }}
    >
      {children}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        position={toastDirection}
        duration={2500}
        onHide={() => setToastVisible(false)}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
