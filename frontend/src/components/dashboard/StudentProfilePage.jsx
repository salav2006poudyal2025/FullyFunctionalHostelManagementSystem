import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/api";

const StudentProfilePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentProfile()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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

        <div className="sdash-profile-grid">
          {fields.map((f) => (
            <div key={f.label} className="sdash-profile-field">
              <span className="sdash-profile-label">{f.label}</span>
              <span className="sdash-profile-value">{f.value || "—"}</span>
            </div>
          ))}
        </div>

        <p className="sdash-profile-note">
          To update your information, please contact the warden directly.
        </p>
      </div>
    </div>
  );
};

export default StudentProfilePage;
