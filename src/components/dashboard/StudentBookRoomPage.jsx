import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, getRooms, queryRoomsByAI } from "../../services/api";
import { useStudentAuth } from "../students/StudentAuthContext";
import twoseater from "../img/2-seater.jpeg";
import threeseater from "../img/3-seater.jpeg";
import fourseater from "../img/4-seater.jpeg";
import {
  EDUCATION_OPTIONS,
  cleanEmail,
  cleanText,
  firstValidationError,
  maxDobForMinimumAge,
  validateAddress,
  validateDob,
  validateEducation,
  validateEmail,
  validateName,
  validatePhone,
} from "../../utils/validation";

const seaterImgs = { 2: twoseater, 3: threeseater, 4: fourseater };

const aiSuggestions = [
  "2 and 3 seater rooms",
  "10k to 15k rooms",
  "cheapest available room",
  "rooms with most free seats",
  "total rooms",
  "what can you do?",
];

function getFreeSeats(room) {
  return Math.max((room.totalSeats || 0) - (room.occupiedSeats || 0), 0);
}

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
        const availableRoom = data.find((room) => room.status === "Available");
        if (availableRoom) setSelectedRoom(availableRoom);
      })
      .catch(() => {});
  }, []);

  function update(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  }

  function validateBookingForm() {
    return firstValidationError([
      selectedRoom ? "" : "Please select a room.",
      validateName(form.fullName),
      validatePhone(form.phone),
      validateEmail(form.email),
      validateDob(form.dob),
      validateEducation(form.educationStatus),
      validateAddress(form.permanentAddress, "Permanent address"),
    ]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateBookingForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await createBooking({
        ...form,
        email: cleanEmail(form.email),
        fullName: cleanText(form.fullName),
        permanentAddress: cleanText(form.permanentAddress),
        phone: cleanText(form.phone),
        room: selectedRoom._id,
        student: studentInfo?.id || undefined,
        temporaryAddress: cleanText(form.temporaryAddress),
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
      if (result.bestRoom) setSelectedRoom(result.bestRoom);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  if (success) {
    return (
      <div className="dash-page">
        <div className="dash-section dash-confirmation">
          <div className="dash-confirm-icon">OK</div>
          <h2 className="dash-section-title">Booking Submitted!</h2>
          <p>
            Your request for <strong>Room #{selectedRoom?.roomNumber}</strong>{" "}
            has been received. The warden will review it within 24 hours.
          </p>
          <p className="dash-confirm-note">
            Check your booking status in <strong>My Room</strong> or{" "}
            <strong>Overview</strong>.
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
          <p className="dash-page-sub">
            Search, select a room, and submit your booking details.
          </p>
        </div>
      </div>

      <div className="dash-section ai-search-panel">
        <div className="ai-search-head">
          <div>
            <h2 className="dash-section-title">Smart Room Search</h2>
            <p className="ai-search-sub">
              Ask naturally about price, seater type, availability, totals, or recommendations.
            </p>
          </div>
          <span className="ai-search-badge">Natural language</span>
        </div>

        <form className="br-form" onSubmit={handleAIQuery}>
          <div className="br-form-row ai-search-row">
            <div className="br-field br-col-2">
              <label className="br-label">Ask the AI</label>
              <input
                className="br-input ai-search-input"
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. 2 and 3 seater rooms between 10k and 15k"
              />
            </div>
            <div className="br-field ai-search-action">
              <button type="submit" className="br-submit-btn" disabled={aiLoading}>
                {aiLoading ? "Analyzing..." : "Ask AI"}
              </button>
            </div>
          </div>

          <div className="ai-suggestion-row">
            {aiSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="ai-suggestion-chip"
                type="button"
                onClick={() => setAiQuery(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {aiError && <div className="lp-error">{aiError}</div>}

        {aiResponse && (
          <div className="sdash-booking-card ai-result-card">
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Question</span>
              <span className="sdash-booking-value">{aiResponse.query}</span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Summary</span>
              <span className="sdash-booking-value">{aiResponse.summary}</span>
            </div>
            <div className="sdash-booking-row">
              <span className="sdash-booking-label">Answer</span>
              <span className="sdash-booking-value">
                {aiResponse.aiMessage ||
                  aiResponse.message ||
                  `${aiResponse.count || 0} matching room(s)`}
              </span>
            </div>

            {aiResponse.stats && (
              <div className="ai-stats-grid">
                <div className="ai-stat">
                  <strong>{aiResponse.stats.totalRooms}</strong>
                  <span>Total rooms</span>
                </div>
                <div className="ai-stat">
                  <strong>{aiResponse.stats.availableRooms}</strong>
                  <span>Available</span>
                </div>
                <div className="ai-stat">
                  <strong>{aiResponse.stats.freeSeats}</strong>
                  <span>Free seats</span>
                </div>
              </div>
            )}

            {aiResponse.suggestedRoom && (
              <div className="sdash-booking-row">
                <span className="sdash-booking-label">Alternative</span>
                <span className="sdash-booking-value">
                  Room #{aiResponse.suggestedRoom.roomNumber} -{" "}
                  {aiResponse.suggestedRoom.seaterType}-Seater - Rs.
                  {aiResponse.suggestedRoom.monthlyFee?.toLocaleString()}
                </span>
              </div>
            )}

            {aiResponse.rooms?.length > 0 && (
              <div className="ai-room-results">
                <h3 className="dash-room-num">Matching rooms</h3>
                <div className="dash-rooms-grid ai-room-grid">
                  {aiResponse.rooms.map((room) => (
                    <button
                      key={room._id}
                      className={`dash-room-card ai-room-card ${
                        selectedRoom?._id === room._id ? "selected-room" : ""
                      }`}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                    >
                      <img
                        src={seaterImgs[room.seaterType] || twoseater}
                        alt={`${room.seaterType}-Seater`}
                      />
                      <div className="dash-room-header">
                        <div>
                          <span className="dash-room-num">Room #{room.roomNumber}</span>
                          <h3 className="dash-room-type">{room.seaterType}-Seater</h3>
                        </div>
                        <span
                          className={`dash-badge ${
                            room.status === "Available" ? "approved" : "rejected"
                          }`}
                        >
                          {room.status}
                        </span>
                      </div>
                      <div className="dash-room-stats">
                        <div className="dash-room-stat">
                          <span className="dash-room-stat-val">
                            Rs.{room.monthlyFee.toLocaleString()}
                          </span>
                          <span className="dash-room-stat-label">/mo</span>
                        </div>
                        <div className="dash-room-stat">
                          <span className="dash-room-stat-val">{getFreeSeats(room)}</span>
                          <span className="dash-room-stat-label">Free</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Step 1 - Choose a Room</h2>
        <div className="dash-rooms-grid">
          {rooms.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Loading rooms...</p>
          )}
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => room.status !== "Full" && setSelectedRoom(room)}
              className={`dash-room-card room-select-card ${
                selectedRoom?._id === room._id ? "selected-room" : ""
              }`}
              type="button"
              disabled={room.status === "Full"}
            >
              <img
                src={seaterImgs[room.seaterType] || twoseater}
                alt={`${room.seaterType}-Seater`}
              />
              <div className="dash-room-header">
                <div>
                  <span className="dash-room-num">Room #{room.roomNumber}</span>
                  <h3 className="dash-room-type">{room.seaterType}-Seater</h3>
                </div>
                <span
                  className={`dash-badge ${
                    room.status === "Available" ? "approved" : "rejected"
                  }`}
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
                  <span className="dash-room-stat-val">{getFreeSeats(room)}</span>
                  <span className="dash-room-stat-label">Free</span>
                </div>
                <div className="dash-room-stat">
                  <span className="dash-room-stat-val">
                    Rs.{room.monthlyFee.toLocaleString()}
                  </span>
                  <span className="dash-room-stat-label">/mo</span>
                </div>
              </div>
              <div className="dash-occ-track">
                <div
                  className="dash-occ-fill"
                  style={{ width: `${(room.occupiedSeats / room.totalSeats) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Step 2 - Your Details</h2>

        {error && <div className="lp-error">{error}</div>}

        <form className="br-form" onSubmit={handleSubmit}>
          <div className="br-form-row">
            <div className="br-field br-col-2">
              <label className="br-label">
                Full Name <span className="br-req">*</span>
              </label>
              <input
                className="br-input"
                name="fullName"
                type="text"
                autoComplete="name"
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
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{10}"
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
                name="email"
                type="email"
                autoComplete="email"
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
                name="dob"
                type="date"
                max={maxDobForMinimumAge(16)}
                value={form.dob}
                onChange={update}
                required
              />
              <div className="br-help">Must be 16 years old or older.</div>
            </div>
            <div className="br-field">
              <label className="br-label">
                Education Status <span className="br-req">*</span>
              </label>
              <select
                className="br-input br-select"
                name="educationStatus"
                value={form.educationStatus}
                onChange={update}
                required
              >
                <option value="">Select</option>
                {EDUCATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
                name="permanentAddress"
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
              <label className="br-label">Temporary / Local Address</label>
              <textarea
                className="br-textarea"
                name="temporaryAddress"
                rows={2}
                placeholder="Current local address"
                value={form.temporaryAddress}
                onChange={update}
              />
            </div>
          </div>

          {selectedRoom && (
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">Selected Room</label>
                <input
                  className="br-input br-input-readonly"
                  type="text"
                  value={`Room ${selectedRoom.roomNumber} - ${selectedRoom.seaterType}-Seater - Rs.${selectedRoom.monthlyFee.toLocaleString()}/month`}
                  readOnly
                />
              </div>
            </div>
          )}

          <div className="br-form-footer">
            <p className="br-form-note">
              Your booking will be reviewed by the warden within 24 hours.
            </p>
            <button
              className="br-submit-btn"
              type="submit"
              disabled={loading || !selectedRoom}
            >
              {loading ? "Submitting..." : "Submit Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentBookRoomPage;
