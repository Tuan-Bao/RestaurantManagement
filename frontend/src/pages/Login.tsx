
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../src/services/auth.ts";

const Login: React.FC = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await authService.login(credentials);
            localStorage.setItem("access_token", response.access);
            localStorage.setItem("refresh_token", response.refresh);
            if (response.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/staff/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)"
        }}>
            <div style={{
                width: 360,
                padding: 32,
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                background: "#fff"
            }}>
                <h2 style={{
                    textAlign: "center",
                    marginBottom: 24,
                    fontWeight: 700,
                    color: "#2d3748"
                }}>Đăng nhập hệ thống</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: "#4a5568" }}>Tên đăng nhập</label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                            required
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                marginTop: 6,
                                borderRadius: 8,
                                border: "1px solid #cbd5e0",
                                fontSize: 16,
                                outline: "none",
                                transition: "border-color 0.2s",
                                boxSizing: "border-box"
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#3182ce")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#cbd5e0")}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500, color: "#4a5568" }}>Mật khẩu</label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            required
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                marginTop: 6,
                                borderRadius: 8,
                                border: "1px solid #cbd5e0",
                                fontSize: 16,
                                outline: "none",
                                transition: "border-color 0.2s",
                                boxSizing: "border-box"
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#3182ce")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#cbd5e0")}
                        />
                    </div>
                    {error && (
                        <div style={{
                            color: "#e53e3e",
                            background: "#fff5f5",
                            borderRadius: 8,
                            padding: "8px 12px",
                            marginBottom: 18,
                            textAlign: "center",
                            fontWeight: 500
                        }}>{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading ? "#90cdf4" : "#3182ce",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: "0 2px 8px rgba(49,130,206,0.08)",
                            transition: "background 0.2s"
                        }}
                        onMouseOver={e => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
                        onMouseOut={e => { if (!loading) e.currentTarget.style.background = "#3182ce"; }}
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
