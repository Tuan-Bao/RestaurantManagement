// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { authService } from "../../services/auth";

// const Login: React.FC = () => {
//   const [credentials, setCredentials] = useState({
//     username: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await authService.login(credentials);
//       localStorage.setItem("access_token", response.access);
//       localStorage.setItem("refresh_token", response.refresh);

//       // Redirect based on user role
//       if (response.user.role === "admin") {
//         navigate("/admin/dashboard");
//       } else {
//         navigate("/staff/dashboard");
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.detail || "Đăng nhập thất bại");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
//       <h2>Đăng nhập</h2>
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: "15px" }}>
//           <label>Tên đăng nhập:</label>
//           <input
//             type="text"
//             value={credentials.username}
//             onChange={e =>
//               setCredentials({ ...credentials, username: e.target.value })
//             }
//             required
//             style={{ width: "100%", padding: "8px", marginTop: "5px" }}
//           />
//         </div>

//         <div style={{ marginBottom: "15px" }}>
//           <label>Mật khẩu:</label>
//           <input
//             type="password"
//             value={credentials.password}
//             onChange={e =>
//               setCredentials({ ...credentials, password: e.target.value })
//             }
//             required
//             style={{ width: "100%", padding: "8px", marginTop: "5px" }}
//           />
//         </div>

//         {error && (
//           <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "10px",
//             backgroundColor: "#007bff",
//             color: "white",
//             border: "none",
//             cursor: loading ? "not-allowed" : "pointer",
//           }}
//         >
//           {loading ? "Đang đăng nhập..." : "Đăng nhập"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;
