/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { studentRegister, studentLogin as apiStudentLogin } from "../../services/api";

const StudentAuthCtx = createContext(null);

export function StudentAuthProvider({ children }) {
  const [studentToken, setStudentToken] = useState(
    () => localStorage.getItem("studentToken") || ""
  );
  const [studentInfo, setStudentInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("studentInfo")) || null;
    } catch {
      return null;
    }
  });

  // POST /api/student/register
  async function doStudentSignup({ name, email, password }) {
    const data = await studentRegister(name, email, password);
    // After signup, don't auto-login — redirect to login page
    return data;
  }

  // POST /api/student/login
  async function doStudentLogin(name, password) {
    const data = await apiStudentLogin(name, password);
    const { token, student } = data;

    localStorage.setItem("studentToken", token);
    localStorage.setItem("studentInfo", JSON.stringify(student));
    setStudentToken(token);
    setStudentInfo(student);

    return student;
  }

  function doStudentLogout() {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentInfo");
    setStudentToken("");
    setStudentInfo(null);
  }

  return (
    <StudentAuthCtx.Provider
      value={{
        studentToken,
        studentInfo,
        doStudentSignup,
        doStudentLogin,
        doStudentLogout,
      }}
    >
      {children}
    </StudentAuthCtx.Provider>
  );
}

export const useStudentAuth = () => useContext(StudentAuthCtx);
