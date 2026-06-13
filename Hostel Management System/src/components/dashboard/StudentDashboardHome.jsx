import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/api";
import { useStudentAuth } from "../students/StudentAuthContext";

/*
  What this file does:
  ─────────────────────────────────────────────────────────────
  This is the Overview/Home page inside the student dashboard.
  It fetches the student's own booking and payment records from
  the backend and shows them as stat cards + a quick summary table.

  Backend teammate needs:
    GET /api/student/me  (Authorization: Bearer <studentToken>)
    Returns:
    {
      student: { name, email, phone, dob, educationStatus },
      booking: {
        status,           // "Pending" | "Approved" | "Rejected"
        room: { roomNumber, seaterType, monthlyFee },
        createdAt
      },
      payments: [
        { month, status, amount, _id }
      ],
      tokenPayment: { transactionId, method, amount, status }
    }
  ─────────────────────────────────────────────────────────────
*/

const StudentDashboardHome = () => {
  const { studentInfo } = useStudentAuth();
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

  // While backend is not connected, show a friendly placeholder
  const booking = data?.booking || null;
  const payments = data?.payments || [];
  const paidCount = payments.filter((p) => p.status === "Complete").length;
  const totalPaid = payments
    .filter((p) => p.status === "Complete")
    .reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">
            Welcome, {studentInfo?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="dash-page-sub">
            Here's a quick overview of your hostel status.
          </p>
        </div>
      </div>

      {error && (
        <div className="lp-error" style={{ marginBottom: 24 }}>
          Could not load data: {error}. Please check backend connection.
        </div>
      )}

      {/* Stat cards */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card rose">
          <div className="dash-stat-icon">🏠</div>
          <div className="dash-stat-value">
            {booking ? `#${booking.room?.roomNumber || "—"}` : "—"}
          </div>
          <div className="dash-stat-label">My Room</div>
        </div>

        <div className="dash-stat-card sand">
          <div className="dash-stat-icon">📋</div>
          <div className="dash-stat-value" style={{ fontSize: 18 }}>
            {booking?.status || "No Booking"}
          </div>
          <div className="dash-stat-label">Booking Status</div>
        </div>

        <div className="dash-stat-card green">
          <div className="dash-stat-icon">✅</div>
          <div className="dash-stat-value">{paidCount}</div>
          <div className="dash-stat-label">Months Paid</div>
        </div>

        <div className="dash-stat-card blue">
          <div className="dash-stat-icon">💰</div>
          <div className="dash-stat-value">Rs.{totalPaid.toLocaleString()}</div>
          <div className="dash-stat-label">Total Paid</div>
        </div>
      </div>

      {/* Booking status card */}
      <div className="dash-section">
        <h2 className="dash-section-title">Booking Summary</h2>
        {!booking ? (
          <p className="dash-empty">
            No booking found. Please{" "}
            <a href="/book-room" style={{ color: "var(--rose)" }}>
              book a room
            </a>{" "}
            first.
          </p>
        ) : (
          <div className="sdash-booking-card">
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Room Number</span>
              <span className="sdash-booking-value">
                #{booking.room?.roomNumber || "—"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Room Type</span>
              <span className="sdash-booking-value">
                {booking.room?.seaterType}-Seater
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Monthly Fee</span>
              <span className="sdash-booking-value">
                Rs.{booking.room?.monthlyFee?.toLocaleString() || "—"}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Booking Status</span>
              <span
                className={`dash-badge ${
                  booking.status === "Approved"
                    ? "approved"
                    : booking.status === "Rejected"
                      ? "rejected"
                      : "pending"
                }`}
              >
                {booking.status}
              </span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Applied On</span>
              <span className="sdash-booking-value">
                {new Date(booking.createdAt).toLocaleDateString("en-NP", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent payments */}
      <div className="dash-section">
        <h2 className="dash-section-title">Recent Payments</h2>
        {payments.length === 0 ? (
          <p className="dash-empty">No payment records yet.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((p) => (
                  <tr key={p._id}>
                    <td>{p.month}</td>
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

export default StudentDashboardHome;
