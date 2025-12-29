/**
 * API Configuration
 * 
 * Centralized API configuration for the mobile app.
 * Change the BASE_URL to switch between development and production environments.
 */

// Base URL for all API calls
// 
// FOR MOBILE DEVELOPMENT (Expo):
// - Find your computer's IP: Run "ipconfig" (Windows) or "ifconfig" (Mac/Linux)
// - Use: http://YOUR_COMPUTER_IP:3000 (e.g., http://192.168.1.5:3000)
// - Make sure your phone and computer are on the same WiFi network
//
// FOR ANDROID EMULATOR: Use http://10.0.2.2:3000
// FOR iOS SIMULATOR: Use http://localhost:3000
// FOR PRODUCTION: Use https://feminiq-backend.onrender.com
//
// Current setting:
export const BASE_URL = "http://localhost:3000"; // Android Emulator default

/**
 * Helper function to construct full API URLs
 * @param endpoint - The API endpoint (e.g., "/login", "/register")
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${BASE_URL}${normalizedEndpoint}`;
};
