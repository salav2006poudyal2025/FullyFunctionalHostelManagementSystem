import "./App.css";
import LandingPage from "./components/students/landingPage";
import LoginPage from "./components/auth/login";
import BookRoomPage from "./components/students/BookRoom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/book-room" element={<BookRoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
