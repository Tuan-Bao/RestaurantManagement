import React, { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface StaffLayoutProps {
  children: ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { path: "/staff/dashboard", name: "Trang chính", icon: "bi-house" },
    { path: "/staff/tables", name: "Quản lý bàn", icon: "bi-grid-3x3" },
    { path: "/staff/orders", name: "Đơn hàng", icon: "bi-cart" },
    { path: "/staff/menu", name: "Thực đơn", icon: "bi-journal-text" },
    { path: "/staff/inventory", name: "Kho hàng", icon: "bi-box" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-primary text-white sidebar-width position-fixed position-lg-relative h-100 ${
          sidebarOpen ? "d-block" : "d-none d-lg-block"
        }`}
        style={{ zIndex: 1041, width: '280px', minWidth: '280px', maxWidth: '280px' }}
      >
        {/* Logo */}
        <div className="p-3 border-bottom border-light border-opacity-25 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-shop me-2"></i>
            <span className="d-none d-md-inline">Staff Dashboard</span>
            <span className="d-md-none">SD</span>
          </h5>
          <button
            className="btn btn-sm btn-outline-light d-lg-none"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="nav flex-column p-3">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`nav-link text-white mb-2 rounded ${
                location.pathname === item.path ? "bg-light bg-opacity-25" : ""
              }`}
              style={{ textDecoration: "none" }}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto p-3 border-top border-light border-opacity-25">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-person-circle fs-4 me-2"></i>
            <div className="flex-grow-1">
              <div className="fw-bold text-truncate">{user?.name}</div>
              <small className="text-white-50">Nhân viên</small>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm w-100"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            <span className="d-none d-sm-inline">Đăng xuất</span>
            <span className="d-sm-none">Thoát</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="bg-white shadow-sm border-bottom px-3 px-md-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-primary me-3 d-lg-none"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                <i className="bi bi-list fs-5"></i>
              </button>
              <div>
                <h5 className="mb-0">Trang nhân viên</h5>
                <small className="text-muted d-none d-sm-block">
                  Xin chào, {user?.name}!
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-success me-3 d-none d-md-inline">
                <i className="bi bi-circle-fill me-1"></i>
                Đang hoạt động
              </span>
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-sm-inline">{user?.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/staff/profile">
                      <i className="bi bi-person me-2"></i>
                      Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/staff/settings">
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
        <main className="flex-grow-1 bg-light p-3 p-md-4">
          <div className="container-fluid">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3 px-3 px-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <small className="text-muted mb-2 mb-md-0">
              © 2025 Restaurant Management System
            </small>
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {new Date().toLocaleTimeString("vi-VN")}
            </small>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StaffLayout;