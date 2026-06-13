// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { login } from "../../services/api";
// import { useAuth } from "../../AuthContext";
// import { studentLogin } from "../../services/api";
// import { useStudentAuth } from "./StudentAuthContext";

// const UnifiedLogin = () => {
//   // "student" or "admin" — controls which form shows
//   const [activeRole, setActiveRole] = useState("student");

//   // Admin form state
//   const [adminEmail, setAdminEmail] = useState("");
//   const [adminPassword, setAdminPassword] = useState("");

//   // Student form state (name + phone as credential)
//   const [studentName, setStudentName] = useState("");
//   const [studentPhone, setStudentPhone] = useState("");

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { doLogin } = useAuth();
//   const { doStudentLogin } = useStudentAuth();
//   const navigate = useNavigate();

//   // Called when Admin/Warden submits
//   async function handleAdminSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const data = await login(adminEmail, adminPassword);
//       doLogin(data.token, data.role);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Called when Student submits (name + phone)
//   async function handleStudentSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       // Backend: POST /api/student/login with { name, phone }
//       const data = await studentLogin(studentName, studentPhone);
//       doStudentLogin(data.token, data.student);
//       navigate("/student-dashboard");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="ul-root">
//       {/* Left decorative panel */}
//       <div className="ul-panel">
//         <div className="ul-panel-overlay" />
//         <div className="ul-panel-content">
//           <div className="ul-panel-logo">
//             Shikha <span>Girls</span> Hostel
//           </div>
//           <p className="ul-panel-tagline">
//             "A place where safety meets comfort, and strangers become family."
//           </p>
//         </div>
//       </div>

//       {/* Right: form side */}
//       <div className="ul-form-side">
//         <div className="ul-form-card">
//           <a href="/" className="ul-back-link">
//             ← Back to Home
//           </a>

//           {/* ── TOGGLE BUTTON ── */}
//           <div className="ul-toggle-wrap">
//             <button
//               className={`ul-toggle-btn ${activeRole === "student" ? "active" : ""}`}
//               onClick={() => {
//                 setActiveRole("student");
//                 setError("");
//               }}
//             >
//               Student
//             </button>
//             <button
//               className={`ul-toggle-btn ${activeRole === "admin" ? "active" : ""}`}
//               onClick={() => {
//                 setActiveRole("admin");
//                 setError("");
//               }}
//             >
//               Admin / Warden
//             </button>
//           </div>

//           <div className="ul-form-header">
//             <h1 className="ul-form-title">
//               {activeRole === "student" ? "Student Login" : "Staff Login"}
//             </h1>
//             <p className="ul-form-sub">
//               {activeRole === "student"
//                 ? "Enter your name and phone number to access your dashboard"
//                 : "Sign in with your email and password"}
//             </p>
//           </div>

//           {error && <div className="ul-error">{error}</div>}

//           {/* ── STUDENT FORM ── */}
//           {activeRole === "student" && (
//             <form className="ul-form" onSubmit={handleStudentSubmit}>
//               <div className="ul-field">
//                 <label className="ul-label" htmlFor="s-name">
//                   Full Name
//                 </label>
//                 <input
//                   className="ul-input"
//                   id="s-name"
//                   type="text"
//                   placeholder="As entered during booking"
//                   value={studentName}
//                   onChange={(e) => setStudentName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="ul-field">
//                 <label className="ul-label" htmlFor="s-phone">
//                   Phone Number
//                 </label>
//                 <input
//                   className="ul-input"
//                   id="s-phone"
//                   type="tel"
//                   placeholder="As entered during booking"
//                   value={studentPhone}
//                   onChange={(e) => setStudentPhone(e.target.value)}
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="ul-submit-btn"
//                 disabled={loading}
//               >
//                 {loading ? "Signing in…" : "Sign In"}
//               </button>
//             </form>
//           )}

//           {/* ── ADMIN / WARDEN FORM ── */}
//           {activeRole === "admin" && (
//             <form className="ul-form" onSubmit={handleAdminSubmit}>
//               <div className="ul-field">
//                 <label className="ul-label" htmlFor="a-email">
//                   Email Address
//                 </label>
//                 <input
//                   className="ul-input"
//                   id="a-email"
//                   type="email"
//                   autoComplete="email"
//                   value={adminEmail}
//                   onChange={(e) => setAdminEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="ul-field">
//                 <label className="ul-label" htmlFor="a-password">
//                   Password
//                 </label>
//                 <input
//                   className="ul-input"
//                   id="a-password"
//                   type="password"
//                   autoComplete="current-password"
//                   value={adminPassword}
//                   onChange={(e) => setAdminPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="ul-submit-btn"
//                 disabled={loading}
//               >
//                 {loading ? "Signing in…" : "Sign In"}
//               </button>
//             </form>
//           )}
//         </div>

//         <p className="ul-footer-note">
//           © {new Date().getFullYear()} Shikha Girls Hostel · All rights reserved
//         </p>
//       </div>
//     </div>
//   );
// };

// export default UnifiedLogin;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { useAuth } from "../../AuthContext";
import { useStudentAuth } from "./StudentAuthContext";
// import "./unifiedLogin.css";

const UnifiedLogin = () => {
  const [activeRole, setActiveRole] = useState("student");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Student now uses Name + Password (per new requirements)
  const [studentName, setStudentName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { doLogin } = useAuth();
  const { doStudentLogin } = useStudentAuth();
  const navigate = useNavigate();

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // BACKEND: POST /api/auth/login (admin/warden)
      const data = await login(adminEmail, adminPassword);
      doLogin(data.token, data.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleStudentSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // BACKEND: replace with POST /api/student/login { name, password }
      doStudentLogin(studentName, studentPassword);
      navigate("/student-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ul-root">
      <div className="ul-panel">
        <div className="ul-panel-overlay" />
        <div className="ul-panel-content">
          <div className="ul-panel-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <p className="ul-panel-tagline">
            "A place where safety meets comfort, and strangers become family."
          </p>
        </div>
      </div>

      <div className="ul-form-side">
        <div className="ul-form-card">
          <a href="/" className="ul-back-link">
            ← Back to Home
          </a>

          <div className="ul-toggle-wrap">
            <button
              className={`ul-toggle-btn ${activeRole === "student" ? "active" : ""}`}
              onClick={() => {
                setActiveRole("student");
                setError("");
              }}
            >
              Student
            </button>
            <button
              className={`ul-toggle-btn ${activeRole === "admin" ? "active" : ""}`}
              onClick={() => {
                setActiveRole("admin");
                setError("");
              }}
            >
              Admin / Warden
            </button>
          </div>

          <div className="ul-form-header">
            <h1 className="ul-form-title">
              {activeRole === "student" ? "Student Login" : "Staff Login"}
            </h1>
            <p className="ul-form-sub">
              {activeRole === "student"
                ? "Enter your name and password to access your dashboard"
                : "Sign in with your email and password"}
            </p>
          </div>

          {error && <div className="ul-error">{error}</div>}

          {activeRole === "student" && (
            <form className="ul-form" onSubmit={handleStudentSubmit}>
              <div className="ul-field">
                <label className="ul-label" htmlFor="s-name">
                  Name
                </label>
                <input
                  className="ul-input"
                  id="s-name"
                  type="text"
                  placeholder="Your registered name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
              <div className="ul-field">
                <label className="ul-label" htmlFor="s-pass">
                  Password
                </label>
                <input
                  className="ul-input"
                  id="s-pass"
                  type="password"
                  placeholder="••••••••"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="ul-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                New here?{" "}
                <a
                  href="/signup"
                  style={{ color: "var(--rose)", fontWeight: 600 }}
                >
                  Create an account
                </a>
              </p>
            </form>
          )}

          {activeRole === "admin" && (
            <form className="ul-form" onSubmit={handleAdminSubmit}>
              <div className="ul-field">
                <label className="ul-label" htmlFor="a-email">
                  Email Address
                </label>
                <input
                  className="ul-input"
                  id="a-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="ul-field">
                <label className="ul-label" htmlFor="a-pass">
                  Password
                </label>
                <input
                  className="ul-input"
                  id="a-pass"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="ul-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
