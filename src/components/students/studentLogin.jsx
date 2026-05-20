import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cleanEmail,
  cleanText,
  firstValidationError,
  validateEmail,
  validateName,
  validatePassword,
} from "../../utils/validation";
import { useStudentAuth } from "./StudentAuthContext";
import "./StudentAuth.css";

const StudentLoginPage = () => {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { doStudentLogin, doStudentSignup } = useStudentAuth();
  const navigate = useNavigate();

  function update(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError =
      tab === "login"
        ? firstValidationError([
            validateEmail(form.email),
            validatePassword(form.password),
          ])
        : firstValidationError([
            validateName(form.name),
            validateEmail(form.email),
            validatePassword(form.password),
          ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        await doStudentLogin(cleanEmail(form.email), form.password);
        navigate("/student-dashboard");
        return;
      }

      await doStudentSignup({
        email: cleanEmail(form.email),
        name: cleanText(form.name),
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">
      <div className="lp-panel sl-panel">
        <div className="lp-panel-overlay" />
        <div className="lp-panel-content">
          <div className="lp-panel-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <p className="lp-panel-tagline">
            Login to securely reserve your room and join our community.
          </p>
        </div>
      </div>

      <div className="lp-form-side">
        <div className="lp-form-card">
          <a href="/" className="lp-back-link">
            Back to Home
          </a>

          <div className="sl-tab-row">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`sl-tab ${tab === "login" ? "active" : ""}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError("");
              }}
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
                ? "Sign in with your email to continue booking your room"
                : "Register to get started with your booking"}
            </p>
          </div>

          {error && <div className="lp-error">{error}</div>}

          <form className="lp-form" onSubmit={handleSubmit}>
            {tab === "register" && (
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
            )}

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
                  ? "Signing in..."
                  : "Creating account..."
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
              onClick={() => {
                setTab(tab === "login" ? "register" : "login");
                setError("");
              }}
            >
              {tab === "login" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>

        <p className="lp-footer-note">
          (c) {new Date().getFullYear()} Shikha Girls Hostel - All rights reserved
        </p>
      </div>
    </div>
  );
};

export default StudentLoginPage;
