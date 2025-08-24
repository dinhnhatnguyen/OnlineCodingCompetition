import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UITranslationProvider } from "./contexts/UITranslationContext";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./index.css";
import "antd/dist/reset.css";
import axios from "axios";

// Initialize axios with token from localStorage
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UITranslationProvider>
      <LanguageProvider>
        <ToastProvider>
          <NotificationProvider>
            <Router>
              <AuthProvider>
                <App />
              </AuthProvider>
            </Router>
          </NotificationProvider>
        </ToastProvider>
      </LanguageProvider>
    </UITranslationProvider>
  </React.StrictMode>
);
