// import { createContext, useContext, useState } from "react";

// const StudentAuthCtx = createContext(null);

// export function StudentAuthProvider({ children }) {
//   const [studentToken, setStudentToken] = useState(
//     () => localStorage.getItem("studentToken") || "",
//   );
//   const [studentInfo, setStudentInfo] = useState(() => {
//     const saved = localStorage.getItem("studentInfo");
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [hasPaid, setHasPaid] = useState(
//     () => localStorage.getItem("studentHasPaid") === "true",
//   );

//   function doStudentLogin(token, info) {
//     localStorage.setItem("studentToken", token);
//     localStorage.setItem("studentInfo", JSON.stringify(info));
//     setStudentToken(token);
//     setStudentInfo(info);
//   }

//   function doStudentLogout() {
//     localStorage.removeItem("studentToken");
//     localStorage.removeItem("studentInfo");
//     localStorage.removeItem("studentHasPaid");
//     setStudentToken("");
//     setStudentInfo(null);
//     setHasPaid(false);
//   }

//   function markPaid() {
//     localStorage.setItem("studentHasPaid", "true");
//     setHasPaid(true);
//   }

//   return (
//     <StudentAuthCtx.Provider
//       value={{
//         studentToken,
//         studentInfo,
//         hasPaid,
//         doStudentLogin,
//         doStudentLogout,
//         markPaid,
//       }}
//     >
//       {children}
//     </StudentAuthCtx.Provider>
//   );
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export const useStudentAuth = () => useContext(StudentAuthCtx);

import { createContext, useContext, useEffect, useState } from "react";

const StudentAuthCtx = createContext(null);

// ── Mock storage keys (replace with real APIs later) ──
const USERS_KEY = "sgh_users";
const CURRENT_KEY = "sgh_current_student";
const BOOKINGS_KEY = "sgh_bookings";

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function StudentAuthProvider({ children }) {
  const [studentToken, setStudentToken] = useState(
    () => localStorage.getItem("studentToken") || "",
  );
  const [studentInfo, setStudentInfo] = useState(() =>
    readJSON(CURRENT_KEY, null),
  );
  const [bookings, setBookings] = useState(() => readJSON(BOOKINGS_KEY, []));

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  // BACKEND: POST /api/student/signup { name, email, password }
  function doStudentSignup({ name, email, password }) {
    const users = readJSON(USERS_KEY, []);
    if (users.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("A student with that name already exists.");
    }
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  // BACKEND: POST /api/student/login { name, password }
  function doStudentLogin(name, password) {
    const users = readJSON(USERS_KEY, []);
    const found = users.find(
      (u) =>
        u.name.toLowerCase() === name.toLowerCase() && u.password === password,
    );
    if (!found) throw new Error("Invalid name or password.");
    const token = "mock-" + found.id;
    const info = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem("studentToken", token);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(info));
    setStudentToken(token);
    setStudentInfo(info);
    return info;
  }

  function doStudentLogout() {
    localStorage.removeItem("studentToken");
    localStorage.removeItem(CURRENT_KEY);
    setStudentToken("");
    setStudentInfo(null);
  }

  // BACKEND: POST /api/bookings  (after Khalti webhook confirms payment)
  function addBooking(booking) {
    setBookings((prev) => [booking, ...prev]);
  }

  // Helper for dashboards
  function getAllBookings() {
    return readJSON(BOOKINGS_KEY, []);
  }

  return (
    <StudentAuthCtx.Provider
      value={{
        studentToken,
        studentInfo,
        bookings,
        doStudentSignup,
        doStudentLogin,
        doStudentLogout,
        addBooking,
        getAllBookings,
      }}
    >
      {children}
    </StudentAuthCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudentAuth = () => useContext(StudentAuthCtx);
