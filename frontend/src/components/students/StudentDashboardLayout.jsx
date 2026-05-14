import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useStudentAuth } from "./StudentAuthContext";
import "./StudentDashboard.css";

const navLinks = [
  { to: "/student-dashboard", label: "Overview", icon: "📊", end: true },
  { to: "/student-dashboard/profile", label: "My Profile", icon: "👩‍🎓" },
  { to: "/student-dashboard/book-room", label: "Book Room", icon: "📝" }, // NEW
  { to: "/student-dashboard/room", label: "My Room", icon: "🏠" },
  { to: "/student-dashboard/payments", label: "My Payments", icon: "💳" },
];

const StudentDashboardLayout = () => {
  const { studentInfo, doStudentLogout } = useStudentAuth();
  const navigate = useNavigate();

  function handleLogout() {
    doStudentLogout();
    navigate("/");
  }

  const initials = studentInfo?.name
    ? studentInfo.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <div className="sdash-root">
      {/* ── Sidebar ── */}
      <aside className="sdash-sidebar">
        <div className="sdash-sidebar-top">
          <div className="sdash-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <div className="sdash-role-badge">Student Portal</div>
        </div>

        {/* Avatar */}
        <div className="sdash-avatar-wrap">
          <div className="sdash-avatar">{initials}</div>
          <div className="sdash-avatar-info">
            <p className="sdash-avatar-name">
              {studentInfo?.name || "Student"}
            </p>
            <p className="sdash-avatar-email">{studentInfo?.email || ""}</p>
          </div>
        </div>

        <nav className="sdash-nav">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `sdash-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sdash-nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sdash-sidebar-bottom">
          <button className="sdash-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="sdash-main">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentDashboardLayout;
