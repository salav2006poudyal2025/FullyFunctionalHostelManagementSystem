import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { useAuth } from "../../AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { doLogin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      doLogin(data.token, data.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">
      <div className="lp-panel">
        <div className="lp-panel-overlay" />
        <div className="lp-panel-content">
          <div className="lp-panel-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <p className="lp-panel-tagline">
            "A place where safety meets comfort, and strangers become family."
          </p>
        </div>
      </div>

      <div className="lp-form-side">
        <div className="lp-form-card">
          <a href="/" className="lp-back-link">
            ← Back to Home
          </a>

          <div className="lp-form-header">
            <h1 className="lp-form-title">Welcome back</h1>
            <p className="lp-form-sub">Sign in to your hostel account</p>
          </div>

          {error && <div className="lp-error">{error}</div>}

          <form className="lp-form" onSubmit={handleSubmit}>
            <div className="lp-field">
              <label className="lp-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="lp-input"
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="lp-field">
              <div className="lp-label-row">
                <label className="lp-label" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                className="lp-input"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                requiredtype="password"
              />
            </div>

            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="lp-footer-note">
          © {new Date().getFullYear()} Shikha Girls Hostel · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
