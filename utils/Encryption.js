import CryptoJS from "crypto-js";

// Generate random keys only once and log them
// function generateRandomString(length) {
//   const charset =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     result += charset.charAt(Math.floor(Math.random() * charset.length));
//   }
//   return result;
// }

// // Generate temporary keys
// const tempSecretKey = generateRandomString(32);
// const tempSecretIv = generateRandomString(16);

// console.log("Generated ENC_SECRET_KEY (32 chars):", tempSecretKey);
// console.log("Generated ENC_SECRET_IV (16 chars):", tempSecretIv);

// Constants — after copying from console, replace these with your chosen fixed keys:
const ENC_SECRET_KEY = "your-very-strong-32-char-secret-key";
const ENC_SECRET_IV = "your-16-char-iv!!";

export function encryptData(plainText) {
  if (!plainText) return null;
  const key = CryptoJS.enc.Hex.parse(
    CryptoJS.SHA256(ENC_SECRET_KEY).toString()
  );
  const ivRaw = CryptoJS.SHA256(ENC_SECRET_IV).toString();
  const iv = CryptoJS.enc.Hex.parse(ivRaw.slice(0, 32));
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

export function decryptData(base64CipherText) {
  if (!base64CipherText) return "";
  const key = CryptoJS.enc.Hex.parse(
    CryptoJS.SHA256(ENC_SECRET_KEY).toString()
  );
  const ivRaw = CryptoJS.SHA256(ENC_SECRET_IV).toString();
  const iv = CryptoJS.enc.Hex.parse(ivRaw.slice(0, 32));
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(base64CipherText),
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// import React, { useState } from "react";
// import {
//   View,
//   TextInput,
//   Button,
//   Text,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { encryptData, decryptData } from "@/utils/Encryption"; // Adjust import path as needed

// const EncryptDecryptExample = () => {
//   const [inputText, setInputText] = useState("");
//   const [resultText, setResultText] = useState("");
//   const [action, setAction] = useState(""); // can be "encrypted" or "decrypted"

//   const handleEncrypt = () => {
//     const encrypted = encryptData(inputText); // Encrypts whatever is in inputText
//     setResultText(encrypted || "");
//     setAction("encrypted");
//   };

//   const handleDecrypt = () => {
//     const decrypted = decryptData(inputText); // Decrypts whatever is in inputText
//     setResultText(decrypted || "");
//     setAction("decrypted");
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter text to encrypt or decrypt"
//         value={inputText}
//         onChangeText={setInputText}
//       />
//       <View style={styles.buttonRow}>
//         <Button title="Encrypt" onPress={handleEncrypt} />
//         <Button title="Decrypt" onPress={handleDecrypt} />
//       </View>

//       {action !== "" && (
//         <>
//           <Text style={styles.label}>
//             {action === "encrypted" ? "Encrypted Text:" : "Decrypted Text:"}
//           </Text>
//           <Text selectable style={styles.output}>
//             {resultText}
//           </Text>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     flexGrow: 1,
//     backgroundColor: "#fff",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#999",
//     padding: 10,
//     fontSize: 16,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 30,
//   },
//   label: {
//     fontWeight: "600",
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   output: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     borderRadius: 8,
//     minHeight: 40,
//     backgroundColor: "#f4f4f4",
//     fontSize: 16,
//     marginBottom: 20,
//   },
// });

// export default EncryptDecryptExample;
