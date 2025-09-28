import { createContext } from "react";
import type { User } from "../types/user";
import type { Error } from "../types/error";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  error: Error | null;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
export type { AuthContextType };
