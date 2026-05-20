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

  const filtered = students.filter((student) => {
    const matchFilter = filter === "All" || student.status === filter;
    const term = search.toLowerCase();
    const matchSearch =
      student.fullName?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term);
    return matchFilter && matchSearch;
  });

  if (loading) return <div className="dash-loading">Loading...</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <h1 className="dash-page-title">Students</h1>
        <p className="dash-page-sub">
          Manage booking requests and enrolled students.
        </p>
      </div>

      <div className="dash-toolbar">
        <div className="dash-filter-tabs">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              className={`dash-filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
              <span className="dash-filter-count">
                {status === "All"
                  ? students.length
                  : students.filter((student) => student.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <input
          className="dash-search"
          type="text"
          placeholder="Search by name or email..."
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
                <th>Token</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const tokenStatus = student.tokenPayment?.status || "Pending";
                const tokenPaid = tokenStatus === "Confirmed";

                return (
                  <tr key={student._id}>
                    <td className="dash-td-name">{student.fullName}</td>
                    <td>{student.phone}</td>
                    <td>{student.email}</td>
                    <td>
                      #{student.room?.roomNumber || "-"} ({student.room?.seaterType || "?"}-Seater)
                    </td>
                    <td>{student.educationStatus || "-"}</td>
                    <td>
                      <span
                        className={`dash-badge ${
                          tokenPaid
                            ? "approved"
                            : tokenStatus === "Expired"
                              ? "rejected"
                              : "pending"
                        }`}
                      >
                        Rs.{student.tokenPayment?.amount || 500} {tokenStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`dash-badge ${student.status.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="dash-actions">
                        {student.status === "Pending" && (
                          <>
                            <button
                              className="dash-btn green"
                              onClick={() => handleApprove(student._id)}
                              disabled={!tokenPaid}
                              title={
                                tokenPaid
                                  ? "Approve this booking"
                                  : "Rs.500 Khalti token payment is required first"
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="dash-btn red"
                              onClick={() => handleReject(student._id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="dash-btn ghost"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
