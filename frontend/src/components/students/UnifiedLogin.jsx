import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { useAuth } from "../../AuthContext";
import { useStudentAuth } from "./StudentAuthContext";
import {
  cleanEmail,
  firstValidationError,
  validateEmail,
  validatePassword,
} from "../../utils/validation";

const UnifiedLogin = () => {
  const [activeRole, setActiveRole] = useState("admin");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { doLogin } = useAuth();
  const { doStudentLogin } = useStudentAuth();
  const navigate = useNavigate();

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setError("");
    const validationError = firstValidationError([
      validateEmail(adminEmail),
      validatePassword(adminPassword),
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await login(cleanEmail(adminEmail), adminPassword);
      doLogin(data.token, data.role, data.email);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStudentSubmit(e) {
    e.preventDefault();
    setError("");
    const validationError = firstValidationError([
      validateEmail(studentEmail),
      validatePassword(studentPassword),
    ]);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await doStudentLogin(cleanEmail(studentEmail), studentPassword);
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
            &quot;A place where safety meets comfort, and strangers become family.&quot;
          </p>
        </div>
      </div>

      <div className="ul-form-side">
        <div className="ul-form-card">
          <a href="/" className="ul-back-link">
            Back to Home
          </a>

          <div className="ul-toggle-wrap">
            <button
              className={`ul-toggle-btn ${activeRole === "student" ? "active" : ""}`}
              onClick={() => { setActiveRole("student"); setError(""); }}
            >
              Student
            </button>
            <button
              className={`ul-toggle-btn ${activeRole === "admin" ? "active" : ""}`}
              onClick={() => { setActiveRole("admin"); setError(""); }}
            >
              Owner / Warden
            </button>
          </div>

          <div className="ul-form-header">
            <h1 className="ul-form-title">
              {activeRole === "student" ? "Student Login" : "Staff Login"}
            </h1>
            <p className="ul-form-sub">
              {activeRole === "student"
                ? "Enter your email and password to access your dashboard"
                : "Sign in with your email and password"}
            </p>
          </div>

          {error && <div className="ul-error">{error}</div>}

          {activeRole === "student" && (
            <form className="ul-form" onSubmit={handleStudentSubmit}>
              <div className="ul-field">
                <label className="ul-label" htmlFor="s-email">
                  Email Address
                </label>
                <input
                  className="ul-input"
                  id="s-email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
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
                  placeholder="Password"
                  autoComplete="current-password"
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
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p style={{ marginTop: 16, fontSize: 14, textAlign: "center", color: "var(--muted)" }}>
                New here?{" "}
                <a href="/signup" style={{ color: "var(--rose)", fontWeight: 600 }}>
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
                  placeholder="owner@gmail.com"
                  autoComplete="email"
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
                  placeholder="Password"
                  autoComplete="current-password"
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
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
