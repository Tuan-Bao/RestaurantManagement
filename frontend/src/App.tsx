import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import AppRoutes from "./router/AppRoutes";
import { NotificationProvider } from './contexts/NotificationContext';

// Main App Component
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </NotificationProvider>
  );
};

export default App;
