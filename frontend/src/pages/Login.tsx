import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, user, error, setError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "staff") {
        navigate("/staff/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      // Navigation will be handled by useEffect after login success
    } catch (err: unknown) {
      // Xử lý lỗi trả về từ API
      let message = null;
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data.errors.non_field_errors[0];
      }
      setError({ detail: message });
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, show loading while redirecting
  if (isAuthenticated && user) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard"}
        replace
      />
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {/* Logo & Title */}
                <div className="text-center mb-4">
                  <div
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-shop fs-3"></i>
                  </div>
                  <h4 className="card-title mb-1">Đăng nhập hệ thống</h4>
                  <p className="text-muted small mb-0">
                    Restaurant Management System
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div
                    className="alert alert-danger alert-dismissible"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error.detail}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Tên đăng nhập
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${
                          error && !username.trim() ? "is-invalid" : ""
                        }`}
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                        disabled={loading}
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Mật khẩu
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${
                          error && !password.trim() ? "is-invalid" : ""
                        }`}
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        aria-label="Toggle password visibility"
                      >
                        <i
                          className={`bi bi-eye${showPassword ? "-slash" : ""}`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || !username.trim() || !password.trim()}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Đăng nhập
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    Bạn quên mật khẩu?
                    <a href="#" className="text-decoration-none ms-1">
                      Liên hệ quản trị viên
                    </a>
                  </small>
                </div>
              </div>
            </div>

            {/* Demo Accounts Info */}
            <div className="card mt-3 bg-light border-0">
              <div className="card-body p-3">
                <h6 className="card-title mb-2">
                  <i className="bi bi-info-circle me-2"></i>
                  Tài khoản demo
                </h6>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="d-block text-muted">Admin:</small>
                    <small className="text-primary">admin / admin123</small>
                  </div>
                  <div className="col-6">
                    <small className="d-block text-muted">Staff:</small>
                    <small className="text-success">staff01 / staff123</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
