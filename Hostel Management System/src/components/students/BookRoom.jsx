import twoseater from "../img/2-seater.jpeg";
import threeseater from "../img/3-seater.jpeg";
import fourseater from "../img/4-seater.jpeg";

const rooms = [
  {
    img: twoseater,
    badge: "Popular",
    title: "Two seater",
    roomNumber: "101",
    seats: "2-Seater",
    totalSeats: 2,
    occupied: 1,
    status: "Available",
    features: ["Study Desk", "Wardrobe", "Wi-Fi"],
    price: "12,000",
  },
  {
    img: threeseater,
    badge: "Best Value",
    title: "Three seater",
    roomNumber: "102",
    seats: "3-Seater",
    totalSeats: 3,
    occupied: 3,
    status: "Full",
    features: ["Wardrobe", "24/7 Security", "Mess Access"],
    price: "11,500",
  },
  {
    img: fourseater,
    badge: "Budget Pick",
    title: "Four Seater",
    roomNumber: "103",
    seats: "4-Seater",
    totalSeats: 4,
    occupied: 2,
    status: "Available",
    features: ["Common Lounge", "Laundry", "CCTV"],
    price: "11,000",
  },
];

const EDU_OPTIONS = [
  "Under Graduate (UG)",
  "Post Graduate (PG)",
  "Diploma",
  "PhD / Research",
  "Entrance Exam Preparation",
  "Other",
];

const BookRoomPage = () => {
  const selectedRoom = rooms[0];

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
            {rooms.map((room, i) => (
              <div
                key={room.roomNumber}
                className={`br-room-card ${i === 0 ? "selected" : ""} ${room.status === "Full" ? "full" : ""}`}
              >
                {/* Image */}
                <div className="br-room-img-wrap">
                  <img src={room.img} alt={room.title} />
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
                      <h4 className="br-room-name">{room.title}</h4>
                    </div>
                    <span
                      className={`br-status-badge ${room.status === "Available" ? "green" : "red"}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="br-room-meta">
                    <span className="br-meta-pill">{room.seats}</span>
                    <span className="br-meta-pill">
                      🛏 {room.occupied}/{room.totalSeats}
                    </span>
                    <span className="br-meta-pill price">{room.price}/mo</span>
                  </div>

                  {/* Occupancy bar */}
                  <div className="br-occ-track">
                    <div
                      className="br-occ-fill"
                      style={{
                        width: `${(room.occupied / room.totalSeats) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="br-room-features">
                    {room.features.map((f) => (
                      <span className="br-feat" key={f}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected indicator */}
                {i === 0 && (
                  <div className="br-selected-indicator">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT: Booking Form ── */}
        <main className="br-main">
          <div className="br-form-header">
            <p className="br-form-eyebrow">Step 2</p>
            <h2 className="br-form-title">Your Details</h2>
            <p className="br-form-sub">
              Fill in your information to complete the booking
            </p>
          </div>

          {/* Selected room summary */}
          <div className="br-selected-summary">
            <div className="br-summary-left">
              <img
                src={selectedRoom.img}
                alt={selectedRoom.title}
                className="br-summary-img"
              />
              <div>
                <p className="br-summary-room">
                  Room #{selectedRoom.roomNumber} · {selectedRoom.seats}
                </p>
                <p className="br-summary-name">{selectedRoom.title}</p>
              </div>
            </div>
            <div className="br-summary-right">
              <p className="br-summary-price">{selectedRoom.price}</p>
              <p className="br-summary-freq">per month</p>
            </div>
          </div>

          {/* Form */}
          <form className="br-form">
            {/* Row 1 */}
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">
                  Full Name <span className="br-req">*</span>
                </label>
                <input
                  className="br-input"
                  type="text"
                  placeholder="e.g. shikha kandel"
                />
              </div>
            </div>

            {/* Row 2 */}
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
                    placeholder="10-digit number"
                    maxLength={10}
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
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="br-form-row">
              <div className="br-field">
                <label className="br-label">
                  Date of Birth <span className="br-req">*</span>
                </label>
                <input className="br-input" type="date" />
              </div>

              <div className="br-field">
                <label className="br-label">
                  Current Education Status <span className="br-req">*</span>
                </label>
                <select className="br-input br-select">
                  <option value="">— Select —</option>
                  {EDU_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">
                  Permanent Address <span className="br-req">*</span>
                </label>
                <textarea
                  className="br-textarea"
                  rows={2}
                  placeholder="Village / Town, District, State, PIN"
                />
              </div>
            </div>

            {/* Row 5 */}
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">
                  Temporary / Local Address <span className="br-req">*</span>
                </label>
                <textarea
                  className="br-textarea"
                  rows={2}
                  placeholder="Current local address near hostel"
                />
              </div>
            </div>

            {/* Row 6 — Room number (auto-filled, read-only) */}
            <div className="br-form-row">
              <div className="br-field br-col-2">
                <label className="br-label">Room Number</label>
                <input
                  className="br-input br-input-readonly"
                  type="text"
                  value={`Room ${selectedRoom.roomNumber} — ${selectedRoom.title} (${selectedRoom.seats})`}
                  readOnly
                />
              </div>
            </div>

            {/* Submit */}
            <div className="br-form-footer">
              <p className="br-form-note">
                Your booking will be reviewed by the warden within 24 hours
              </p>
              <button type="submit" className="br-submit-btn">
                Confirm Booking
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default BookRoomPage;
