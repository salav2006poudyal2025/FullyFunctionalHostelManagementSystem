import { useEffect, useState } from "react";
import { getAllPayments, updatePayment, generateMonthlyPayments, resetPayments } from "../../services/api";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  async function load() {
    try {
      const data = await getAllPayments();
      setPayments(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(payment) {
    const newStatus = payment.status === "Complete" ? "Pending" : "Complete";
    try {
      await updatePayment(payment._id, newStatus);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleGenerate() {
    const month = new Date().toISOString().slice(0, 7);
    try {
      const result = await generateMonthlyPayments(month);
      setActionMsg(result.message);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleReset() {
    if (!confirm("Reset all this month's payments to Pending?")) return;
    try {
      const result = await resetPayments();
      setActionMsg(result.message);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const totalCollected = payments
    .filter((p) => p.status === "Complete")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const pendingTotal = payments
    .filter((p) => p.status === "Pending")
    .reduce((s, p) => s + (p.amount || 0), 0);

  if (loading) return <div className="dash-loading">Loading…</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Payments</h1>
          <p className="dash-page-sub">Monthly rent payment records for all students.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="dash-btn green" onClick={handleGenerate}>
            + Generate This Month
          </button>
          <button className="dash-btn ghost" onClick={handleReset}>
            ↺ Reset to Pending
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="dash-success" style={{ marginBottom: 20 }}>
          {actionMsg}
        </div>
      )}

      {error && (
        <div className="lp-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="dash-stats-grid" style={{ marginBottom: 28 }}>
        <div className="dash-stat-card green">
          <div className="dash-stat-icon">✅</div>
          <div className="dash-stat-value">
            Rs.{totalCollected.toLocaleString()}
          </div>
          <div className="dash-stat-label">Total Collected</div>
        </div>
        <div className="dash-stat-card sand">
          <div className="dash-stat-icon">⏳</div>
          <div className="dash-stat-value">
            Rs.{pendingTotal.toLocaleString()}
          </div>
          <div className="dash-stat-label">Pending Amount</div>
        </div>
        <div className="dash-stat-card rose">
          <div className="dash-stat-icon">📋</div>
          <div className="dash-stat-value">{payments.length}</div>
          <div className="dash-stat-label">Total Records</div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div>
          <p className="dash-empty">No payment records yet.</p>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
            Click <strong>&quot;+ Generate This Month&quot;</strong> to create payment records for all approved students.
          </p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Room</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.booking?.fullName || "—"}</strong>
                    <br />
                    <small style={{ color: "var(--muted)" }}>{p.booking?.email || ""}</small>
                  </td>
                  <td>#{p.booking?.room?.roomNumber || "—"} · {p.booking?.room?.seaterType || "?"}⃣</td>
                  <td>{p.month}</td>
                  <td>Rs.{(p.amount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`dash-badge ${p.status === "Complete" ? "approved" : "pending"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`dash-btn ${p.status === "Complete" ? "ghost" : "green"}`}
                      onClick={() => handleToggleStatus(p)}
                    >
                      {p.status === "Complete" ? "Mark Pending" : "Mark Paid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
