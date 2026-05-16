import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/api";

/*
  What this file does:
  ─────────────────────────────────────────────────────────────
  Shows the student's complete payment history:
   1. Token payment they made when booking (transaction ID, method, status)
   2. Monthly rent payment records (which months are paid / pending)

  Backend teammate needs:
    GET /api/student/me  (Authorization: Bearer <studentToken>)
    Returns:
    {
      tokenPayment: {
        transactionId, method, amount, status,  // status: "Verified" | "Pending"
        createdAt
      },
      payments: [
        { _id, month, amount, status, createdAt }  // status: "Complete" | "Pending"
      ]
    }
  ─────────────────────────────────────────────────────────────
*/

const StudentPaymentsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentProfile()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dash-loading">Loading…</div>;

  const tokenPayment = data?.tokenPayment || null;
  const payments = data?.payments || [];
  const paidTotal = payments
    .filter((p) => p.status === "Complete")
    .reduce((s, p) => s + (p.amount || 0), 0);
  const pendingCount = payments.filter((p) => p.status !== "Complete").length;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Payments</h1>
          <p className="dash-page-sub">
            All your payment records — token payment and monthly rent.
          </p>
        </div>
      </div>

      {error && (
        <div className="lp-error" style={{ marginBottom: 24 }}>
          Could not load payments: {error}
        </div>
      )}

      {/* Summary stat cards */}
      <div className="dash-stats-grid" style={{ marginBottom: 32 }}>
        <div className="dash-stat-card green">
          <div className="dash-stat-icon">✅</div>
          <div className="dash-stat-value">
            {payments.filter((p) => p.status === "Complete").length}
          </div>
          <div className="dash-stat-label">Months Paid</div>
        </div>
        <div className="dash-stat-card sand">
          <div className="dash-stat-icon">⏳</div>
          <div className="dash-stat-value">{pendingCount}</div>
          <div className="dash-stat-label">Pending</div>
        </div>
        <div className="dash-stat-card rose">
          <div className="dash-stat-icon">💰</div>
          <div className="dash-stat-value">Rs.{paidTotal.toLocaleString()}</div>
          <div className="dash-stat-label">Total Paid</div>
        </div>
      </div>

      {/* Token Payment Record */}
      <div className="dash-section">
        <h2 className="dash-section-title">Token Payment Record</h2>
        {!tokenPayment ? (
          <p className="dash-empty">No token payment record found.</p>
        ) : (
          <div className="sdash-booking-card">
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Transaction ID</span>
              <span className="sdash-booking-value sdash-txn-id">
                {tokenPayment.transactionId || "—"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Payment Method</span>
              <span className="sdash-booking-value">
                {tokenPayment.method || "—"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Amount Paid</span>
              <span className="sdash-booking-value">
                Rs.{(tokenPayment.amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Verification Status</span>
              <span
                className={`dash-badge ${
                  tokenPayment.status === "Verified" ? "approved" : "pending"
                }`}
              >
                {tokenPayment.status || "Pending"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Paid On</span>
              <span className="sdash-booking-value">
                {tokenPayment.createdAt
                  ? new Date(tokenPayment.createdAt).toLocaleDateString(
                      "en-NP",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "—"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Rent Payments */}
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
                      <span
                        className={`dash-badge ${
                          p.status === "Complete" ? "approved" : "pending"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-NP")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 12 }}>
        * Monthly rent payments are marked as paid by the warden after receiving
        your payment. Contact the warden if any record is incorrect.
      </p>
    </div>
  );
};

export default StudentPaymentsPage;
