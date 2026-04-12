import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import LandingPage from "./components/students/landingPage";
import LoginPage from "./components/auth/login";
import BookRoomPage from "./components/students/BookRoom";
import DashboardHome from "./components/dashboard/DashboardHome";
import StudentsPage from "./components/dashboard/StudentsPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import WardenPage from "./components/dashboard/WardenPage";
import PaymentsPage from "./components/dashboard/PaymentsPage";
import RoomsPage from "./components/dashboard/RoomsPage";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/book-room" element={<BookRoomPage />} />

          {/* Protected Dashboard */}
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

            {/* Owner-only */}
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
    </AuthProvider>
  );
}

export default App;
