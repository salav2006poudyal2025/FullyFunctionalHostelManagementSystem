import { useEffect, useState } from "react";
import { getRooms, createBooking } from "../../services/api";
import { useStudentAuth } from "../students/StudentAuthContext";
import twoseater from "../img/2-seater.jpeg";
import threeseater from "../img/3-seater.jpeg";
import fourseater from "../img/4-seater.jpeg";

const seaterImgs = { 2: twoseater, 3: threeseater, 4: fourseater };

const EducationOptions = [
  "Under Graduate (UG)",
  "Post Graduate (PG)",
  "Diploma",
  "PhD / Research",
  "Entrance Exam Preparation",
  "Other",
];

const StudentBookRoomPage = () => {
  const { studentInfo } = useStudentAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    fullName: studentInfo?.name || "",
    phone: "",
    email: studentInfo?.email || "",
    dob: "",
    educationStatus: "",
    permanentAddress: "",
    temporaryAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getRooms()
      .then((data) => {
        setRooms(data);
        const avail = data.find((r) => r.status === "Available");
        if (avail) setSelectedRoom(avail);
      })
      .catch(() => {});
  }, []);

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedRoom) return setError("Please select a room.");
    setError("");
    setLoading(true);
    try {
      await createBooking({
        ...form,
        room: selectedRoom._id,
        student: studentInfo?.id || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="dash-page">
        <div className="dash-section" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 56, color: "var(--green)" }}>✓</div>
          <h2 className="dash-section-title" style={{ marginTop: 16 }}>Booking Submitted!</h2>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            Your request for <strong>Room #{selectedRoom?.roomNumber}</strong> has been received.
            The warden will review it within 24 hours.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
            Check your booking status in <strong>My Room</strong> or <strong>Overview</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Book a Room</h1>
          <p className="dash-page-sub">Select a room and fill in your details to submit a booking request.</p>
        </div>
      </div>

      {/* Room Selection */}
      <div className="dash-section">
        <h2 className="dash-section-title">Step 1 — Choose a Room</h2>
        <div className="dash-rooms-grid">
          {rooms.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Loading rooms…</p>
          )}
          {rooms.map((room) => (
            <div
              key={room._id}
              onClick={() => room.status !== "Full" && setSelectedRoom(room)}
              className={`dash-room-card ${selectedRoom?._id === room._id ? "selected-room" : ""}`}
              style={{
                cursor: room.status === "Full" ? "not-allowed" : "pointer",
                opacity: room.status === "Full" ? 0.55 : 1,
                outline: selectedRoom?._id === room._id ? "2px solid var(--rose)" : "none",
              }}
            >
              <img
                src={seaterImgs[room.seaterType] || twoseater}
                alt={`${room.seaterType}-Seater`}
                style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, marginBottom: 10 }}
              />
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
                  <span className="dash-room-stat-label">/mo</span>
                </div>
              </div>
              <div className="dash-occ-track">
                <div
                  className="dash-occ-fill"
                  style={{ width: `${(room.occupiedSeats / room.totalSeats) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <div className="dash-section">
        <h2 className="dash-section-title">Step 2 — Your Details</h2>

        {error && <div className="lp-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="br-form" onSubmit={handleSubmit}>
          <div className="br-form-row">
            <div className="br-field br-col-2">
              <label className="br-label">Full Name <span className="br-req">*</span></label>
              <input className="br-input" type="text" name="fullName" value={form.fullName} onChange={update} required />
            </div>
          </div>

          <div className="br-form-row">
            <div className="br-field">
              <label className="br-label">Phone Number <span className="br-req">*</span></label>
              <div className="br-input-wrap">
                <span className="br-input-prefix">+977</span>
                <input className="br-input br-input-prefixed" type="tel" name="phone" maxLength={10} value={form.phone} onChange={update} required />
              </div>
            </div>
            <div className="br-field">
              <label className="br-label">Email Address <span className="br-req">*</span></label>
              <input className="br-input" type="email" name="email" value={form.email} onChange={update} required />
            </div>
          </div>

          <div className="br-form-row">
            <div className="br-field">
              <label className="br-label">Date of Birth <span className="br-req">*</span></label>
              <input className="br-input" type="date" name="dob" value={form.dob} onChange={update} required />
            </div>
            <div className="br-field">
              <label className="br-label">Education Status <span className="br-req">*</span></label>
              <select className="br-input br-select" name="educationStatus" value={form.educationStatus} onChange={update} required>
                <option value="">— Select —</option>
                {EducationOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="br-form-row">
            <div className="br-field br-col-2">
              <label className="br-label">Permanent Address <span className="br-req">*</span></label>
              <textarea className="br-textarea" rows={2} name="permanentAddress" placeholder="Village / Town, District" value={form.permanentAddress} onChange={update} required />
            </div>
          </div>

          <div className="br-form-row">
            <div className="br-field br-col-2">
              <label className="br-label">Temporary / Local Address</label>
              <textarea className="br-textarea" rows={2} name="temporaryAddress" placeholder="Current local address" value={form.temporaryAddress} onChange={update} />
            </div>
          </div>

          {selectedRoom && (
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">Selected Room</label>
                <input
                  className="br-input br-input-readonly"
                  type="text"
                  value={`Room ${selectedRoom.roomNumber} — ${selectedRoom.seaterType}-Seater · Rs.${selectedRoom.monthlyFee.toLocaleString()}/month`}
                  readOnly
                />
              </div>
            </div>
          )}

          <div className="br-form-footer">
            <p className="br-form-note">Your booking will be reviewed by the warden within 24 hours.</p>
            <button type="submit" className="br-submit-btn" disabled={loading || !selectedRoom}>
              {loading ? "Submitting…" : "Submit Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentBookRoomPage;
