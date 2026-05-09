import { useEffect, useState } from "react";
import { getRooms } from "../../services/api";
import { useStudentAuth } from "../students/StudentAuthContext";
import KhaltiPaymentModal from "../students/KhaltiPaymentModal";
import twoseater from "../img/2-seater.jpeg";
import threeseater from "../img/3-seater.jpeg";
import fourseater from "../img/4-seater.jpeg";

const seaterImgs = { 2: twoseater, 3: threeseater, 4: fourseater };

const StudentBookRoomPage = () => {
  const { studentInfo, addBooking } = useStudentAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    fullName: studentInfo?.name || "",
    phone: "",
    email: studentInfo?.email || "",
    educationStatus: "",
    permanentAddress: "",
  });
  const [showKhalti, setShowKhalti] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // BACKEND: GET /api/rooms — falls back to mock if API missing
    getRooms()
      .then((data) => {
        setRooms(data);
        const avail = data.find((r) => r.status === "Available");
        if (avail) setSelectedRoom(avail);
      })
      .catch(() => {
        const mock = [
          {
            _id: "r1",
            roomNumber: 101,
            seaterType: 2,
            monthlyFee: 8000,
            status: "Available",
            occupiedSeats: 1,
            totalSeats: 2,
          },
          {
            _id: "r2",
            roomNumber: 102,
            seaterType: 3,
            monthlyFee: 6500,
            status: "Available",
            occupiedSeats: 0,
            totalSeats: 3,
          },
          {
            _id: "r3",
            roomNumber: 103,
            seaterType: 4,
            monthlyFee: 5500,
            status: "Available",
            occupiedSeats: 2,
            totalSeats: 4,
          },
        ];
        setRooms(mock);
        setSelectedRoom(mock[0]);
      });
  }, []);

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleBookClick(e) {
    e.preventDefault();
    if (!selectedRoom) return;
    setShowKhalti(true);
  }

  function handleKhaltiSuccess(txn) {
    // BACKEND: POST /api/bookings { ...form, roomId, payment: txn }
    const booking = {
      id: Date.now().toString(),
      studentId: studentInfo?.id,
      studentName: form.fullName,
      studentEmail: form.email,
      phone: form.phone,
      room: selectedRoom,
      bookingStatus: "Confirmed",
      paymentStatus: "Paid",
      transaction: txn,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    setShowKhalti(false);
    setSuccess(booking);
  }

  if (success) {
    return (
      <div className="dash-page">
        <div
          className="dash-section"
          style={{ textAlign: "center", padding: 48 }}
        >
          <div style={{ fontSize: 56, color: "var(--green)" }}>✓</div>
          <h2 className="dash-section-title">Booking Confirmed!</h2>
          <p style={{ color: "var(--muted)" }}>
            Room #{success.room.roomNumber} · Transaction{" "}
            {success.transaction.transactionId}
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Rs. {success.transaction.amount.toLocaleString()}</strong>{" "}
            paid via Khalti.
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
            Pick a room and complete payment to confirm.
          </p>
        </div>
      </div>

      {/* Rooms grid */}
      <div className="dash-section">
        <h2 className="dash-section-title">Available Rooms</h2>
        <div className="dash-stats-grid">
          {rooms.map((r) => (
            <div
              key={r._id}
              onClick={() => r.status === "Available" && setSelectedRoom(r)}
              className={`dash-stat-card ${selectedRoom?._id === r._id ? "rose" : "sand"}`}
              style={{
                cursor: r.status === "Available" ? "pointer" : "not-allowed",
                opacity: r.status === "Available" ? 1 : 0.55,
              }}
            >
              <img
                src={seaterImgs[r.seaterType]}
                alt=""
                style={{
                  width: "100%",
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <div className="dash-stat-value" style={{ fontSize: 18 }}>
                Room #{r.roomNumber}
              </div>
              <div className="dash-stat-label">
                {r.seaterType}-Seater · Rs.{r.monthlyFee.toLocaleString()}/mo
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="dash-section">
        <h2 className="dash-section-title">Your Details</h2>
        <form className="br-form" onSubmit={handleBookClick}>
          <div className="br-form-row">
            <div className="br-field br-col-2">
              <label className="br-label">Full Name *</label>
              <input
                className="br-input"
                name="fullName"
                value={form.fullName}
                onChange={update}
                required
              />
            </div>
          </div>
          <div className="br-form-row">
            <div className="br-field">
              <label className="br-label">Phone *</label>
              <input
                className="br-input"
                name="phone"
                value={form.phone}
                onChange={update}
                required
              />
            </div>
            <div className="br-field">
              <label className="br-label">Email *</label>
              <input
                className="br-input"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                required
              />
            </div>
          </div>
          <div className="br-form-row">
            <div className="br-field br-col-2">
              <label className="br-label">Permanent Address</label>
              <input
                className="br-input"
                name="permanentAddress"
                value={form.permanentAddress}
                onChange={update}
              />
            </div>
          </div>

          <button
            className="br-submit-btn"
            type="submit"
            disabled={!selectedRoom}
          >
            Book Room — Pay Rs.{" "}
            {selectedRoom?.monthlyFee?.toLocaleString() || "—"}
          </button>
        </form>
      </div>

      {showKhalti && selectedRoom && (
        <KhaltiPaymentModal
          amount={selectedRoom.monthlyFee}
          studentName={form.fullName}
          onClose={() => setShowKhalti(false)}
          onSuccess={handleKhaltiSuccess}
        />
      )}
    </div>
  );
};

export default StudentBookRoomPage;
