import { useEffect, useState } from "react";
import {
  getWardens,
  createWarden,
  updateWarden,
  deleteWarden,
} from "../../services/api";

const WardenPage = () => {
  const [wardens, setWardens] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [editingWardenId, setEditingWardenId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadWardens() {
    try {
      const data = await getWardens();
      setWardens(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadWardens();
  }, []);

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleEdit(warden) {
    setEditingWardenId(warden._id);
    setError("");
    setSuccess("");
    setForm({
      fullName: warden.fullName,
      email: warden.email,
      phone: warden.phone || "",
      password: "",
    });
  }

  function cancelEdit() {
    setEditingWardenId(null);
    setError("");
    setSuccess("");
    setForm({ fullName: "", email: "", phone: "", password: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingWardenId) {
        await updateWarden(editingWardenId, form);
        setSuccess("Warden updated successfully!");
        cancelEdit();
      } else {
        await createWarden(form);
        setSuccess("Warden created successfully!");
        setForm({ fullName: "", email: "", phone: "", password: "" });
      }
      loadWardens();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this warden account?")) return;
    try {
      await deleteWarden(id);
      loadWardens();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Wardens</h1>
          <p className="dash-page-sub">Manage warden accounts for hostel staff</p>
        </div>
      </div>

      {/* Create / edit warden form */}
      <div className="dash-form-card" style={{ maxWidth: 540, marginBottom: 40 }}>
        <h3 className="dash-form-title">
          {editingWardenId ? "Edit Warden" : "Add New Warden"}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 20 }}>
          Wardens can view rooms, approve/reject bookings, and manage students.
        </p>

        {error && (
          <div className="lp-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div className="dash-success" style={{ marginBottom: 16 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="dash-form-field">
            <label>Full Name</label>
            <input
              name="fullName"
              className="dash-input"
              value={form.fullName}
              onChange={update}
              required
            />
          </div>
          <div className="dash-form-field">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              className="dash-input"
              value={form.email}
              onChange={update}
              required
            />
          </div>
          <div className="dash-form-field">
            <label>Phone Number</label>
            <input
              name="phone"
              type="tel"
              className="dash-input"
              value={form.phone}
              onChange={update}
            />
          </div>
          <div className="dash-form-field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              className="dash-input"
              value={form.password}
              onChange={update}
              required={!editingWardenId}
              minLength={editingWardenId ? undefined : 6}
              placeholder={editingWardenId ? "Leave blank to keep current password" : "Minimum 6 characters"}
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="submit"
              className="dash-btn green"
              style={{ alignSelf: "flex-start", padding: "10px 28px" }}
              disabled={saving}
            >
              {saving
                ? editingWardenId
                  ? "Updating…"
                  : "Creating…"
                : editingWardenId
                ? "Update Warden"
                : "Create Warden"}
            </button>
            {editingWardenId && (
              <button type="button" className="dash-btn sand" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Warden list */}
      <div className="dash-section">
        <h2 className="dash-section-title">Current Wardens</h2>
        {loadingList ? (
          <p className="dash-empty">Loading…</p>
        ) : wardens.length === 0 ? (
          <p className="dash-empty">No wardens added yet.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wardens.map((w) => (
                  <tr key={w._id}>
                    <td className="dash-td-name">{w.fullName}</td>
                    <td>{w.email}</td>
                    <td>{w.phone || "—"}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="dash-btn sand" onClick={() => handleEdit(w)}>
                        ✏️ Edit
                      </button>
                      <button className="dash-btn red" onClick={() => handleDelete(w._id)}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenPage;
