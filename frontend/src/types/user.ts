export interface User {
  id: number;
  name: string;
  username: string;
  role: "admin" | "staff";
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

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