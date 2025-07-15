import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    // We can't use the useAuth hook here as it's not a component.
    // We'll get the token from a reliable source. A common pattern is
    // to have AuthContext save the token to localStorage.
    // For now, we will add it manually where needed, but this setup is ready for it.
    
    // A more advanced way will be implemented when we use a state manager.
    // For now, this setup establishes the base.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
