import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import ProblemDetails from "./pages/ProblemDetails";
import ContestsPage from "./pages/ContestsPage";
import ContestDetails from "./pages/ContestDetails";
import ContestProblemDetails from "./pages/ContestProblemDetails";
import SubmissionDetails from "./pages/SubmissionDetails";
import ScratchPadPage from "./pages/ScratchPadPage";
import ProfilePage from "./pages/user/ProfilePage";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import ForgotPasswordPage from "./pages/user/ForgotPasswordPage";
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
import TestCaseDemo from "./pages/admin/TestCaseDemo";
import TestComponentLoad from "./components/admin/TestComponentLoad";
import AITestSimple from "./components/admin/AITestSimple";
import AIValidationDemo from "./components/admin/AIValidationDemo";
import ContestManagement from "./pages/admin/ContestManagement";
import CreateContest from "./pages/admin/CreateContest";
import EditContest from "./pages/admin/EditContest";
import UserManagement from "./pages/admin/UserManagement";
import DeletedProblems from "./pages/admin/DeletedProblems";
import JoinContest from "./pages/JoinContest";
import ContestRegistrationManagement from "./pages/admin/ContestRegistrationManagement";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/problems" element={<Problems />} />
      <Route path="/problems/:id" element={<ProblemDetails />} />
      <Route path="/contests" element={<ContestsPage />} />
      <Route path="/contests/join" element={<JoinContest />} />
      <Route path="/contests/:id" element={<ContestDetails />} />
      <Route
        path="/contests/:contestId/problems/:id"
        element={<ContestProblemDetails />}
      />
      <Route path="/submissions/:id" element={<SubmissionDetails />} />
      <Route path="/scratchpad" element={<ScratchPadPage />} />
      <Route path="/ai-test" element={<AITestSimple />} />
      <Route path="/ai-validation" element={<AIValidationDemo />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected User routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePasswordPage />
          </PrivateRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardHome />} />
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
        <Route path="problems/testcase-demo" element={<TestCaseDemo />} />
        <Route path="problems/test-load" element={<TestComponentLoad />} />
        <Route path="problems/ai-test" element={<AITestSimple />} />
        <Route path="problems/deleted" element={<DeletedProblems />} />
        <Route path="contests" element={<ContestManagement />} />
        <Route path="contests/create" element={<CreateContest />} />
        <Route path="contests/edit/:id" element={<EditContest />} />
        <Route
          path="contests/:contestId/registrations"
          element={<ContestRegistrationManagement />}
        />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Instructor routes */}
      <Route
        path="/instructor"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardHome />} />
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
        <Route path="problems/testcase-demo" element={<TestCaseDemo />} />
        <Route path="problems/ai-test" element={<AITestSimple />} />
        <Route path="problems/deleted" element={<DeletedProblems />} />
        <Route path="contests" element={<ContestManagement />} />
        <Route path="contests/create" element={<CreateContest />} />
        <Route path="contests/edit/:id" element={<EditContest />} />
        <Route
          path="contests/:contestId/registrations"
          element={<ContestRegistrationManagement />}
        />
      </Route>

      {/* 404 route */}
      <Route
        path="*"
        element={
          <div className="text-center text-red-500 py-10">Page not found</div>
        }
      />
    </Routes>
  );
}

export default App;
