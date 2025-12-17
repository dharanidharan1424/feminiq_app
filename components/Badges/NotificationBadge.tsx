import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

interface Props {
  userId: number | undefined;
  isDarkMode: boolean;
}

const NotificationBadge: React.FC<Props> = ({ userId, isDarkMode }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;
    fetch(
      `https://feminiq-backend.onrender.com/notification/unread-count/${userId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, [userId]);

  if (!count) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center z-50">
      <Text className="text-white text-xs font-bold">{count}</Text>
    </View>
  );
};

export default NotificationBadge;
