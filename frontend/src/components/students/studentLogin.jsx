import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "./StudentAuthContext";
import "./StudentAuth.css";

const StudentLoginPage = () => {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // FIX: use context methods (doStudentLogin handles API call + state storage)
  const { doStudentLogin, doStudentSignup } = useStudentAuth();
  const navigate = useNavigate();

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        // FIX: login uses name, not email — matches backend /api/student/login
        await doStudentLogin(form.name, form.password);
      } else {
        // FIX: use doStudentSignup from context then redirect to login
        await doStudentSignup({ name: form.name, email: form.email, password: form.password });
        navigate("/login");
        return;
      }
      navigate("/student-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">
      {/* Left decorative panel */}
      <div className="lp-panel sl-panel">
        <div className="lp-panel-overlay" />
        <div className="lp-panel-content">
          <div className="lp-panel-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <p className="lp-panel-tagline">
            "Login to securely reserve your room and join our community."
          </p>
          <div className="sl-panel-steps">
            <div className="sl-step active">
              <span className="sl-step-num">1</span>
              <span className="sl-step-label">Login / Register</span>
            </div>
            <div className="sl-step-connector" />
            <div className="sl-step">
              <span className="sl-step-num">2</span>
              <span className="sl-step-label">Pay Token</span>
            </div>
            <div className="sl-step-connector" />
            <div className="sl-step">
              <span className="sl-step-num">3</span>
              <span className="sl-step-label">Book Room</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="lp-form-side">
        <div className="lp-form-card">
          <a href="/" className="lp-back-link">
            ← Back to Home
          </a>

          {/* Tab switcher */}
          <div className="sl-tab-row">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); }}
              className={`sl-tab ${tab === "login" ? "active" : ""}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setError(""); }}
              className={`sl-tab ${tab === "register" ? "active" : ""}`}
            >
              Register
            </button>
          </div>

          <div className="lp-form-header">
            <h1 className="lp-form-title">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="lp-form-sub">
              {tab === "login"
                ? "Sign in to continue booking your room"
                : "Register to get started with your booking"}
            </p>
          </div>

          {error && <div className="lp-error">{error}</div>}

          <form className="lp-form" onSubmit={handleSubmit}>
            {/* Name field — used for login (username) and register */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="name">
                Full Name
              </label>
              <input
                className="lp-input"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={update}
                required
              />
            </div>

            {/* Email — only for registration */}
            {tab === "register" && (
              <div className="lp-field">
                <label className="lp-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="lp-input"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update}
                  required
                />
              </div>
            )}

            <div className="lp-field">
              <label className="lp-label" htmlFor="password">
                Password
              </label>
              <input
                className="lp-input"
                id="password"
                name="password"
                type="password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                value={form.password}
                onChange={update}
                required
              />
            </div>

            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading
                ? tab === "login"
                  ? "Signing in…"
                  : "Creating account…"
                : tab === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="sl-switch-hint">
            {tab === "login" ? "New student? " : "Already registered? "}
            <button
              type="button"
              className="sl-switch-btn"
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
            >
              {tab === "login" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>

        <p className="lp-footer-note">
          © {new Date().getFullYear()} Shikha Girls Hostel · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default StudentLoginPage;
