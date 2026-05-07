import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import {
  StudentAuthProvider,
  useStudentAuth,
} from "./components/students/StudentAuthContext";

// Existing pages
import LandingPage from "./components/students/landingPage";
import LoginPage from "./components/auth/login";
import BookRoomPage from "./components/students/BookRoom";
import DashboardHome from "./components/dashboard/DashboardHome";
import StudentsPage from "./components/dashboard/StudentsPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import WardenPage from "./components/dashboard/WardenPage";
import PaymentsPage from "./components/dashboard/PaymentsPage";
import RoomsPage from "./components/dashboard/RoomsPage";

// New student pages
import StudentLoginPage from "./components/students/StudentLogin";
import StudentPayment from "./components/students/StudentPayment";
import StudentDashboardLayout from "./components/students/StudentDashboardLayout";
import StudentDashboardHome from "./components/dashboard/StudentDashboardHome";
import StudentProfilePage from "./components/dashboard/StudentProfilePage";
import StudentRoomPage from "./components/dashboard/StudentRoomPage";
import StudentPaymentsPage from "./components/dashboard/StudentPaymentsPage";
import UnifiedLogin from "./components/students/UnifiedLogin";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Existing: Protects staff dashboard ──
function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ── Existing: Protects Owner-only pages ──
function OwnerRoute({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "Owner") return <Navigate to="/dashboard" replace />;
  return children;
}

// ── NEW: If student already logged in, skip StudentLogin page ──
function StudentLoginRoute({ children }) {
  const { studentToken } = useStudentAuth();
  if (studentToken) return <Navigate to="/student-payment" replace />;
  return children;
}

// ── NEW: /book-room needs student login + token payment done ──
// function StudentBookingRoute({ children }) {
//   const { studentToken, hasPaid } = useStudentAuth();
//   if (!studentToken) return <Navigate to="/student-login" replace />;
//   if (!hasPaid) return <Navigate to="/student-payment" replace />;
//   return children;
// }

// ── NEW: Student dashboard needs student login ──
function StudentDashboardRoute({ children }) {
  const { studentToken } = useStudentAuth();
  if (!studentToken) return <Navigate to="/student-login" replace />;
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
            {/* Staff login (existing) */}
            <Route path="/login" element={<UnifiedLogin />} />{" "}
            <Route path="/book-room" element={<BookRoomPage />} />
            {/* Student login (NEW) */}
            <Route
              path="/student-login"
              element={
                <StudentLoginRoute>
                  <StudentLoginPage />
                </StudentLoginRoute>
              }
            />
            {/* Student token payment (NEW) */}
            <Route path="/student-payment" element={<StudentPayment />} />
            {/* Book room — now protected (UPDATED) */}
            {/* <Route
              path="/book-room"
              element={
                <StudentBookingRoute>
                  <BookRoomPage />
                </StudentBookingRoute>
              }
            /> */}
            {/* ── Student Dashboard (NEW) ── */}
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
              <Route path="room" element={<StudentRoomPage />} />
              <Route path="payments" element={<StudentPaymentsPage />} />
            </Route>
            {/* ── Staff / Owner Dashboard (existing, no change) ── */}
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
          </Routes>
        </BrowserRouter>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;
