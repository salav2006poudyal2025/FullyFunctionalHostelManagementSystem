// import { useEffect, useState } from "react";
// import { getPayments, updatePayment, resetPayments } from "../../services/api";

// const PaymentsPage = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [resetting, setResetting] = useState(false);

//   const currentMonth = new Date().toLocaleString("default", {
//     month: "long",
//     year: "numeric",
//   });

//   async function load() {
//     try {
//       const data = await getPayments();
//       setPayments(data);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   async function handleToggle(payment) {
//     const newStatus = payment.status === "Complete" ? "Pending" : "Complete";
//     try {
//       await updatePayment(payment._id, newStatus);
//       load();
//     } catch (e) {
//       alert(e.message);
//     }
//   }

//   async function handleReset() {
//     if (!confirm("Reset ALL payments to Pending for this month?")) return;
//     setResetting(true);
//     try {
//       await resetPayments();
//       load();
//     } catch (e) {
//       alert(e.message);
//     } finally {
//       setResetting(false);
//     }
//   }

//   const paid = payments.filter((p) => p.status === "Complete").length;
//   const pending = payments.filter((p) => p.status === "Pending").length;
//   const totalAmount = payments
//     .filter((p) => p.status === "Complete")
//     .reduce((sum, p) => sum + (p.booking?.room?.monthlyFee || 0), 0);

//   if (loading) return <div className="dash-loading">Loading…</div>;

//   return (
//     <div className="dash-page">
//       <div className="dash-page-header">
//         <div>
//           <h1 className="dash-page-title">Payments</h1>
//           <p className="dash-page-sub">
//             Monthly rent collection — {currentMonth}
//           </p>
//         </div>
//         <button
//           className="dash-add-btn"
//           style={{ background: "var(--muted)", color: "#fff" }}
//           onClick={handleReset}
//           disabled={resetting}
//         >
//           {resetting ? "Resetting…" : "Reset Month"}
//         </button>
//       </div>

//       {/* Summary cards */}
//       <div className="dash-stats-grid" style={{ marginBottom: 32 }}>
//         <div className="dash-stat-card green">
//           <div className="dash-stat-icon">✅</div>
//           <div className="dash-stat-value">{paid}</div>
//           <div className="dash-stat-label">Paid</div>
//         </div>
//         <div className="dash-stat-card sand">
//           <div className="dash-stat-icon">⏳</div>
//           <div className="dash-stat-value">{pending}</div>
//           <div className="dash-stat-label">Pending</div>
//         </div>
//         <div className="dash-stat-card rose">
//           <div className="dash-stat-icon">💰</div>
//           <div className="dash-stat-value">
//             Rs.{totalAmount.toLocaleString()}
//           </div>
//           <div className="dash-stat-label">Collected</div>
//         </div>
//       </div>

//       {payments.length === 0 ? (
//         <p className="dash-empty">
//           No payments found for this month. Approve some bookings first.
//         </p>
//       ) : (
//         <div className="dash-table-wrap">
//           <table className="dash-table">
//             <thead>
//               <tr>
//                 <th>Student Name</th>
//                 <th>Email</th>
//                 <th>Room</th>
//                 <th>Monthly Fee</th>
//                 <th>Month</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {payments.map((p) => (
//                 <tr key={p._id}>
//                   <td className="dash-td-name">{p.booking?.fullName || "—"}</td>
//                   <td>{p.booking?.email || "—"}</td>
//                   <td>#{p.booking?.room?.roomNumber || "—"}</td>
//                   <td>
//                     ₹{(p.booking?.room?.monthlyFee || 0).toLocaleString()}
//                   </td>
//                   <td>{p.month}</td>
//                   <td>
//                     <span
//                       className={`dash-badge ${p.status === "Complete" ? "approved" : "pending"}`}
//                     >
//                       {p.status}
//                     </span>
//                   </td>
//                   <td>
//                     <button
//                       className={`dash-btn ${p.status === "Complete" ? "ghost" : "green"}`}
//                       onClick={() => handleToggle(p)}
//                     >
//                       {p.status === "Complete" ? "Mark Pending" : "Mark Paid"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentsPage;

import { useEffect, useState } from "react";
import { useStudentAuth } from "../students/StudentAuthContext";

/*
  Admin Payments view.
  BACKEND later: GET /api/admin/bookings  → replace getAllBookings() with API.
*/
const PaymentsPage = () => {
  const { getAllBookings } = useStudentAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(getAllBookings());
    const onStorage = () => setRows(getAllBookings());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [getAllBookings]);

  const total = rows.reduce((s, r) => s + (r.transaction?.amount || 0), 0);

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Payments & Bookings</h1>
          <p className="dash-page-sub">
            All student bookings with payment status.
          </p>
        </div>
        <div
          className="dash-stat-card green"
          style={{ padding: 16, minWidth: 180 }}
        >
          <div className="dash-stat-label">Total Collected</div>
          <div className="dash-stat-value">Rs. {total.toLocaleString()}</div>
        </div>
      </div>

      <div className="dash-section">
        {rows.length === 0 ? (
          <p className="dash-empty">No bookings yet.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Booking Status</th>
                  <th>Payment Status</th>
                  <th>Transaction</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.studentName}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {r.studentEmail}
                      </small>
                    </td>
                    <td>
                      #{r.room?.roomNumber} · {r.room?.seaterType}-Seater
                    </td>
                    <td>
                      <span className="dash-badge approved">
                        {r.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`dash-badge ${r.paymentStatus === "Paid" ? "approved" : "pending"}`}
                      >
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <code>{r.transaction?.transactionId || "—"}</code>
                    </td>
                    <td>Rs. {(r.transaction?.amount || 0).toLocaleString()}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
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

export default PaymentsPage;
