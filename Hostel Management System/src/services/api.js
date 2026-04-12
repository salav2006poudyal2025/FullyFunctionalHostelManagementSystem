const BASE = "http://localhost:5000/api";

function headers() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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

// Auth
export const login = (email, password) =>
  req("POST", "/auth/login", { email, password });

// Rooms
export const getRooms = () => req("GET", "/rooms");
export const createRoom = (data) => req("POST", "/rooms", data);

// Bookings / Students
export const createBooking = (data) => req("POST", "/bookings", data);
export const getStudents = () => req("GET", "/bookings/students");
export const approveBooking = (id) => req("PUT", `/bookings/approve/${id}`);
export const rejectBooking = (id) => req("PUT", `/bookings/reject/${id}`);
export const updateStudent = (id, data) =>
  req("PUT", `/bookings/students/${id}`, data);
export const deleteStudent = (id) => req("DELETE", `/bookings/students/${id}`);

// Wardens
export const createWarden = (data) => req("POST", "/owner/wardens", data);

// Payments
export const getPayments = () => req("GET", "/payments");
export const updatePayment = (id, status) =>
  req("PUT", `/payments/${id}`, { status });
export const resetPayments = () => req("POST", "/payments/reset");
