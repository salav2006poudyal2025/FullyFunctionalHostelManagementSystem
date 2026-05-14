import { useEffect, useState } from "react";
import { getStudents, getRooms, getAllPayments } from "../../services/api";
import { useAuth } from "../../AuthContext";

const DashboardHome = () => {
  const { role } = useAuth();
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([getStudents(), getRooms()]);
        setStudents(s);
        setRooms(r);
        if (role === "Owner" || role === "Warden") {
          const p = await getAllPayments();
          setPayments(p);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  const approved = students.filter((s) => s.status === "Approved").length;
  const pending = students.filter((s) => s.status === "Pending").length;
  const available = rooms.filter((r) => r.status === "Available").length;
  const paidCount = payments.filter((p) => p.status === "Complete").length;

  if (loading) return <div className="dash-loading">Loading…</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <h1 className="dash-page-title">Overview</h1>
        <p className="dash-page-sub">Welcome back, {role}!</p>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card rose">
          <div className="dash-stat-icon">👩‍🎓</div>
          <div className="dash-stat-value">{approved}</div>
          <div className="dash-stat-label">Approved Students</div>
        </div>
        <div className="dash-stat-card sand">
          <div className="dash-stat-icon">⏳</div>
          <div className="dash-stat-value">{pending}</div>
          <div className="dash-stat-label">Pending Requests</div>
        </div>
        <div className="dash-stat-card green">
          <div className="dash-stat-icon">🏠</div>
          <div className="dash-stat-value">{available}</div>
          <div className="dash-stat-label">Available Rooms</div>
        </div>
        <div className="dash-stat-card blue">
          <div className="dash-stat-icon">💳</div>
          <div className="dash-stat-value">{paidCount}</div>
          <div className="dash-stat-label">Payments Completed</div>
        </div>
      </div>

      {/* Recent pending bookings */}
      <div className="dash-section">
        <h2 className="dash-section-title">Recent Booking Requests</h2>
        {students.filter((s) => s.status === "Pending").length === 0 ? (
          <p className="dash-empty">No pending requests 🎉</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((s) => s.status === "Pending")
                  .slice(0, 5)
                  .map((s) => (
                    <tr key={s._id}>
                      <td>{s.fullName}</td>
                      <td>{s.email}</td>
                      <td>#{s.room?.roomNumber || "—"}</td>
                      <td>
                        <span className="dash-badge pending">{s.status}</span>
                      </td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Room Summary */}
      <div className="dash-section">
        <h2 className="dash-section-title">Room Summary</h2>
        {rooms.length === 0 ? (
          <p className="dash-empty">No rooms added yet.</p>
        ) : (
          <div className="dash-rooms-grid">
            {rooms.map((room) => (
              <div className="dash-room-card" key={room._id}>
                <div className="dash-room-header">
                  <div>
                    <span className="dash-room-num">Room #{room.roomNumber}</span>
                    <h3 className="dash-room-type">{room.seaterType}-Seater</h3>
                  </div>
                  <span className={`dash-badge ${room.status === "Available" ? "approved" : "rejected"}`}>
                    {room.status}
                  </span>
                </div>
                <div className="dash-room-stats">
                  <div className="dash-room-stat">
                    <span className="dash-room-stat-val">{room.occupiedSeats}</span>
                    <span className="dash-room-stat-label">Occupied</span>
                  </div>
                  <div className="dash-room-stat">
                    <span className="dash-room-stat-val">{room.totalSeats - room.occupiedSeats}</span>
                    <span className="dash-room-stat-label">Free</span>
                  </div>
                  <div className="dash-room-stat">
                    <span className="dash-room-stat-val">Rs.{room.monthlyFee.toLocaleString()}</span>
                    <span className="dash-room-stat-label">/month</span>
                  </div>
                </div>
                <div className="dash-occ-track">
                  <div
                    className="dash-occ-fill"
                    style={{ width: `${(room.occupiedSeats / room.totalSeats) * 100}%` }}
                  />
                </div>
                <p className="dash-occ-label">
                  {room.occupiedSeats}/{room.totalSeats} seats occupied
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
