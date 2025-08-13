// API URL Configuration Helper
// Centralized function to get the API base URL from environment variables

export const getApiUrl = () => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For client-side, detect from current location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Use the same host but port 8810 for API
    return `${protocol}//${hostname}:8810/api`;
  }
  
  // Fallback for server-side
  return 'http://localhost:8810/api';
};

// Export as default for convenience
export default getApiUrl;
