import { auth } from "@/lib/api";
import { useState, useEffect } from "react";

/**
 * Custom hook for handling authentication state and operations
 * @returns {Object} Authentication state and methods
 * @property {boolean} isAuthenticated - Whether user is currently authenticated
 * @property {Object|null} user - Current user data if authenticated, null otherwise
 * @property {boolean} loading - Whether auth state is being loaded
 * @property {Function} login - Async function to log in user
 * @property {Function} register - Async function to register new user
 * @property {Function} logout - Async function to log out user
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth status
    checkAuthStatus();
  }, []);

  /**
   * Checks the current authentication status from localStorage
   */
  const checkAuthStatus = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticates a user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, error?: string}>} Result of login attempt
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);

      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data?.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  /**
   * Registers a new user
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} username - User's username
   * @returns {Promise<{success: boolean, error?: string}>} Result of registration attempt
   */
  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      const response = await auth.register(email, password, username);

      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data?.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An error occurred during registration" };
    }
  };

  /**
   * Logs out the current user
   * @returns {Promise<{success: boolean, error?: string}>} Result of logout attempt
   */
  const logout = async () => {
    try {
      await auth.logout();

      setIsAuthenticated(false);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "An error occurred during logout" };
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };
};
