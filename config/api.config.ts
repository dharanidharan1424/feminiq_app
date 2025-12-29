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
const getLocalIp = () => {
    // Try to get the IP from Expo Constants (debuggerHost)
    // Retrieve debugger host IP in development mode. Use a type‑cast to avoid TypeScript errors when the property is missing in the EmbeddedManifest type.
    const host = "192.168.1.6"; // fallback to manual IP if unavailable
    return host;
};

export const BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://feminiq-backend.onrender.com"
        : `http://${getLocalIp()}:3000`;

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
