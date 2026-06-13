import { useState } from "react";
import { createWarden } from "../../services/api";

const WardenPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createWarden(form);
      setSuccess("Warden created successfully!");
      setForm({ fullName: "", email: "", phone: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Wardens</h1>
          <p className="dash-page-sub">
            Create warden accounts for hostel staff
          </p>
        </div>
      </div>

      <div className="dash-form-card" style={{ maxWidth: 540 }}>
        <h3 className="dash-form-title">Add New Warden</h3>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 20 }}>
          Wardens can view rooms, approve/reject bookings, and manage students.
        </p>

        {error && (
          <div className="lp-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && <div className="dash-success">{success}</div>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="dash-form-field">
            <label>Full Name</label>
            <input
              name="fullName"
              className="dash-input"
              placeholder="e.g. Sita Sharma"
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
              placeholder="warden@example.com"
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
              placeholder="+977 98XXXXXXXX"
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
              placeholder="Set a strong password"
              value={form.password}
              onChange={update}
              required
            />
          </div>

          <button
            type="submit"
            className="dash-btn green"
            style={{ alignSelf: "flex-start", padding: "10px 28px" }}
            disabled={saving}
          >
            {saving ? "Creating…" : "✓ Create Warden"}
          </button>
        </form>
      </div>

      {/* <div className="dash-info-box">
        <h4>ℹ️ About Warden Access</h4>
        <ul>
          <li>
            Wardens can log in using the email and password you set above.
          </li>
          <li>
            Wardens can view students, approve or reject booking requests.
          </li>
          <li>
            Wardens <strong>cannot</strong> add rooms, manage payments, or
            create other wardens.
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default WardenPage;
