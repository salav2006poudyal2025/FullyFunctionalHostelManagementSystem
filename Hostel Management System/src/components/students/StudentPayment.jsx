import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "./StudentAuthContext";
import { submitTokenPayment } from "../../services/api";

/* ─── Token amount — change this to whatever your hostel decides ─── */
const TOKEN_AMOUNT = 500;

const PAYMENT_METHODS = ["Khalti"];

const StudentPayment = () => {
  const { studentInfo, doStudentLogout, markPaid } = useStudentAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState("eSewa");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // calls POST /api/student/token-payment
      // backend receives: { transactionId, method, amount }
      // backend verifies transaction and returns { success: true }
      await submitTokenPayment({ transactionId, method, amount: TOKEN_AMOUNT });
      markPaid(); // saves hasPaid=true in localStorage
      navigate("/book-room");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">
      {/* Left panel */}
      <div className="lp-panel sl-panel">
        <div className="lp-panel-overlay" />
        <div className="lp-panel-content">
          <div className="lp-panel-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <p className="lp-panel-tagline">
            "A small token payment confirms you are a genuine student."
          </p>
          <div className="sl-panel-steps">
            <div className="sl-step done">
              <span className="sl-step-num">✓</span>
              <span className="sl-step-label">Login / Register</span>
            </div>
            <div className="sl-step-connector done" />
            <div className="sl-step active">
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

      {/* Right side */}
      <div className="lp-form-side">
        <div className="lp-form-card">
          <div className="lp-form-header">
            <h1 className="lp-form-title">Token Payment</h1>
            <p className="lp-form-sub">
              Hi {studentInfo?.name || "Student"}! Pay Rs.{TOKEN_AMOUNT} to
              confirm your booking interest and prevent fake reservations.
            </p>
          </div>

          {/* Amount box */}
          <div className="sp-amount-box">
            <div className="sp-amount-left">
              <p className="sp-amount-label">Token Amount</p>
              <p className="sp-amount-value">Rs. {TOKEN_AMOUNT}</p>
            </div>
            <div className="sp-amount-right">
              <span className="sp-amount-note">
                This amount will be adjusted against your first month's rent
                upon booking approval.
              </span>
            </div>
          </div>

          {error && <div className="lp-error">{error}</div>}

          <form className="lp-form" onSubmit={handlePayment}>
            {/* Payment method selector */}
            <div className="lp-field">
              <label className="lp-label">Payment Method</label>
              <div className="sp-method-grid">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`sp-method-btn ${method === m ? "active" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">
                Transaction ID / Voucher Number
              </label>
              <input
                className="lp-input"
                type="text"
                placeholder={`e.g. ${method === "Khalti"}`}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
              <p className="lp-hint">
                Send Rs.{TOKEN_AMOUNT} to our {method} number and paste the
                transaction ID above. Our team will verify within a few hours.
              </p>
            </div>

            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading ? "Verifying Payment…" : "Confirm Payment & Proceed →"}
            </button>
          </form>

          <button
            type="button"
            onClick={doStudentLogout}
            className="sp-logout-link"
          >
            ← Logout and go back
          </button>
        </div>

        <p className="lp-footer-note">
          © {new Date().getFullYear()} Shikha Girls Hostel · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default StudentPayment;
