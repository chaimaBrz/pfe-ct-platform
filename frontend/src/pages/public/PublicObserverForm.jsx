import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PublicObserverForm.css";
import bgImage from "../../assets/medical-bg.png";
import { API_BASE_URL } from "../../config"; // adapte si besoin

export default function PublicObserverForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    expertiseType: "RADIOLOGY", // RADIOLOGY | IMAGE_QUALITY | OTHER
    experienceYears: "",
    specialty: "CHEST",
    consentAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const specialtyOptions = useMemo(
    () => [
      "CHEST",
      "ABDOMINAL",
      "MSK",
      "EMERGENCY",
      "ONCOLOGY",
      "PEDIATRIC",
      "NEURO",
      "OTHER",
    ],
    [],
  );

  const expertiseOptions = useMemo(
    () => [
      { value: "RADIOLOGY", label: "Radiology" },
      { value: "IMAGE_QUALITY", label: "Image quality" },
      { value: "OTHER", label: "Other" },
    ],
    [],
  );

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";

    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 120)
      return "Age must be a valid number (18–120).";

    const expNum = Number(form.experienceYears);
    if (!Number.isFinite(expNum) || expNum < 0 || expNum > 80)
      return "Experience years must be a valid number (0–80).";

    if (!form.consentAccepted) return "You must accept consent to continue.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    const payload = {
      token,
      observer: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: Number(form.age),
        expertiseType: form.expertiseType,
        specialty: form.specialty,
        experienceYears: Number(form.experienceYears),
        consentAccepted: Boolean(form.consentAccepted),
      },
    };

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/public/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const json = JSON.parse(text);

      // ✅ important: même clé partout
      localStorage.setItem("sessionId", json.sessionId);
      localStorage.setItem("publicToken", token);

      // ➜ page vision (ishihara + contraste)
      navigate(`/public/${token}/vision`);
    } catch (e2) {
      setErr(
        typeof e2?.message === "string"
          ? e2.message
          : "Unable to start session.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="form-overlay" />

      <header className="form-header">
        <div className="logo">
          <div className="logo-circle">CT</div>
          <div>
            <div className="logo-title">CT Image Evaluation</div>
            <div className="logo-sub">Observer portal</div>
          </div>
        </div>

        <div className="top-badges">
          <span className="badge">Anonymous</span>
          <span className="badge">No account</span>
          <span className="badge">~ 1 min</span>
        </div>
      </header>

      <main className="form-content">
        <section className="form-left">
          <h1>
            Observer <span>profile</span>
          </h1>
          <p className="form-desc">
            Please fill in your profile information. This helps interpret
            results by experience level. Data is recorded discreetly.
          </p>

          <div className="info-card">
            <div className="card-title">Privacy</div>
            <p className="card-text">
              No vision score will be displayed. Answers are stored for research
              purposes only.
            </p>
          </div>
        </section>

        <aside className="form-right">
          <div className="panel-title">Profile form</div>
          <div className="panel-sub">All fields are required</div>

          <form onSubmit={onSubmit} className="panel-form">
            <div className="grid-2">
              <div className="field">
                <label>First name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="e.g., Sarah"
                  autoComplete="given-name"
                />
              </div>

              <div className="field">
                <label>Last name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="e.g., Martin"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Age</label>
                <input
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="e.g., 35"
                  inputMode="numeric"
                />
              </div>

              <div className="field">
                <label>Years of experience</label>
                <input
                  value={form.experienceYears}
                  onChange={(e) => update("experienceYears", e.target.value)}
                  placeholder="e.g., 8"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Expertise type</label>
                <select
                  value={form.expertiseType}
                  onChange={(e) => update("expertiseType", e.target.value)}
                >
                  {expertiseOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Specialty</label>
                <select
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                >
                  {specialtyOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="consent-row">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(e) => update("consentAccepted", e.target.checked)}
              />
              <span>I accept to participate voluntarily (consent).</span>
            </label>

            {err && <div className="error-box">❌ {err}</div>}

            <button className="submit-btn" disabled={loading}>
              {loading ? "Saving…" : "Continue"}
            </button>

            <div className="mini-note">
              Next: Vision test (Ishihara + contrast)
            </div>
          </form>
        </aside>
      </main>

      <footer className="form-footer">
        CT Image Evaluation Platform – Public observer access
      </footer>
    </div>
  );
}
