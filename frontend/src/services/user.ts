import api from "./api";
import type { User } from "../types/user";

export interface CreateUserData {
  username: string;
  name: string;
  role: "admin" | "staff";
  password: string;
}

export interface UpdateUserData {
  username?: string;
  name?: string;
  role?: "admin" | "staff";
  password?: string;
}

export const userService = {
  // Get all users
  getUsers: async (): Promise<{ data: User[]; count: number }> => {
    const response = await api.get("/users/");
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}/`);
    return response.data.data;
  },

  // Create user
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post("/users/", userData);
    return response.data.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserData): Promise<User> => {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
  },
};