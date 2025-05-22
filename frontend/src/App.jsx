import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import ProblemDetails from "./pages/ProblemDetails";
import ContestsPage from "./pages/ContestsPage";
import ContestDetails from "./pages/ContestDetails";
import SubmissionDetails from "./pages/SubmissionDetails";
import ScratchPadPage from "./pages/ScratchPadPage";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Admin/Instructor pages
import Dashboard from "./pages/admin/Dashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import ProblemManagement from "./pages/admin/ProblemManagement";
import CreateProblem from "./pages/admin/CreateProblem";
import CreateAdvancedProblem from "./pages/admin/CreateAdvancedProblem";
import EditProblem from "./pages/admin/EditProblem";
import EditAdvancedProblem from "./pages/admin/EditAdvancedProblem";
import TestCaseManagerPage from "./pages/admin/TestCaseManagerPage";
import ContestManagement from "./pages/admin/ContestManagement";
import CreateContest from "./pages/admin/CreateContest";
import EditContest from "./pages/admin/EditContest";

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
          <Route path="/submissions/:id" element={<SubmissionDetails />} />
          <Route path="/scratchpad" element={<ScratchPadPage />} />

          {/* Admin/Instructor Routes with Dashboard Layout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardHome />} />

            {/* Problem Management Routes */}
            <Route path="problems" element={<ProblemManagement />} />
            <Route path="problems/create" element={<CreateProblem />} />
            <Route
              path="problems/create-advanced"
              element={<CreateAdvancedProblem />}
            />
            <Route path="problems/edit/:id" element={<EditProblem />} />
            <Route
              path="problems/edit-advanced/:id"
              element={<EditAdvancedProblem />}
            />
            <Route
              path="problems/testcases/:id"
              element={<TestCaseManagerPage />}
            />

            {/* Contest Management Routes */}
            <Route path="contests" element={<ContestManagement />} />
            <Route path="contests/create" element={<CreateContest />} />
            <Route path="contests/edit/:id" element={<EditContest />} />
          </Route>
        </Routes>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
