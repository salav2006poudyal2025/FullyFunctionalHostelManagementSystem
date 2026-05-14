import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/api";
import { Link } from "react-router-dom";
import twoseater from "../img/2-seater.jpeg";
import threeseater from "../img/3-seater.jpeg";
import fourseater from "../img/4-seater.jpeg";

const seaterImgs = { 2: twoseater, 3: threeseater, 4: fourseater };

const StudentRoomPage = () => {
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

  const booking = data?.booking || null;
  const room = booking?.room || null;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Room</h1>
          <p className="dash-page-sub">Your room assignment details.</p>
        </div>
      </div>

      {error && (
        <div className="lp-error" style={{ marginBottom: 24 }}>
          Could not load room info: {error}
        </div>
      )}

      {!booking ? (
        <div className="sdash-no-room">
          <span className="sdash-no-room-icon">🏠</span>
          <h3>No room assigned yet</h3>
          <p>
            Your booking is either pending approval or you haven&apos;t booked yet.
          </p>
          {/* FIX: was href="/book-room" — corrected to React Router Link */}
          <Link
            to="/student-dashboard/book-room"
            className="lp-submit-btn"
            style={{ display: "inline-block", textDecoration: "none", marginTop: 16 }}
          >
            Book a Room
          </Link>
        </div>
      ) : (
        <div className="sdash-room-detail-card">
          {/* Room image */}
          <div className="sdash-room-img-wrap">
            <img
              src={seaterImgs[room?.seaterType] || twoseater}
              alt={`${room?.seaterType}-Seater Room`}
            />
            <span
              className={`br-status-badge ${
                booking.status === "Approved" ? "green" : "red"
              }`}
              style={{ position: "absolute", top: 16, right: 16 }}
            >
              {booking.status}
            </span>
          </div>

          {/* Room info */}
          <div className="sdash-room-info">
            <div className="sdash-room-title-row">
              <div>
                <p className="dash-room-num">Room Number</p>
                <h2 className="sdash-room-big">#{room?.roomNumber || "—"}</h2>
              </div>
              <div className="sdash-room-price-box">
                <p className="sdash-room-price">
                  Rs.{room?.monthlyFee?.toLocaleString() || "—"}
                </p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>per month</p>
              </div>
            </div>

            <div className="sdash-booking-card" style={{ marginTop: 20 }}>
              <div className="sdash-booking-row">
                <span className="sdash-booking-label">Room Type</span>
                <span className="sdash-booking-value">
                  {room?.seaterType}-Seater
                </span>
              </div>
              <div className="sdash-booking-row">
                <span className="sdash-booking-label">Total Beds</span>
                <span className="sdash-booking-value">
                  {room?.totalSeats || "—"}
                </span>
              </div>
              <div className="sdash-booking-row">
                <span className="sdash-booking-label">Occupied Beds</span>
                <span className="sdash-booking-value">
                  {room?.occupiedSeats ?? "—"}
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
                <span className="sdash-booking-label">Booked On</span>
                <span className="sdash-booking-value">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString("en-NP", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Occupancy bar */}
            {room && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Room Occupancy ({room.occupiedSeats}/{room.totalSeats} beds)
                </p>
                <div className="br-occ-track">
                  <div
                    className="br-occ-fill"
                    style={{
                      width: `${((room.occupiedSeats || 0) / (room.totalSeats || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {booking.status === "Pending" && (
              <div className="dash-success" style={{ marginTop: 20 }}>
                ⏳ Your booking is pending approval. The warden will review it
                within 24 hours.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRoomPage;
