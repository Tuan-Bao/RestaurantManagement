import api from "./api";
import type { LoginCredentials, AuthResponse, User } from "../types/user";

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      await api.post("/auth/logout/", { refresh: refreshToken });
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/user/");
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token");
  },

  // Get user role
  getUserRole: (): string | null => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  },
};
