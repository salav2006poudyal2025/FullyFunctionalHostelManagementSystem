import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../students/StudentAuthContext";
import {
  cleanEmail,
  cleanText,
  firstValidationError,
  validateEmail,
  validateName,
  validatePassword,
} from "../../utils/validation";

const StudentSignup = () => {
  const { doStudentSignup } = useStudentAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const validationError = firstValidationError([
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
      await doStudentSignup({
        name: cleanText(form.name),
        email: cleanEmail(form.email),
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
    <div className="ul-root">
      <div className="ul-panel">
        <div className="ul-panel-overlay" />
        <div className="ul-panel-content">
          <div className="ul-panel-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <p className="ul-panel-tagline">
            &quot;Begin your journey - create your student account.&quot;
          </p>
        </div>
      </div>

      <div className="ul-form-side">
        <div className="ul-form-card">
          <a href="/" className="ul-back-link">
            Back to Home
          </a>

          <div className="ul-form-header">
            <h1 className="ul-form-title">Student Signup</h1>
            <p className="ul-form-sub">Create your account to book a room.</p>
          </div>

          {error && <div className="ul-error">{error}</div>}

          <form className="ul-form" onSubmit={handleSubmit}>
            <div className="ul-field">
              <label className="ul-label">Full Name</label>
              <input
                className="ul-input"
                name="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                value={form.name}
                onChange={update}
                required
              />
            </div>
            <div className="ul-field">
              <label className="ul-label">Email</label>
              <input
                className="ul-input"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={form.email}
                onChange={update}
                required
              />
            </div>
            <div className="ul-field">
              <label className="ul-label">Password</label>
              <input
                className="ul-input"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                autoComplete="new-password"
                minLength={6}
                value={form.password}
                onChange={update}
                required
              />
            </div>

            <button className="ul-submit-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                style={{ color: "var(--rose)", fontWeight: 600 }}
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
