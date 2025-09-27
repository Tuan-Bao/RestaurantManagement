import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "../services/auth";
import type { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && authService.isAuthenticated();
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  // Load user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          setUser(response);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        // Clear invalid tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login({ username, password });
      
      // Store tokens
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      
      // Set user
      setUser(response.data.user);
    } catch (error) {
      throw error; // Re-throw để component có thể handle error
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentUser();
        setUser(response);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    isAdmin,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Higher-order component for role-based access
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "admin" | "staff"
) => {
  return (props: P) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="alert alert-danger text-center">
          <h4>Unauthorized</h4>
          <p>Bạn cần đăng nhập để truy cập trang này.</p>
        </div>
      );
    }

    if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
      return (
        <div className="alert alert-warning text-center">
          <h4>Access Denied</h4>
          <p>Bạn không có quyền truy cập trang này.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};