import { useEffect, useState } from "react";
import { getRooms, createRoom } from "../../services/api";
import { useAuth } from "../../AuthContext";

const RoomsPage = () => {
  const { role } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    roomNumber: "",
    seaterType: "2",
    monthlyFee: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createRoom({
        roomNumber: form.roomNumber,
        seaterType: Number(form.seaterType),
        monthlyFee: Number(form.monthlyFee),
      });
      setShowForm(false);
      setForm({ roomNumber: "", seaterType: "2", monthlyFee: "" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="dash-loading">Loading…</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Rooms</h1>
          <p className="dash-page-sub">View room availability and occupancy</p>
        </div>
        {role === "Owner" && (
          <button
            className="dash-add-btn"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "✕ Cancel" : "+ Add Room"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="dash-form-card">
          <h3 className="dash-form-title">Add New Room</h3>
          {error && <div className="lp-error">{error}</div>}
          <form className="dash-inline-form" onSubmit={handleAdd}>
            <div className="dash-form-field">
              <label>Room Number</label>
              <input
                name="roomNumber"
                className="dash-input"
                placeholder="e.g. 101"
                value={form.roomNumber}
                onChange={update}
                required
              />
            </div>
            <div className="dash-form-field">
              <label>Seater Type</label>
              <select
                name="seaterType"
                className="dash-input"
                value={form.seaterType}
                onChange={update}
              >
                <option value="2">2-Seater</option>
                <option value="3">3-Seater</option>
                <option value="4">4-Seater</option>
              </select>
            </div>
            <div className="dash-form-field">
              <label>Monthly Fee (₹)</label>
              <input
                name="monthlyFee"
                type="number"
                className="dash-input"
                placeholder="e.g. 4500"
                value={form.monthlyFee}
                onChange={update}
                required
              />
            </div>
            <button type="submit" className="dash-btn green" disabled={saving}>
              {saving ? "Adding…" : "Add Room"}
            </button>
          </form>
        </div>
      )}

      <div className="dash-rooms-grid">
        {rooms.map((room) => (
          <div className="dash-room-card" key={room._id}>
            <div className="dash-room-header">
              <div>
                <span className="dash-room-num">Room #{room.roomNumber}</span>
                <h3 className="dash-room-type">{room.seaterType}-Seater</h3>
              </div>
              <span
                className={`dash-badge ${room.status === "Available" ? "approved" : "rejected"}`}
              >
                {room.status}
              </span>
            </div>
            <div className="dash-room-stats">
              <div className="dash-room-stat">
                <span className="dash-room-stat-val">{room.occupiedSeats}</span>
                <span className="dash-room-stat-label">Occupied</span>
              </div>
              <div className="dash-room-stat">
                <span className="dash-room-stat-val">
                  {room.totalSeats - room.occupiedSeats}
                </span>
                <span className="dash-room-stat-label">Available</span>
              </div>
              <div className="dash-room-stat">
                <span className="dash-room-stat-val">
                  ₹{room.monthlyFee.toLocaleString()}
                </span>
                <span className="dash-room-stat-label">/month</span>
              </div>
            </div>
            <div className="dash-occ-track">
              <div
                className="dash-occ-fill"
                style={{
                  width: `${(room.occupiedSeats / room.totalSeats) * 100}%`,
                }}
              />
            </div>
            <p className="dash-occ-label">
              {room.occupiedSeats}/{room.totalSeats} seats occupied
            </p>
          </div>
        ))}
      </div>

      {rooms.length === 0 && <p className="dash-empty">No rooms added yet.</p>}
    </div>
  );
};

export default RoomsPage;
