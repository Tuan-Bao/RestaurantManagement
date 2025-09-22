import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Thêm các route khác ở đây nếu cần */}
      </Routes>
    </Router>
  );
}

export default App;
