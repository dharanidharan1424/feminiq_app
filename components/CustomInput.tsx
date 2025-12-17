import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomInputProps extends TextInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  onRightIconPress?: () => void;
  error?: boolean | string;
  isDarkMode?: boolean; // Add dark mode prop
  profileId?: boolean;
  isEditing?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  placeholder = "",
  value,
  profileId,
  onChangeText,
  leftIconName,
  rightIconName,
  onRightIconPress,
  secureTextEntry = false,
  error,
  rightText,
  isEditing,
  isDarkMode = false, // default to false
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center px-4 py-3 rounded-xl ${
        error
          ? "border-2 border-red-500 bg-red-100"
          : isFocused
            ? isDarkMode
              ? "bg-pink-900 border-2 border-pink-500"
              : "bg-pink-100 border-2 border-primary"
            : isDarkMode
              ? "bg-[#333] border border-gray-700"
              : "bg-gray-100"
      }`}
    >
      {/* Left Icon (optional) */}
      {leftIconName && (
        <Ionicons
          name={leftIconName}
          size={20}
          color={isDarkMode ? "#222" : "#666"}
          style={{ marginRight: 8 }}
        />
      )}

      {/* Text Input */}
      <TextInput
        className={`flex-1 text-base bg-transparent ${
          profileId || !isEditing
            ? "text-black/30"
            : isDarkMode
              ? "text-gray-200"
              : "text-gray-800"
        }`}
        style={{ fontFamily: "Poppins_400Regular" }}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#999" : "#999"}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {/* Right Icon (optional) */}
      <TouchableOpacity onPress={onRightIconPress}>
        {rightIconName && (
          <Ionicons
            name={rightIconName}
            size={20}
            color={isDarkMode ? "#ddd" : "#666"}
          />
        )}
        {rightText && isEditing && (
          <Text className="text-base font-poppins-regular text-primary">
            {rightText}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CustomInput;
