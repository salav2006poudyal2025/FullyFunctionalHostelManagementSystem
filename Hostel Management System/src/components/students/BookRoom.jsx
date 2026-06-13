import { useEffect, useState } from "react";
import { getRooms, createBooking } from "../../services/api";
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

const BookRoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
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
      await createBooking({ ...form, room: selectedRoom._id });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="br-root">
        <nav className="br-nav">
          <a href="/" className="br-logo">
            Shikha <span>Girls</span> Hostel
          </a>
        </nav>
        <div className="br-success">
          <h2>Booking Submitted!</h2>
          <p>
            Your request has been received. The warden will review it within 24
            hours.
          </p>
          <a
            href="/"
            className="br-submit-btn"
            style={{
              display: "inline-block",
              marginTop: 20,
              textDecoration: "none",
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="br-root">
      <nav className="br-nav">
        <a href="/" className="br-logo">
          Shikha <span>Girls</span> Hostel
        </a>

        <div className="br-nav-actions">
          <a href="/" className="br-nav-link">
            Back to Home
          </a>
        </div>
      </nav>

      <div className="br-page">
        {/* ── LEFT: Room Selector ── */}
        <aside className="br-sidebar">
          <div className="br-sidebar-header">
            <p className="br-sidebar-eyebrow">Step 1</p>
            <h2 className="br-sidebar-title">Select a Room</h2>
            <p className="br-sidebar-sub">
              Choose your preferred room type below
            </p>
          </div>

          <div className="br-room-list">
            {rooms.length === 0 && (
              <p style={{ color: "var(--muted)", padding: 12 }}>
                Loading rooms…
              </p>
            )}
            {rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => room.status !== "Full" && setSelectedRoom(room)}
                className={`br-room-card ${selectedRoom?._id === room._id ? "selected" : ""} ${room.status === "Full" ? "full" : ""}`}
                style={{
                  cursor: room.status === "Full" ? "not-allowed" : "pointer",
                }}
              >
                {/* Image */}
                <div className="br-room-img-wrap">
                  <img
                    src={seaterImgs[room.seaterType] || twoseater}
                    alt={`Room ${room.roomNumber}`}
                  />{" "}
                  <span
                    className={`br-status-dot ${room.status === "Available" ? "green" : "red"}`}
                  />
                </div>

                {/* Info */}
                <div className="br-room-info">
                  <div className="br-room-top">
                    <div>
                      <span className="br-room-num">
                        Room #{room.roomNumber}
                      </span>
                      <h4 className="br-room-name">{room.seaterType}-Seater</h4>
                    </div>
                    <span
                      className={`br-status-badge ${room.status === "Available" ? "green" : "red"}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="br-room-meta">
                    <span className="br-meta-pill price">
                      Rs.{room.monthlyFee.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* Occupancy bar */}
                  <div className="br-occ-track">
                    <div
                      className="br-occ-fill"
                      style={{
                        width: `${(room.occupiedSeats / room.totalSeats) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {selectedRoom?._id === room._id && (
                  <div className="br-selected-indicator">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT: Booking Form */}
        <main className="br-main">
          <div className="br-form-header">
            <p className="br-form-eyebrow">Step 2</p>
            <h2 className="br-form-title">Your Details</h2>
            <p className="br-form-sub">
              Fill in your information to complete the booking
            </p>
          </div>

          {selectedRoom && (
            <div className="br-selected-summary">
              <div className="br-summary-left">
                <img
                  src={seaterImgs[selectedRoom.seaterType] || twoseater}
                  alt=""
                  className="br-summary-img"
                />
                <div>
                  <p className="br-summary-room">
                    Room #{selectedRoom.roomNumber} · {selectedRoom.seaterType}
                    -Seater
                  </p>
                  <p className="br-summary-name">
                    {selectedRoom.seaterType}-Seater Room
                  </p>
                </div>
              </div>
              <div className="br-summary-right">
                <p className="br-summary-price">
                  Rs.{selectedRoom.monthlyFee.toLocaleString()}
                </p>
                <p className="br-summary-freq">per month</p>
              </div>
            </div>
          )}

          {error && (
            <div className="lp-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="br-form" onSubmit={handleSubmit}>
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">
                  Full Name <span className="br-req">*</span>
                </label>
                <input
                  className="br-input"
                  type="text"
                  value={form.fullName}
                  onChange={update}
                  required
                />
              </div>
            </div>

            <div className="br-form-row">
              <div className="br-field">
                <label className="br-label">
                  Phone Number <span className="br-req">*</span>
                </label>
                <div className="br-input-wrap">
                  <span className="br-input-prefix">+977</span>
                  <input
                    className="br-input br-input-prefixed"
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={update}
                    required
                  />
                </div>
              </div>

              <div className="br-field">
                <label className="br-label">
                  Email Address <span className="br-req">*</span>
                </label>
                <input
                  className="br-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  required
                />
              </div>
            </div>

            <div className="br-form-row">
              <div className="br-field">
                <label className="br-label">
                  Date of Birth <span className="br-req">*</span>
                </label>
                <input
                  className="br-input"
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={update}
                  required
                />
              </div>

              <div className="br-field">
                <label className="br-label">
                  Current Education Status <span className="br-req">*</span>
                </label>
                <select
                  className="br-input br-select"
                  name="educationStatus"
                  value={form.educationStatus}
                  onChange={update}
                  required
                >
                  <option value="">— Select —</option>
                  {EducationOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">
                  Permanent Address <span className="br-req">*</span>
                </label>
                <textarea
                  className="br-textarea"
                  rows={2}
                  placeholder="Village / Town, District"
                  value={form.permanentAddress}
                  onChange={update}
                  required
                />
              </div>
            </div>

            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">
                  Temporary / Local Address <span className="br-req">*</span>
                </label>
                <textarea
                  className="br-textarea"
                  rows={2}
                  name="temporaryAddress"
                  placeholder="Current local address"
                  value={form.temporaryAddress}
                  onChange={update}
                  required
                />
              </div>
            </div>

            {selectedRoom && (
              <div className="br-form-row">
                <div className="br-field br-col-2">
                  <label className="br-label">Room Number</label>
                  <input
                    className="br-input br-input-readonly"
                    type="text"
                    value={`Room ${selectedRoom.roomNumber} — ${selectedRoom.seaterType}-Seater`}
                    readOnly
                  />
                </div>
              </div>
            )}

            <div className="br-form-footer">
              <p className="br-form-note">
                Your booking will be reviewed by the warden within 24 hours
              </p>
              <button
                type="submit"
                className="br-submit-btn"
                disabled={loading}
              >
                {loading ? "Submitting…" : "Confirm Booking"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default BookRoomPage;
