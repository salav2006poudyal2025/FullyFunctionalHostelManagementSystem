import { useEffect, useState } from "react";
import {
  getStudents,
  approveBooking,
  rejectBooking,
  deleteStudent,
} from "../../services/api";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id) {
    if (!confirm("Approve this booking?")) return;
    try {
      await approveBooking(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleReject(id) {
    if (!confirm("Reject this booking?")) return;
    try {
      await rejectBooking(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this student record? This cannot be undone.")) return;
    try {
      await deleteStudent(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const filtered = students.filter((s) => {
    const matchFilter = filter === "All" || s.status === filter;
    const matchSearch =
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return <div className="dash-loading">Loading…</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <h1 className="dash-page-title">Students</h1>
        <p className="dash-page-sub">
          Manage booking requests and enrolled students
        </p>
      </div>

      <div className="dash-toolbar">
        <div className="dash-filter-tabs">
          {["All", "Pending", "Approved", "Rejected"].map((f) => (
            <button
              key={f}
              className={`dash-filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="dash-filter-count">
                {f === "All"
                  ? students.length
                  : students.filter((s) => s.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <input
          className="dash-search"
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="dash-empty">No records found.</p>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Room</th>
                <th>Education</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id}>
                  <td className="dash-td-name">{s.fullName}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>
                    #{s.room?.roomNumber || "—"} ({s.room?.seaterType || "?"}⃣)
                  </td>
                  <td>{s.educationStatus || "—"}</td>
                  <td>
                    <span className={`dash-badge ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      {s.status === "Pending" && (
                        <>
                          <button
                            className="dash-btn green"
                            onClick={() => handleApprove(s._id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="dash-btn red"
                            onClick={() => handleReject(s._id)}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button
                        className="dash-btn ghost"
                        onClick={() => handleDelete(s._id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
