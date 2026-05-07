// const BASE = "http://localhost:5000/api";

// function headers() {
//   const token = localStorage.getItem("token");
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

// async function req(method, path, body) {
//   const res = await fetch(`${BASE}${path}`, {
//     method,
//     headers: headers(),
//     body: body ? JSON.stringify(body) : undefined,
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || "Request failed");
//   return data;
// }

// // Auth
// export const login = (email, password) =>
//   req("POST", "/auth/login", { email, password });

// // Rooms
// export const getRooms = () => req("GET", "/rooms");
// export const createRoom = (data) => req("POST", "/rooms", data);

// // Bookings / Students
// export const createBooking = (data) => req("POST", "/bookings", data);
// export const getStudents = () => req("GET", "/bookings/students");
// export const approveBooking = (id) => req("PUT", `/bookings/approve/${id}`);
// export const rejectBooking = (id) => req("PUT", `/bookings/reject/${id}`);
// export const updateStudent = (id, data) =>
//   req("PUT", `/bookings/students/${id}`, data);
// export const deleteStudent = (id) => req("DELETE", `/bookings/students/${id}`);

// // Wardens
// export const createWarden = (data) => req("POST", "/owner/wardens", data);

// // Payments
// export const getPayments = () => req("GET", "/payments");
// export const updatePayment = (id, status) =>
//   req("PUT", `/payments/${id}`, { status });
// export const resetPayments = () => req("POST", "/payments/reset");

const BASE = "http://localhost:5000/api";

/* ── Regular staff/owner token header ── */
function headers() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Student token header (separate from staff token) ── */
function studentHeaders() {
  const token = localStorage.getItem("studentToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Generic request helper for staff routes ── */
async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ── Generic request helper for student routes ── */
async function studentReq(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: studentHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ────────────────────────────────────────────────────────────
// EXISTING: Staff / Owner Auth
// ────────────────────────────────────────────────────────────
export const login = (email, password) =>
  req("POST", "/auth/login", { email, password });

// ────────────────────────────────────────────────────────────
// EXISTING: Rooms
// ────────────────────────────────────────────────────────────
export const getRooms = () => req("GET", "/rooms");
export const createRoom = (data) => req("POST", "/rooms", data);

// ────────────────────────────────────────────────────────────
// EXISTING: Bookings / Students (managed by staff)
// ────────────────────────────────────────────────────────────
export const createBooking = (data) => req("POST", "/bookings", data);
export const getStudents = () => req("GET", "/bookings/students");
export const approveBooking = (id) => req("PUT", `/bookings/approve/${id}`);
export const rejectBooking = (id) => req("PUT", `/bookings/reject/${id}`);
export const updateStudent = (id, data) =>
  req("PUT", `/bookings/students/${id}`, data);
export const deleteStudent = (id) => req("DELETE", `/bookings/students/${id}`);

// ────────────────────────────────────────────────────────────
// EXISTING: Wardens
// ────────────────────────────────────────────────────────────
export const createWarden = (data) => req("POST", "/owner/wardens", data);

// ────────────────────────────────────────────────────────────
// EXISTING: Payments (staff view)
// ────────────────────────────────────────────────────────────
export const getPayments = () => req("GET", "/payments");
export const updatePayment = (id, status) =>
  req("PUT", `/payments/${id}`, { status });
export const resetPayments = () => req("POST", "/payments/reset");

// ════════════════════════════════════════════════════════════
// NEW: Student Auth
// ════════════════════════════════════════════════════════════
// Tell backend teammate:
//   POST /api/student/login   → { token, student: { name, email } }
//   POST /api/student/register → { token, student: { name, email } }

// Student logs in using the name and phone they filled in the booking form
export const studentLogin = (name, phone) =>
  req("POST", "/student/login", { name, phone });

export const studentRegister = (name, email, password) =>
  req("POST", "/student/register", { name, email, password });

// ════════════════════════════════════════════════════════════
// NEW: Student Token Payment
// ════════════════════════════════════════════════════════════
// Tell backend teammate:
//   POST /api/student/token-payment
//   Headers: Authorization: Bearer <studentToken>
//   Body: { transactionId, method, amount }
//   Returns: { success: true }

export const submitTokenPayment = (data) =>
  studentReq("POST", "/student/token-payment", data);

// ════════════════════════════════════════════════════════════
// NEW: Student Profile — used in student dashboard pages
// ════════════════════════════════════════════════════════════
// Tell backend teammate:
//   GET /api/student/me
//   Headers: Authorization: Bearer <studentToken>
//   Returns:
//   {
//     student: { name, email, phone, dob, educationStatus,
//                permanentAddress, temporaryAddress },
//     booking: {
//       status,         // "Pending" | "Approved" | "Rejected"
//       createdAt,
//       room: { roomNumber, seaterType, monthlyFee, totalSeats, occupiedSeats }
//     },
//     tokenPayment: {
//       transactionId, method, amount, status, createdAt
//     },
//     payments: [
//       { _id, month, amount, status, createdAt }
//     ]
//   }

export const getStudentProfile = () => studentReq("GET", "/student/me");
