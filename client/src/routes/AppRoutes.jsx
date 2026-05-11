import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import StudentDashboard from "../pages/student/StudentDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminResults from "../pages/admin/AdminResults";
import DetailedExamResults from "../pages/admin/DetailedExamResults";
import Exam from "../pages/student/Exam";
import Results from "../pages/student/Results";
import Support from "../pages/student/Support";
import ExamInstructions from "../pages/student/ExamInstructions";
import ExamAttempt from "../pages/student/ExamAttempt";

import AdminQuestionBank from "../pages/admin/AdminQuestionBank";

import DashboardLayout from "../layouts/DashboardLayout";
import ExamLayout from "../layouts/ExamLayout";

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>

      {/* Root route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth Routes - Redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Dashboard Routes */}
      {user ? (
        <>
          <Route path="/" element={<DashboardLayout />}>
            <Route
              path="dashboard"
              element={
                user.role === "admin" || user.role === "owner"
                  ? <AdminDashboard />
                  : <StudentDashboard />
              }
            />
            <Route path="admin/results" element={<AdminResults />} />
            <Route path="admin/results/:examId" element={<DetailedExamResults />} />
            <Route path="exam" element={<Exam />} />
            <Route path="results" element={<Results />} />
            <Route path="support" element={<Support />} />
            <Route path="admin/question-bank" element={<AdminQuestionBank />} />
          </Route>

          {/* Exam Routes - Full Screen Layout */}
          <Route element={<ExamLayout />}>
            <Route path="exam/:id" element={user.role === "student" ? <ExamInstructions /> : <Navigate to="/dashboard" replace />} />
            <Route path="exam/:id/attempt" element={user.role === "student" ? <ExamAttempt /> : <Navigate to="/dashboard" replace />} />
          </Route>
        </>
      ) : (
        <Route path="/*" element={<Navigate to="/login" replace />} />
      )}

    </Routes>
  );
};

export default AppRoutes;
