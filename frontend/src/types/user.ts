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
  access: string;
  refresh: string;
  user: User;
}
