import { useEffect, useState } from "react";
import { getStudentProfile, updateMyProfile } from "../../services/api";

const StudentProfilePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    fullName: "",
    phone: "",
    dob: "",
    educationStatus: "",
    permanentAddress: "",
    temporaryAddress: "",
  });

  const resetForm = (profileData) => {
    const s = profileData?.student || {};
    const b = profileData?.booking || {};

    setForm({
      name: s.name || b.fullName || "",
      email: s.email || b.email || "",
      fullName: b.fullName || s.name || "",
      phone: b.phone || "",
      dob: b.dob ? new Date(b.dob).toISOString().slice(0, 10) : "",
      educationStatus: b.educationStatus || "",
      permanentAddress: b.permanentAddress || "",
      temporaryAddress: b.temporaryAddress || "",
    });
  };

  useEffect(() => {
    getStudentProfile()
      .then((response) => {
        setData(response);
        resetForm(response);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.student || {};
  const b = data?.booking || {};

  const displayName = b.fullName || s.name || "";
  const displayEmail = b.email || s.email || "";
  const displayPhone = b.phone || null;
  const displayDob = b.dob || null;
  const displayEducation = b.educationStatus || null;
  const displayPermanent = b.permanentAddress || null;
  const displayTemporary = b.temporaryAddress || null;

  const fields = [
    { label: "Full Name", value: displayName },
    { label: "Email Address", value: displayEmail },
    { label: "Phone Number", value: displayPhone ? `+977 ${displayPhone}` : null },
    {
      label: "Date of Birth",
      value: displayDob
        ? new Date(displayDob).toLocaleDateString("en-NP", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null,
    },
    { label: "Education Status", value: displayEducation },
    { label: "Permanent Address", value: displayPermanent },
    { label: "Temporary Address", value: displayTemporary },
  ];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updated = await updateMyProfile({
        name: form.name,
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        dob: form.dob || undefined,
        educationStatus: form.educationStatus,
        permanentAddress: form.permanentAddress,
        temporaryAddress: form.temporaryAddress,
      });

      setData(updated);
      resetForm(updated);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dash-loading">Loading…</div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Profile</h1>
          <p className="dash-page-sub">
            Review and edit the student details registered with the hostel.
          </p>
        </div>
      </div>

      {error && (
        <div className="lp-error" style={{ marginBottom: 24 }}>
          Could not load profile: {error}
        </div>
      )}

      {!data?.booking && !error && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            background: "#fef9ef",
            border: "1px solid #f5d97a",
            borderRadius: 8,
            fontSize: 14,
            color: "#7a5c00",
          }}
        >
          ℹ️ Full profile details (phone, address, etc.) appear here after you
          submit a room booking.
        </div>
      )}

      <div className="sdash-profile-card">
        <div className="sdash-profile-header">
          <div className="sdash-profile-avatar">
            {displayName
              ? displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
              : "ST"}
          </div>
          <div>
            <h2 className="sdash-profile-name">{displayName || "—"}</h2>
            <p className="sdash-profile-email">{displayEmail || "—"}</p>
          </div>
          <button
            type="button"
            className="dash-btn sand"
            style={{ marginLeft: "auto" }}
            onClick={() => {
              setEditing((current) => !current);
              setError("");
              setSuccess("");
              if (!editing) resetForm(data);
            }}
          >
            {editing ? "Cancel" : "Edit Details"}
          </button>
        </div>

        <div className="sdash-profile-divider" />

        {editing ? (
          <form className="dash-form" onSubmit={handleSave}>
            {success && (
              <div className="dash-success" style={{ marginBottom: 16 }}>
                {success}
              </div>
            )}
            <div className="dash-form-grid" style={{ gap: 16 }}>
              <div className="dash-form-field">
                <label>Full Name</label>
                <input
                  name="fullName"
                  className="dash-input"
                  value={form.fullName}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
              </div>
              <div className="dash-form-field">
                <label>Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  className="dash-input"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>
              <div className="dash-form-field">
                <label>Education Status</label>
                <input
                  name="educationStatus"
                  className="dash-input"
                  value={form.educationStatus}
                  onChange={handleChange}
                />
              </div>
              <div className="dash-form-field">
                <label>Permanent Address</label>
                <input
                  name="permanentAddress"
                  className="dash-input"
                  value={form.permanentAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="dash-form-field">
                <label>Temporary Address</label>
                <input
                  name="temporaryAddress"
                  className="dash-input"
                  value={form.temporaryAddress}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button type="submit" className="dash-btn green" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                className="dash-btn sand"
                onClick={() => {
                  setEditing(false);
                  resetForm(data);
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="sdash-profile-grid">
            {fields.map((f) => (
              <div key={f.label} className="sdash-profile-field">
                <span className="sdash-profile-label">{f.label}</span>
                <span className="sdash-profile-value">{f.value || "—"}</span>
              </div>
            ))}
          </div>
        )}

        {!editing && (
          <p className="sdash-profile-note">
            You can edit your student details directly from this page.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;
