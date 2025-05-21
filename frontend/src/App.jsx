import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import ProblemDetails from "./pages/ProblemDetails";
import ContestsPage from "./pages/ContestsPage";
import ContestDetails from "./pages/ContestDetails";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import ProblemManagement from "./pages/admin/ProblemManagement";
import CreateProblem from "./pages/admin/CreateProblem";
import EditProblem from "./pages/admin/EditProblem";

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetails />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/contests/:id" element={<ContestDetails />} />

          {/* Admin Routes */}
          <Route
            path="/admin/problems"
            element={
              <AdminRoute>
                <ProblemManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/problems/create"
            element={
              <AdminRoute>
                <CreateProblem />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/problems/edit/:id"
            element={
              <AdminRoute>
                <EditProblem />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
