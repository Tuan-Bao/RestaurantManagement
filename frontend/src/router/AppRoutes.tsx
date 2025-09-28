import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/shared/Loading";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffTables from "../pages/staff/StaffTables";
import ProtectedRoute from "./ProtectedRoute";
import "../layouts/Layout.css";
// App
const AppRoutes = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Staff Routes */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/tables"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffTables />
          </ProtectedRoute>
        }
      />

      {/* Default Redirects */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={
                user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard"
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback route */}
      <Route
        path="*"
        element={
          <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <h1 className="display-1">404</h1>
              <p className="fs-3">
                <span className="text-danger">Oops!</span> Trang không tồn tại.
              </p>
              <p className="lead">
                Trang bạn đang tìm kiếm không được tìm thấy.
              </p>
              <a href="/" className="btn btn-primary">
                Về trang chủ
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
