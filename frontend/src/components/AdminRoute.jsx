import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== "admin" && user.role !== "instructor")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
