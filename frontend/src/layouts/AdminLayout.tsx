import React, { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { path: "/admin/dashboard", name: "Dashboard", icon: "bi-speedometer2" },
    { path: "/admin/accounts", name: "Quản lý tài khoản", icon: "bi-people" },
    { path: "/admin/tables", name: "Quản lý bàn", icon: "bi-grid-3x3" },
    { path: "/admin/inventory", name: "Quản lý kho", icon: "bi-box" },
    { path: "/admin/menu", name: "Quản lý menu", icon: "bi-journal-text" },
    { path: "/admin/orders", name: "Quản lý đơn hàng", icon: "bi-cart" },
    { path: "/admin/reports", name: "Báo cáo", icon: "bi-graph-up" },
  ];

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="bg-dark text-white sidebar-width">
        {/* Logo */}
        <div className="p-3 border-bottom border-secondary">
          <h4 className="mb-0">
            <i className="bi bi-shop me-2"></i>
            Restaurant Admin
          </h4>
        </div>

        {/* Navigation Menu */}
        <nav className="nav flex-column p-3">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link text-white mb-2 rounded ${
                location.pathname === item.path ? "bg-primary" : "text-light"
              }`}
              style={{ textDecoration: "none" }}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto p-3 border-top border-secondary">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-person-circle fs-4 me-2"></i>
            <div>
              <div className="fw-bold">{user?.name}</div>
              <small className="text-muted">Administrator</small>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm w-100"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="bg-white shadow-sm border-bottom px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Quản trị hệ thống</h5>
              <small className="text-muted">
                Chào mừng bạn trở lại, {user?.name}!
              </small>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-success me-3">
                <i className="bi bi-circle-fill me-1"></i>
                Online
              </span>
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.name}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/admin/profile">
                      <i className="bi bi-person me-2"></i>
                      Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/settings">
                      <i className="bi bi-gear me-2"></i>
                      Cài đặt
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow-1 bg-light p-4">
          <div className="container-fluid">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              © 2025 Restaurant Management System. All rights reserved.
            </small>
            <small className="text-muted">
              Version 1.0.0 | Powered by React & Django
            </small>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
