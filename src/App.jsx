import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import {
  StudentAuthProvider,
  useStudentAuth,
} from "./components/students/StudentAuthContext";

import LandingPage from "./components/students/landingPage";
import DashboardHome from "./components/dashboard/DashboardHome";
import StudentsPage from "./components/dashboard/StudentsPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import WardenPage from "./components/dashboard/WardenPage";
import PaymentsPage from "./components/dashboard/PaymentsPage";
import RoomsPage from "./components/dashboard/RoomsPage";

import StudentDashboardLayout from "./components/students/StudentDashboardLayout";
import StudentDashboardHome from "./components/dashboard/StudentDashboardHome";
import StudentProfilePage from "./components/dashboard/StudentProfilePage";
import StudentRoomPage from "./components/dashboard/StudentRoomPage";
import StudentPaymentsPage from "./components/dashboard/StudentPaymentsPage";
import StudentBookRoomPage from "./components/dashboard/StudentBookRoomPage";
import UnifiedLogin from "./components/students/UnifiedLogin";
import StudentSignup from "./components/auth/StudentSignup";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function OwnerRoute({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "Owner") return <Navigate to="/dashboard" replace />;
  return children;
}

function StudentDashboardRoute({ children }) {
  const { studentToken } = useStudentAuth();
  if (!studentToken) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/signup" element={<StudentSignup />} />

            {/* Student dashboard */}
            <Route
              path="/student-dashboard"
              element={
                <StudentDashboardRoute>
                  <StudentDashboardLayout />
                </StudentDashboardRoute>
              }
            >
              <Route index element={<StudentDashboardHome />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="book-room" element={<StudentBookRoomPage />} />
              <Route path="room" element={<StudentRoomPage />} />
              <Route path="payments" element={<StudentPaymentsPage />} />
            </Route>

            {/* Staff / Owner dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route
                path="wardens"
                element={
                  <OwnerRoute>
                    <WardenPage />
                  </OwnerRoute>
                }
              />
              <Route
                path="payments"
                element={
                  <OwnerRoute>
                    <PaymentsPage />
                  </OwnerRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;
