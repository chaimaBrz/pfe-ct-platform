// src/pages/public/ObserverForm.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ObserverForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Statut = ce que tu montres dans l’UI
  const [status, setStatus] = useState("EXPERT"); // EXPERT | NON_EXPERT | STUDENT

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  // Expert path
  const specialtyOptions = useMemo(
    () => [
      { value: "CHEST", label: "Chest" },
      { value: "ABDOMINAL", label: "Abdominal" },
      { value: "MSK", label: "MSK" },
      { value: "EMERGENCY", label: "Emergency" },
      { value: "ONCOLOGY", label: "Oncology" },
      { value: "PEDIATRIC", label: "Pediatric" },
      { value: "NEURORADIOLOGY", label: "Neuroradiology" },
      { value: "OTHER", label: "Other" },
    ],
    [],
  );

  const [specialty, setSpecialty] = useState("CHEST");
  const [specialtyOther, setSpecialtyOther] = useState("");

  // Non expert path
  const [nonExpertRole, setNonExpertRole] = useState(""); // “il est quoi”

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  function validate() {
    setError("");

    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";

    const a = Number(age);
    if (!Number.isFinite(a) || a <= 0) return "Age must be a valid number";

    const y = Number(experienceYears);
    if (!Number.isFinite(y) || y < 0)
      return "Years of experience must be valid";

    if (!consentAccepted) return "You must accept consent to continue";

    if (status === "EXPERT") {
      if (!specialty) return "Specialty is required";
      if (specialty === "OTHER" && !specialtyOther.trim())
        return "Please specify your specialty";
    } else {
      if (!nonExpertRole.trim()) return "Please specify your role/background";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // mapping vers backend
    const expertiseType = status === "EXPERT" ? "RADIOLOGY" : "OTHER";

    const observer = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      experienceYears: Number(experienceYears),
      expertiseType,
      consentAccepted: true,
    };

    if (status === "EXPERT") {
      observer.specialty = specialty;
      if (specialty === "OTHER")
        observer.specialtyOther = specialtyOther.trim();
    } else {
      // Non expert / Student
      // (Optionnel mais utile pour analyse)
      observer.expertiseOther =
        status === "STUDENT"
          ? `STUDENT - ${nonExpertRole.trim()}`
          : nonExpertRole.trim();

      // Si ton back exige "specialty" même pour OTHER, tu peux faire:
      observer.specialty = "OTHER";
    }

    const body = { token, observer };

    try {
      const res = await fetch(`${baseUrl}/public/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Request failed");
      }

      const json = await res.json(); // { sessionId }
      localStorage.setItem("sessionId", json.sessionId);

      // go to vision test
      navigate(`/public/${token}/vision`);
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Observer profile</h2>

      {error && (
        <div
          style={{ padding: 12, marginBottom: 12, border: "1px solid #f5c2c7" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          First Name *
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g., Sarah"
          />
        </label>

        <label>
          Last Name *
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g., Martin"
          />
        </label>

        <label>
          Age *
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 35"
            inputMode="numeric"
          />
        </label>

        <div style={{ marginTop: 14 }}>
          <div>
            <b>Status *</b>
          </div>

          <label style={{ display: "block", marginTop: 6 }}>
            <input
              type="radio"
              name="status"
              checked={status === "EXPERT"}
              onChange={() => setStatus("EXPERT")}
            />{" "}
            Expert (Radiologist)
          </label>

          <label style={{ display: "block", marginTop: 6 }}>
            <input
              type="radio"
              name="status"
              checked={status === "NON_EXPERT"}
              onChange={() => setStatus("NON_EXPERT")}
            />{" "}
            Non-expert
          </label>

          <label style={{ display: "block", marginTop: 6 }}>
            <input
              type="radio"
              name="status"
              checked={status === "STUDENT"}
              onChange={() => setStatus("STUDENT")}
            />{" "}
            Student
          </label>
        </div>

        <label style={{ marginTop: 14 }}>
          Years of Experience *
          <input
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g., 8"
            inputMode="numeric"
          />
        </label>

        {status === "EXPERT" ? (
          <>
            <label style={{ marginTop: 14 }}>
              Specialty / Subspecialty *
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {specialtyOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {specialty === "OTHER" && (
              <label style={{ marginTop: 10 }}>
                Please specify *
                <input
                  value={specialtyOther}
                  onChange={(e) => setSpecialtyOther(e.target.value)}
                  placeholder="Type your specialty"
                />
              </label>
            )}
          </>
        ) : (
          <label style={{ marginTop: 14 }}>
            Please specify your background/role *
            <input
              value={nonExpertRole}
              onChange={(e) => setNonExpertRole(e.target.value)}
              placeholder="e.g., Image quality engineer, researcher..."
            />
          </label>
        )}

        <label style={{ display: "block", marginTop: 14 }}>
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
          />{" "}
          I accept to participate (consent) *
        </label>

        <button style={{ marginTop: 16 }} type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}
