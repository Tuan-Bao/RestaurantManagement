import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions (admin có thể access tất cả)
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4 className="alert-heading">
              <i className="bi bi-shield-exclamation me-2"></i>
              Không có quyền truy cập
            </h4>
            <p className="mb-0">
              Bạn không có quyền truy cập vào trang này.
              {user.role === "staff" &&
                requiredRole === "admin" &&
                " Chỉ quản trị viên mới có thể truy cập."}
            </p>
          </div>
          <a href="/" className="btn btn-primary">
            <i className="bi bi-house me-2"></i>
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
