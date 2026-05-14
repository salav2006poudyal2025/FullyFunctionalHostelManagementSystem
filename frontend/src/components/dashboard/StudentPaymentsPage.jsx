import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getStudentProfile,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../../services/api";

const StudentPaymentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [paymentSession, setPaymentSession] = useState(null);
  const [countdown, setCountdown] = useState("");

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      const profile = await getStudentProfile();
      setData(profile);
      return profile;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");

    if (!pidx || !bookingId) return;

    async function verifyReturnedPayment() {
      setPaymentError("");
      setPaymentSuccess("");
      setPayLoading(true);

      try {
        if (status && status !== "Completed") {
          throw new Error(`Khalti returned ${status}. Payment was not completed.`);
        }

        await verifyKhaltiPayment({ bookingId, pidx });
        setPaymentSuccess("Rs.500 token payment verified. Your booking is waiting for owner approval.");
        await loadData();
        setSearchParams({}, { replace: true });
      } catch (err) {
        setPaymentError(err.message || "Could not verify Khalti payment.");
      } finally {
        setPayLoading(false);
      }
    }

    verifyReturnedPayment();
  }, [searchParams, setSearchParams]);

  const booking = data?.booking || null;
  const tokenPayment = booking?.tokenPayment || data?.tokenPayment || null;
  const payments = data?.payments || [];

  const paidTotal = payments
    .filter((p) => p.status === "Complete")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const pendingCount = payments.filter((p) => p.status !== "Complete").length;

  const amountToPay = tokenPayment?.amount || 500;
  const expiresAt = tokenPayment?.expiresAt ? new Date(tokenPayment.expiresAt) : null;
  const expired = expiresAt ? expiresAt < new Date() : false;

  useEffect(() => {
    if (!expiresAt) {
      setCountdown("");
      return undefined;
    }

    const updateCountdown = () => {
      const diff = expiresAt - new Date();
      if (diff <= 0) {
        setCountdown("00:00");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  async function handleKhaltiPay() {
    setPaymentError("");
    setPaymentSuccess("");

    if (!booking || !tokenPayment) {
      setPaymentError("No pending booking found to pay.");
      return;
    }

    if (booking.status !== "Pending" || tokenPayment.status !== "Pending") {
      setPaymentError("This booking is not pending token payment.");
      return;
    }

    if (expired) {
      setPaymentError("Your payment window has expired. Please submit a new booking.");
      return;
    }

    setPayLoading(true);
    try {
      const payment = await initiateKhaltiPayment({ bookingId: booking._id });
      if (!payment.payment_url) {
        throw new Error("Khalti did not return a payment URL.");
      }
      setPaymentSession(payment);
      setPaymentSuccess("Dummy Khalti QR is ready. Scan it and then verify the payment.");
    } catch (err) {
      setPaymentError(err.message || "Could not start Khalti payment.");
    } finally {
      setPayLoading(false);
    }
  }

  async function handleVerifySession() {
    const pidx = paymentSession?.pidx || tokenPayment?.pidx;
    if (!booking || !pidx) {
      setPaymentError("Start Khalti payment first, then verify.");
      return;
    }

    setPaymentError("");
    setPaymentSuccess("");
    setPayLoading(true);
    try {
      await verifyKhaltiPayment({ bookingId: booking._id, pidx });
      setPaymentSuccess("Rs.500 token payment verified. Your booking is waiting for owner approval.");
      setPaymentSession(null);
      await loadData();
    } catch (err) {
      setPaymentError(err.message || "Could not verify Khalti payment yet.");
    } finally {
      setPayLoading(false);
    }
  }

  if (loading) return <div className="dash-loading">Loading...</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Payments</h1>
          <p className="dash-page-sub">
            Pay your booking token through the Khalti QR flow and track rent records.
          </p>
        </div>
      </div>

      {error && (
        <div className="lp-error" style={{ marginBottom: 24 }}>
          Could not load payments: {error}
        </div>
      )}

      <div className="sdash-payment-box">
        <div className="sdash-payment-header">
          <div>
            <h2>Token payment with Khalti QR</h2>
            <p>
              Generate the dummy Khalti QR, scan it, and verify the Rs.500
              token payment before the 15 minute timer ends.
            </p>
          </div>
          <div className="sdash-payment-summary">
            <strong>
              {booking
                ? tokenPayment?.status === "Confirmed"
                  ? "Token paid, waiting approval"
                  : booking.status === "Pending"
                    ? `Rs.${amountToPay.toLocaleString()} due ${countdown ? `in ${countdown}` : ""}`
                    : booking.status === "Approved"
                      ? "Booking confirmed"
                      : "Booking expired"
                : "No active booking"}
            </strong>
          </div>
        </div>

        <div className="sdash-payment-actions">
          <div className="sdash-payment-info">
            <p>
              Reference: <code>{tokenPayment?.reference || booking?._id || "N/A"}</code>
            </p>
            <p>
              Khalti status: <code>{tokenPayment?.status || "N/A"}</code>
            </p>
          </div>
          <button
            type="button"
            className="sdash-pay-btn"
            onClick={handleKhaltiPay}
            disabled={
              !booking ||
              booking.status !== "Pending" ||
              tokenPayment?.status !== "Pending" ||
              expired ||
              payLoading
            }
          >
            {payLoading ? "Processing..." : "Generate Dummy QR"}
          </button>
          {paymentSession?.payment_url && (
            <div className="sdash-qr-card" style={{ marginTop: 16 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(paymentSession.payment_url)}`}
                alt="Dummy Khalti QR code for Rs.500 token payment"
              />
              <p className="sdash-qr-guide">
                Scan this dummy QR for Rs.{amountToPay}. After scanning, click
                verify to submit the token payment.
              </p>
              <div className="dash-actions" style={{ justifyContent: "center" }}>
                <button
                  type="button"
                  className="dash-btn green"
                  onClick={handleVerifySession}
                  disabled={payLoading}
                >
                  Verify Payment
                </button>
              </div>
            </div>
          )}
          {paymentError && <div className="dash-error">{paymentError}</div>}
          {paymentSuccess && <div className="dash-success">{paymentSuccess}</div>}
        </div>
      </div>

      <div className="dash-stats-grid" style={{ marginBottom: 32 }}>
        <div className="dash-stat-card green">
          <div className="dash-stat-icon">OK</div>
          <div className="dash-stat-value">
            {payments.filter((p) => p.status === "Complete").length}
          </div>
          <div className="dash-stat-label">Months Paid</div>
        </div>
        <div className="dash-stat-card sand">
          <div className="dash-stat-icon">...</div>
          <div className="dash-stat-value">{pendingCount}</div>
          <div className="dash-stat-label">Pending</div>
        </div>
        <div className="dash-stat-card rose">
          <div className="dash-stat-icon">Rs</div>
          <div className="dash-stat-value">Rs.{paidTotal.toLocaleString()}</div>
          <div className="dash-stat-label">Total Paid</div>
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Token Payment Record</h2>
        {!tokenPayment ? (
          <p className="dash-empty">No token payment record found.</p>
        ) : (
          <div className="sdash-booking-card">
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Transaction ID</span>
              <span className="sdash-booking-value sdash-txn-id">
                {tokenPayment.transactionId || tokenPayment.pidx || "-"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Payment Method</span>
              <span className="sdash-booking-value">{tokenPayment.method || "-"}</span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Amount</span>
              <span className="sdash-booking-value">
                Rs.{(tokenPayment.amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Verification Status</span>
              <span
                className={`dash-badge ${
                  tokenPayment.status === "Confirmed"
                    ? "approved"
                    : tokenPayment.status === "Expired"
                      ? "rejected"
                      : "pending"
                }`}
              >
                {tokenPayment.status || "Pending"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Paid On</span>
              <span className="sdash-booking-value">
                {tokenPayment.paidAt
                  ? new Date(tokenPayment.paidAt).toLocaleDateString("en-NP", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Monthly Rent History</h2>
        {payments.length === 0 ? (
          <p className="dash-empty">
            No monthly payment records yet. Payments will appear here once your
            booking is approved.
          </p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p._id}>
                    <td style={{ color: "var(--muted)" }}>{idx + 1}</td>
                    <td className="dash-td-name">{p.month}</td>
                    <td>Rs.{(p.amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`dash-badge ${p.status === "Complete" ? "approved" : "pending"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-NP") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPaymentsPage;
