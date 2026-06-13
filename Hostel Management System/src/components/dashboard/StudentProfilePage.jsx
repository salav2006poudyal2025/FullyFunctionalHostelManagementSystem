import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/api";
/*
  What this file does:
  ─────────────────────────────────────────────────────────────
  This page shows the student's own personal details — name,
  email, phone, date of birth, education status, and addresses.
  The student can VIEW their info but cannot edit it (warden edits).

  Backend teammate needs:
    GET /api/student/me  (Authorization: Bearer <studentToken>)
    Returns: { student: { name, email, phone, dob, educationStatus,
               permanentAddress, temporaryAddress }, booking: {...} }
  ─────────────────────────────────────────────────────────────
*/

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

  const fields = [
    { label: "Full Name", value: s.name },
    { label: "Email Address", value: s.email },
    { label: "Phone Number", value: s.phone ? `+977 ${s.phone}` : null },
    {
      label: "Date of Birth",
      value: s.dob
        ? new Date(s.dob).toLocaleDateString("en-NP", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null,
    },
    { label: "Education Status", value: s.educationStatus },
    { label: "Permanent Address", value: s.permanentAddress },
    { label: "Temporary Address", value: s.temporaryAddress },
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

      <div className="sdash-profile-card">
        {/* Avatar header */}
        <div className="sdash-profile-header">
          <div className="sdash-profile-avatar">
            {s.name
              ? s.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "ST"}
          </div>
          <div>
            <h2 className="sdash-profile-name">{s.name || "—"}</h2>
            <p className="sdash-profile-email">{s.email || "—"}</p>
          </div>
        </div>

        <div className="sdash-profile-divider" />

        {/* Info grid */}
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
