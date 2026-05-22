const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function headers() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function studentHeaders() {
  const token = localStorage.getItem("studentToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const text = await res.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("Invalid JSON response:", text);
    throw new Error(
      "Backend server is not returning JSON. Please check backend connection."
    );
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
    }

    throw new Error(data.message || "Request failed");
  }

  return data;
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse(res);
}

async function studentReq(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: studentHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse(res);
}

export const login = (email, password) =>
  req("POST", "/auth/login", { email, password });

export const studentRegister = (name, email, password) =>
  req("POST", "/student/register", { name, email, password });

export const studentLogin = (email, password) =>
  req("POST", "/student/login", { email, password });

export const getStudentProfile = () =>
  studentReq("GET", "/student/me");

export const updateStudentProfile = (data) =>
  studentReq("PUT", "/student/me", data);

export const getRooms = () => req("GET", "/rooms");
export const queryRoomsByAI = (queryText) =>
  req("POST", "/rooms/query", { query: queryText });

export const createRoom = (data) => req("POST", "/rooms", data);

export const updateRoom = (id, data) =>
  req("PUT", `/rooms/${id}`, data);

export const deleteRoom = (id) => req("DELETE", `/rooms/${id}`);

export const createBooking = (data) =>
  req("POST", "/bookings", data);

export const getStudents = () =>
  req("GET", "/bookings/students");

export const approveBooking = (id) =>
  req("PUT", `/bookings/approve/${id}`);

export const rejectBooking = (id) =>
  req("PUT", `/bookings/reject/${id}`);

export const updateStudent = (id, data) =>
  req("PUT", `/bookings/students/${id}`, data);

export const deleteStudent = (id) =>
  req("DELETE", `/bookings/students/${id}`);

export const getWardens = () =>
  req("GET", "/owner/wardens");

export const createWarden = (data) =>
  req("POST", "/owner/wardens", data);

export const updateWarden = (id, data) =>
  req("PUT", `/owner/wardens/${id}`, data);

export const deleteWarden = (id) =>
  req("DELETE", `/owner/wardens/${id}`);

export const getPayments = (month) =>
  req("GET", `/payments${month ? `?month=${month}` : ""}`);

export const getAllPayments = () =>
  req("GET", "/payments/all");

export const updatePayment = (id, status) =>
  req("PUT", `/payments/${id}`, { status });

export const generateMonthlyPayments = (month) =>
  req("POST", "/payments/generate", { month });

export const resetPayments = () =>
  req("POST", "/payments/reset");

export const submitTokenPayment = (data) =>
  studentReq("POST", "/student/token-payment", data);

export const initiateKhaltiPayment = ({ bookingId }) =>
  studentReq("POST", "/student/khalti/initiate", { bookingId });

export const verifyKhaltiPayment = ({ bookingId, pidx }) =>
  studentReq("POST", "/student/khalti/verify", { bookingId, pidx });

export const verifyKhaltiTokenPayment = ({ bookingId, token }) =>
  studentReq("POST", "/student/token-payment", { bookingId, token });
