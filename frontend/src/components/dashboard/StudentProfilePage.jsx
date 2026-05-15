import { useEffect, useState } from "react";
import { getStudentProfile, updateStudentProfile } from "../../services/api";
import {
  EDUCATION_OPTIONS,
  cleanEmail,
  cleanText,
  firstValidationError,
  maxDobForMinimumAge,
  validateAddress,
  validateDob,
  validateEducation,
  validateEmail,
  validateName,
  validatePhone,
} from "../../utils/validation";

const StudentProfilePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const loadData = () => {
    setLoading(true);
    getStudentProfile()
      .then((res) => {
        setData(res);
        const s = res?.student || {};
        const b = res?.booking || {};
        setForm({
          name: b.fullName || s.name || "",
          email: b.email || s.email || "",
          phone: b.phone || "",
          dob: b.dob ? b.dob.split("T")[0] : "",
          educationStatus: b.educationStatus || "",
          permanentAddress: b.permanentAddress || "",
          temporaryAddress: b.temporaryAddress || "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = firstValidationError([
      validateName(form.name),
      validateEmail(form.email),
      form.phone ? validatePhone(form.phone) : "",
      form.dob ? validateDob(form.dob) : "",
      form.educationStatus ? validateEducation(form.educationStatus) : "",
      form.permanentAddress
        ? validateAddress(form.permanentAddress, "Permanent address")
        : "",
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      await updateStudentProfile({
        ...form,
        email: cleanEmail(form.email),
        name: cleanText(form.name),
        permanentAddress: cleanText(form.permanentAddress),
        phone: cleanText(form.phone),
        temporaryAddress: cleanText(form.temporaryAddress),
      });
      setIsEditing(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dash-loading">Loading…</div>;

  const s = data?.student || {};
  // Booking holds all detailed form fields filled at booking time:
  // phone, dob, addresses, educationStatus are on the Booking doc, NOT Student model
  const b = data?.booking || {};

  const displayName     = b.fullName    || s.name  || "";
  const displayEmail    = b.email       || s.email || "";
  const displayPhone    = b.phone       || null;
  const displayDob      = b.dob         || null;
  const displayEducation= b.educationStatus  || null;
  const displayPermanent= b.permanentAddress || null;
  const displayTemporary= b.temporaryAddress || null;

  const fields = [
    { label: "Full Name",         value: displayName },
    { label: "Email Address",     value: displayEmail },
    { label: "Phone Number",      value: displayPhone ? `+977 ${displayPhone}` : null },
    {
      label: "Date of Birth",
      value: displayDob
        ? new Date(displayDob).toLocaleDateString("en-NP", {
            day: "numeric", month: "long", year: "numeric",
          })
        : null,
    },
    { label: "Education Status",  value: displayEducation },
    { label: "Permanent Address", value: displayPermanent },
    { label: "Temporary Address", value: displayTemporary },
  ];

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Profile</h1>
          <p className="dash-page-sub">
            Your personal information as registered with the hostel.
          </p>
        </div>
      </div>

      {error && (
        <div className="lp-error" style={{ marginBottom: 24 }}>
          Could not load profile: {error}
        </div>
      )}

      {!data?.booking && !error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fef9ef",
          border: "1px solid #f5d97a", borderRadius: 8, fontSize: 14, color: "#7a5c00" }}>
          ℹ️ Full profile details (phone, address, etc.) appear here after you submit a room booking.
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
        </div>

        <div className="sdash-profile-divider" />

        {isEditing ? (
          <form onSubmit={handleSave} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="dash-form-field">
              <label>Full Name</label>
              <input name="name" className="dash-input" value={form.name} onChange={handleUpdate} required />
            </div>
            <div className="dash-form-field">
              <label>Email</label>
              <input name="email" type="email" autoComplete="email" className="dash-input" value={form.email} onChange={handleUpdate} required />
            </div>
            <div className="dash-form-field">
              <label>Phone</label>
              <input name="phone" type="tel" inputMode="numeric" pattern="\d{10}" maxLength={10} className="dash-input" value={form.phone} onChange={handleUpdate} />
            </div>
            <div className="dash-form-field">
              <label>Date of Birth</label>
              <input name="dob" type="date" max={maxDobForMinimumAge(16)} className="dash-input" value={form.dob} onChange={handleUpdate} />
            </div>
            <div className="dash-form-field">
              <label>Education Status</label>
              <select name="educationStatus" className="dash-input" value={form.educationStatus} onChange={handleUpdate}>
                <option value="">Select</option>
                {EDUCATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="dash-form-field">
              <label>Permanent Address</label>
              <input name="permanentAddress" className="dash-input" value={form.permanentAddress} onChange={handleUpdate} />
            </div>
            <div className="dash-form-field">
              <label>Temporary Address</label>
              <input name="temporaryAddress" className="dash-input" value={form.temporaryAddress} onChange={handleUpdate} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="dash-btn green" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="dash-btn" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="sdash-profile-grid">
              {fields.map((f) => (
                <div key={f.label} className="sdash-profile-field">
                  <span className="sdash-profile-label">{f.label}</span>
                  <span className="sdash-profile-value">{f.value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="dash-actions" style={{ marginTop: 24 }}>
              <button className="dash-btn sand" onClick={() => setIsEditing(true)}>
                ✎ Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;
