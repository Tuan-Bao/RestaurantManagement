import React, { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface MenuSubItem {
  path: string;
  name: string;
  icon: string;
}

interface MenuItem {
  path: string;
  name: string;
  icon: string;
  subItems?: MenuSubItem[];
}

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Auto-expand inventory menu if currently on inventory-related pages
  const isInventoryPage = location.pathname.startsWith('/admin/inventory') || 
                         location.pathname.startsWith('/admin/stock-in') || 
                         location.pathname.startsWith('/admin/stock-out');
  
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    isInventoryPage ? "/admin/inventory" : null
  );

  // Update expanded menu when location changes
  React.useEffect(() => {
    if (isInventoryPage) {
      setExpandedMenu("/admin/inventory");
    } else {
      setExpandedMenu(null);
    }
  }, [location.pathname, isInventoryPage]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems: MenuItem[] = [
    { path: "/admin/dashboard", name: "Dashboard", icon: "bi-speedometer2" },
    { path: "/admin/accounts", name: "Quản lý tài khoản", icon: "bi-people" },
    { path: "/admin/tables", name: "Quản lý bàn", icon: "bi-grid-3x3" },
    { 
      path: "/admin/inventory", 
      name: "Quản lý kho", 
      icon: "bi-box",
      subItems: [
        { path: "/admin/inventory", name: "Kho hàng", icon: "bi-box" },
        { path: "/admin/stock-in", name: "Lịch sử nhập kho", icon: "bi-arrow-down-circle" },
        { path: "/admin/stock-out", name: "Lịch sử xuất kho", icon: "bi-arrow-up-circle" }
      ]
    },
    { path: "/admin/menu", name: "Quản lý menu", icon: "bi-journal-text" },
    { path: "/admin/orders", name: "Quản lý đơn hàng", icon: "bi-cart" },
    { path: "/admin/reports", name: "Báo cáo", icon: "bi-graph-up" },
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
        className={`bg-dark text-white sidebar-width position-fixed position-lg-relative h-100 ${
          sidebarOpen ? "d-block" : "d-none d-lg-block"
        }`}
        style={{ zIndex: 1041 }}
      >
        {/* Logo */}
        <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="bi bi-shop me-2"></i>
            <span className="d-none d-md-inline">Restaurant Admin</span>
            <span className="d-md-none">RA</span>
          </h4>
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
            <div key={item.path}>
              {item.subItems ? (
                // Menu item with submenu
                <div>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.path ? null : item.path)}
                    className={`nav-link text-white mb-2 rounded w-100 text-start border-0 ${
                      location.pathname.startsWith('/admin/inventory') ? "bg-primary" : "text-light"
                    }`}
                    style={{ textDecoration: "none", background: "none" }}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.name}
                    <i className={`bi ${expandedMenu === item.path ? 'bi-chevron-down' : 'bi-chevron-right'} float-end`}></i>
                  </button>
                  {expandedMenu === item.path && (
                    <div className="ms-3">
                      {item.subItems.map(subItem => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={closeSidebar}
                          className={`nav-link text-white mb-1 rounded ${
                            location.pathname === subItem.path ? "bg-secondary" : "text-light"
                          }`}
                          style={{ textDecoration: "none", fontSize: "0.9rem" }}
                        >
                          <i className={`${subItem.icon} me-2`}></i>
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`nav-link text-white mb-2 rounded ${
                    location.pathname === item.path ? "bg-primary" : "text-light"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <i className={`${item.icon} me-2`}></i>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto p-3 border-top border-secondary">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-person-circle fs-4 me-2"></i>
            <div className="flex-grow-1">
              <div className="fw-bold text-truncate">{user?.name}</div>
              <small className="text-muted">Administrator</small>
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
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: sidebarOpen ? '0' : '0' }}>
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
                <h5 className="mb-0">Quản trị hệ thống</h5>
                <small className="text-muted d-none d-sm-block">
                  Chào mừng bạn trở lại, {user?.name}!
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-success me-3 d-none d-md-inline">
                <i className="bi bi-circle-fill me-1"></i>
                Online
              </span>
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-sm-inline">{user?.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
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
        <main className="flex-grow-1 bg-light p-3 p-md-4">
          <div className="container-fluid">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3 px-3 px-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <small className="text-muted mb-2 mb-md-0">
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