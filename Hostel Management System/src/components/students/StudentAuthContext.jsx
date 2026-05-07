import { createContext, useContext, useState } from "react";

const StudentAuthCtx = createContext(null);

export function StudentAuthProvider({ children }) {
  const [studentToken, setStudentToken] = useState(
    () => localStorage.getItem("studentToken") || "",
  );
  const [studentInfo, setStudentInfo] = useState(() => {
    const saved = localStorage.getItem("studentInfo");
    return saved ? JSON.parse(saved) : null;
  });
  const [hasPaid, setHasPaid] = useState(
    () => localStorage.getItem("studentHasPaid") === "true",
  );

  function doStudentLogin(token, info) {
    localStorage.setItem("studentToken", token);
    localStorage.setItem("studentInfo", JSON.stringify(info));
    setStudentToken(token);
    setStudentInfo(info);
  }

  function doStudentLogout() {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentInfo");
    localStorage.removeItem("studentHasPaid");
    setStudentToken("");
    setStudentInfo(null);
    setHasPaid(false);
  }

  function markPaid() {
    localStorage.setItem("studentHasPaid", "true");
    setHasPaid(true);
  }

  return (
    <StudentAuthCtx.Provider
      value={{
        studentToken,
        studentInfo,
        hasPaid,
        doStudentLogin,
        doStudentLogout,
        markPaid,
      }}
    >
      {children}
    </StudentAuthCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudentAuth = () => useContext(StudentAuthCtx);
