import axios from "axios";

/**
 * Creates an axios instance with default configuration for API requests
 */
const instance = axios.create({
  baseURL: process.env.API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Intercepts API responses to handle authentication errors and token refresh
 */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResult = await auth.refresh();
        if (refreshResult.success) {
          return instance(originalRequest);
        } else {
          sessionStorage.clear();
          localStorage.removeItem("user");
          return Promise.reject({
            success: false,
            error: "Session expired. Please log in again.",
          });
        }
      } catch {
        sessionStorage.clear();
        localStorage.removeItem("user");
        return Promise.reject({
          success: false,
          error: "Session expired. Please log in again.",
        });
      }
    }
    return Promise.reject({
      success: false,
      error: error.response?.data?.message || "Request failed",
    });
  }
);

/**
 * API wrapper for making HTTP requests
 */
export const api = {
  /**
   * Makes a GET request to the specified endpoint
   * @param endpoint - The API endpoint to send the request to
   * @returns A promise containing the response data or error
   */
  get: async <T>(
    endpoint: string
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await instance.get<T>(endpoint);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  /**
   * Makes a POST request to the specified endpoint
   * @param endpoint - The API endpoint to send the request to
   * @param body - The data to send in the request body
   * @returns A promise containing the response data or error
   */
  post: async <T>(
    endpoint: string,
    body: any
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await instance.post<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  /**
   * Makes a PUT request to the specified endpoint
   * @param endpoint - The API endpoint to send the request to
   * @param body - The data to send in the request body
   * @returns A promise containing the response data or error
   */
  put: async <T>(
    endpoint: string,
    body: any
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await instance.put<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  /**
   * Makes a PATCH request to the specified endpoint
   * @param endpoint - The API endpoint to send the request to
   * @param body - The data to send in the request body
   * @returns A promise containing the response data or error
   */
  patch: async <T>(
    endpoint: string,
    body: any
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await instance.patch<T>(endpoint, body);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },

  /**
   * Makes a DELETE request to the specified endpoint
   * @param endpoint - The API endpoint to send the request to
   * @returns A promise containing the response data or error
   */
  delete: async <T>(
    endpoint: string
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const { data } = await instance.delete<T>(endpoint);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  },
};

/**
 * Authentication API - Handles user authentication operations
 */
export const auth = {
  /**
   * Logs in a user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with login response containing user data or error
   */
  login: async (
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    data?: { user: any };
    error?: string;
  }> => {
    const response = await api.post<{ user: any }>("/auth/login", {
      email,
      password,
    });

    if (response.success) {
      localStorage.setItem("user", response.data?.user);
    }

    return response;
  },

  /**
   * Registers a new user
   * @param username - Desired username
   * @param email - User's email address
   * @param password - Desired password
   * @returns Promise with registration response containing user data or error
   */
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    data?: { user: any };
    error?: string;
  }> => {
    const response = await api.post<{ user: any }>("/auth/register", {
      username,
      email,
      password,
    });

    if (response.success) {
      window.location.href = "/";
      localStorage.setItem("user", response.data?.user);
    }

    return response;
  },

  /**
   * Refreshes the authentication token
   * @returns Promise with refresh response indicating success or error
   */
  refresh: async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const response = await api.post("/auth/refresh", {});

    if (response.success) {
      return { success: true };
    } else {
      sessionStorage.clear();
      localStorage.clear();
      return response;
    }
  },

  /**
   * Logs out the current user
   * @returns Promise with logout response indicating success or error
   */
  logout: async (): Promise<{ success: boolean; error?: string }> => {
    const response = await api.post("/auth/logout", {});
    if (response.success) {
      sessionStorage.clear();
      localStorage.removeItem("user");
    }
    return response;
  },
};
