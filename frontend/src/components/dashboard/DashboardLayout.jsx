import { useAuth } from "../../AuthContext";
import { useNavigate, NavLink, Outlet } from "react-router-dom";

const ownerLinks = [
  { to: "/dashboard", label: "Overview", icon: "📊", end: true },
  { to: "/dashboard/students", label: "Students", icon: "👩‍🎓" },
  { to: "/dashboard/rooms", label: "Rooms", icon: "🏠" },
  { to: "/dashboard/wardens", label: "Wardens", icon: "👤" },
  { to: "/dashboard/payments", label: "Payments", icon: "💳" },
];

const wardenLinks = [
  { to: "/dashboard", label: "Overview", icon: "📊", end: true },
  { to: "/dashboard/students", label: "Students", icon: "👩‍🎓" },
  { to: "/dashboard/rooms", label: "Rooms", icon: "🏠" },
];

const DashboardLayout = () => {
  const { role, doLogout } = useAuth();
  const navigate = useNavigate();

  const links = role === "Owner" ? ownerLinks : wardenLinks;

  function handleLogout() {
    doLogout();
    navigate("/login");
  }

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          <div className="dash-logo">
            Shikha <span>Girls</span> Hostel
          </div>
          <div className="dash-role-badge">{role}</div>
        </div>

        <nav className="dash-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `dash-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="dash-nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar-bottom">
          <button className="dash-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
