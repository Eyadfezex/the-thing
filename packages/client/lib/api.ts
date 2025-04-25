import axios from 'axios';

// Create axios instance with default config
const instance = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Add request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Add auth token if exists
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle common errors
//     if (error.response?.status === 401) {
//       // Handle unauthorized
//       localStorage.removeItem('token');
//     }
//     return Promise.reject(error);
//   }
// );

export const api = {
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
  