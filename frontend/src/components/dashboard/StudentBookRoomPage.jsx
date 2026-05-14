import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, createBooking, queryRoomsByAI } from "../../services/api";
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
  const navigate = useNavigate();
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
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

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

    // Validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setError("Invalid email format.");
    }
    if (!/^\d{10}$/.test(form.phone)) {
      return setError("Phone number must be exactly 10 digits.");
    }
    if (!form.dob) {
      return setError("Date of birth is required.");
    }
    const age = new Date().getFullYear() - new Date(form.dob).getFullYear();
    if (age < 16) {
      return setError("Age must be 16 or above.");
    }

    setError("");
    setLoading(true);
    try {
      await createBooking({
        ...form,
        room: selectedRoom._id,
        student: studentInfo?.id || undefined,
      });
      setSuccess(true);
      navigate("/student-dashboard/payments");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAIQuery(e) {
    e.preventDefault();
    if (!aiQuery.trim()) {
      setAiError("Please type a room question first.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAiResponse(null);

    try {
      const result = await queryRoomsByAI(aiQuery.trim());
      setAiResponse(result);
      if (result.bestRoom) {
        setSelectedRoom(result.bestRoom);
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
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

      {/* AI Smart Query */}
      <div className="dash-section">
        <h2 className="dash-section-title">Smart Room Query</h2>
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Ask in plain language and get instant room recommendations.
          Examples: “How many 2-seater rooms are available?”, “Room under 15000?”, “Suggest best room for me”.
        </p>
        <form className="br-form" onSubmit={handleAIQuery} style={{ marginBottom: 24 }}>
          <div className="br-form-row">
            <div className="br-field br-col-2" style={{ minWidth: 0 }}>
              <label className="br-label">Ask the AI</label>
              <input
                className="br-input"
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. 2-seater room available under 15000"
              />
            </div>
            <div className="br-field" style={{ alignSelf: "flex-end" }}>
              <button type="submit" className="br-submit-btn" disabled={aiLoading}>
                {aiLoading ? "Analyzing…" : "Ask AI"}
              </button>
            </div>
          </div>
        </form>
        {aiError && <div className="lp-error" style={{ marginBottom: 16 }}>{aiError}</div>}
        {aiResponse && (
          <div className="sdash-booking-card" style={{ marginBottom: 24 }}>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Your Question</span>
              <span className="sdash-booking-value">{aiResponse.query}</span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">AI Summary</span>
              <span className="sdash-booking-value">{aiResponse.summary}</span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Results</span>
              <span className="sdash-booking-value">
                {aiResponse.aiMessage || aiResponse.message || `${aiResponse.count || 0} matching room(s)`}
              </span>
            </div>
            {aiResponse.suggestedRoom && (
              <div className="sdash-booking-row">
                <span className="sdash-booking-label">Suggested Alternative</span>
                <span className="sdash-booking-value">
                  Room #{aiResponse.suggestedRoom.roomNumber} — {aiResponse.suggestedRoom.seaterType}-Seater · Rs.{aiResponse.suggestedRoom.monthlyFee?.toLocaleString()}
                </span>
              </div>
            )}
            {aiResponse.rooms?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 className="dash-room-num" style={{ marginBottom: 10 }}>AI Matching Rooms</h3>
                <div className="dash-rooms-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                  {aiResponse.rooms.map((room) => (
                    <div
                      key={room._id}
                      className={`dash-room-card ${selectedRoom?._id === room._id ? "selected-room" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedRoom(room)}
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
                          <span className="dash-room-stat-val">Rs.{room.monthlyFee.toLocaleString()}</span>
                          <span className="dash-room-stat-label">/mo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
                <input className="br-input br-input-prefixed" type="tel" name="phone" pattern="\d{10}" title="10 digits" maxLength={10} value={form.phone} onChange={update} required />
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
              <input className="br-input" type="date" name="dob" max={new Date(Date.now() - 16 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} value={form.dob} onChange={update} required />
              <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                Must be 16 years old or older.
              </div>
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
