// API Configuration Constants
export const API_CONFIG = {
    // Backend Base URL
    BASE_URL: "https://femiiniq-backend.onrender.com",

    // Razorpay Configuration
    // NOTE: Replace with your actual Razorpay key ID
    // For production, consider using environment variables
    RAZORPAY_KEY_ID: "rzp_test_your_key_id", // TODO: Replace with actual key

    // Endpoints
    ENDPOINTS: {
        // Payment endpoints
        CREATE_ORDER: "/payments/create-order",
        VERIFY_PAYMENT: "/payments/verify-payment",

        // Booking endpoints
        CREATE_BOOKING: "/booking",

        // Coupon endpoints
        VERIFY_COUPON: "/coupon/verify",
    },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};
