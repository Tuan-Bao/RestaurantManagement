import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/shared/Loading";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AccountsManagement from "../pages/admin/AdminAccountsManagement";
import AdminMenu from "../pages/admin/AdminMenu";
import AdminTables from "../pages/admin/AdminTables";
import WarehousePage from "../pages/admin/WarehousePage";
import StockInHistoryPage from "../pages/admin/StockInHistoryPage";
import StockOutHistoryPage from "../pages/admin/StockOutHistoryPage";
import AdminOrders from "../pages/admin/AdminOrders";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffTables from "../pages/staff/StaffTables";
import StaffOrders from "../pages/staff/StaffOrders";
import StaffMenu from "../pages/staff/StaffMenu";
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

      <Route
        path="/admin/accounts"
        element={
          <ProtectedRoute requiredRole="admin">
            <AccountsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminMenu />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTables />
          </ProtectedRoute>
        }
      />

      {/* Inventory Routes */}
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute requiredRole="admin">
            <WarehousePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/stock-in"
        element={
          <ProtectedRoute requiredRole="admin">
            <StockInHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/stock-out"
        element={
          <ProtectedRoute requiredRole="admin">
            <StockOutHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminOrders />
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
      <Route
        path="/staff/orders"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/menu"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffMenu />
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
