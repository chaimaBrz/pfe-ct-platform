import { useMemo, useState } from "react";
import "./Login.css";

/**
 * Helpers: create a "fake" JWT (alg: none) so ProtectedRoute lets us pass
 * without touching backend. jwt-decode will decode it without verifying signature.
 */
function base64UrlEncode(obj) {
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function makeFakeJwt(role = "OBSERVER", expiresInHours = 2) {
  const header = { alg: "none", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  // Add any fields your app might read (role is the important one)
  const payload = { role, exp };

  // signature empty
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
}

export default function Login() {
  // We keep the component name "Login" so routes/imports stay untouched.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [status, setStatus] = useState("EXPERT"); // EXPERT | NON_EXPERT | STUDENT
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  const [error, setError] = useState("");

  const showExperience = useMemo(() => status === "EXPERT", [status]);

  const validate = () => {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";

    const a = Number(age);
    if (!age || Number.isNaN(a) || a < 18 || a > 100) {
      return "Age must be between 18 and 100.";
    }

    if (!specialty.trim()) return "Specialty / Subspecialty is required.";

    if (showExperience) {
      const y = Number(yearsExperience);
      if (yearsExperience === "" || Number.isNaN(y) || y < 0 || y > 60) {
        return "Years of experience must be between 0 and 60.";
      }
    }

    if (!confirmAccuracy) return "Please confirm the information is accurate.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    // ✅ Save observer profile locally (front-only)
    const observer = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      status,
      yearsExperience: showExperience ? Number(yearsExperience) : 0,
      specialty: specialty.trim(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("observer_profile", JSON.stringify(observer));

    // ✅ Create a fake token so ProtectedRoute allows access
    // IMPORTANT: role should match what your ProtectedRoute expects (usually "OBSERVER")
    localStorage.setItem("token", makeFakeJwt("OBSERVER", 2));

    // ✅ Go to pre-validation page
    window.location.href = "/observer/pre-validation";
  };

  return (
    <div className="login-shell">
      <header className="login-header">
        <div className="login-logo">
          <div className="login-logo-title">CT Vision</div>
          <div className="login-logo-sub">
            Image Quality Assessment Platform
          </div>
        </div>
      </header>

      <div className="login-card">
        <h2 className="login-title">Observer Information Form</h2>
        <p className="login-sub">
          Please fill in the following information before starting the visual
          validation tests.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">First Name *</label>
          <input
            className="login-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g., Sarah"
            autoComplete="off"
          />

          <label className="login-label">Last Name *</label>
          <input
            className="login-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g., Martin"
            autoComplete="off"
          />

          <label className="login-label">Age *</label>
          <input
            className="login-input"
            type="number"
            min="18"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 35"
          />

          <label className="login-label">Status *</label>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name="status"
                checked={status === "EXPERT"}
                onChange={() => setStatus("EXPERT")}
              />
              Expert (Radiologist)
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name="status"
                checked={status === "NON_EXPERT"}
                onChange={() => setStatus("NON_EXPERT")}
              />
              Non-expert
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name="status"
                checked={status === "STUDENT"}
                onChange={() => setStatus("STUDENT")}
              />
              Student
            </label>
          </div>

          {showExperience && (
            <>
              <label className="login-label">Years of Experience *</label>
              <input
                className="login-input"
                type="number"
                min="0"
                max="60"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="e.g., 8"
              />
            </>
          )}

          <label className="login-label">Specialty / Subspecialty *</label>
          <input
            className="login-input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="e.g., thoracic imaging, neuroradiology..."
            autoComplete="off"
          />

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <input
              type="checkbox"
              checked={confirmAccuracy}
              onChange={(e) => setConfirmAccuracy(e.target.checked)}
            />
            I confirm that the information provided is accurate.
          </label>

          <button className="login-btn" type="submit">
            Start Visual Validation
          </button>
        </form>

        <div className="login-footer">© 2026 CT Vision</div>
      </div>
    </div>
  );
}
