import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PublicObserverForm.css";
import bgImage from "../../assets/medical-bg.png";
import { API_BASE_URL } from "../../config";

export default function PublicObserverForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",

    // ✅ ANONYMOUS profile fields
    visionStatus: "PREFER_NOT_TO_SAY",
    fatigueLevel: "MEDIUM",

    expertiseType: "RADIOLOGY", // RADIOLOGY | IMAGE_QUALITY | OTHER
    specialty: "CHEST", // used only if expertiseType === RADIOLOGY
    experienceYears: "", // optional numeric
    otherExpertise: "", // used only if expertiseType === OTHER

    consentAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  const visionOptions = useMemo(
    () => [
      { value: "NORMAL", label: "Normal vision" },
      {
        value: "REFRACTIVE_CORRECTED",
        label: "Refractive error (corrected: glasses/contacts)",
      },
      {
        value: "REFRACTIVE_UNCORRECTED",
        label: "Refractive error (uncorrected)",
      },
      {
        value: "COLOR_VISION_DEFICIENCY",
        label: "Color vision deficiency",
      },
      { value: "OTHER", label: "Other" },
      { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
    ],
    [],
  );

  const fatigueOptions = useMemo(
    () => [
      { value: "LOW", label: "Low" },
      { value: "MEDIUM", label: "Medium" },
      { value: "HIGH", label: "High" },
    ],
    [],
  );

  const expertiseOptions = useMemo(
    () => [
      { value: "RADIOLOGY", label: "Radiology expert" },
      { value: "IMAGE_QUALITY", label: "Medical imaging quality expert" },
      { value: "OTHER", label: "Other" },
    ],
    [],
  );

  const specialtyOptions = useMemo(
    () => [
      "CHEST",
      "ABDOMINAL",
      "MSK",
      "EMERGENCY",
      "ONCOLOGY",
      "PEDIATRIC",
      "NEURORADIOLOGY",
      "OTHER",
    ],
    [],
  );

  function validate() {
    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 120) {
      return "Age must be a valid number (18–120).";
    }

    if (!form.visionStatus) return "Vision state is required.";
    if (!form.fatigueLevel) return "Fatigue level is required.";
    if (!form.expertiseType) return "Expertise is required.";

    // If expertiseType is RADIOLOGY -> specialty required
    if (form.expertiseType === "RADIOLOGY") {
      if (!form.specialty) return "Specialty is required for radiology expert.";
    }

    // If expertiseType is OTHER -> otherExpertise required
    if (form.expertiseType === "OTHER") {
      if (!form.otherExpertise.trim())
        return "Please specify your expertise/status.";
    }

    // experienceYears is optional BUT if filled -> must be valid
    if (form.experienceYears !== "" && form.experienceYears != null) {
      const years = Number(form.experienceYears);
      if (!Number.isFinite(years) || years < 0 || years > 80) {
        return "Years of experience must be a valid number (0–80).";
      }
    }

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
        age: Number(form.age),

        // ✅ enums (MUST match backend/prisma enums exactly)
        visionStatus: form.visionStatus,
        fatigueLevel: form.fatigueLevel,

        expertiseType: form.expertiseType,
        specialty:
          form.expertiseType === "RADIOLOGY" ? form.specialty : undefined,

        experienceYears:
          form.experienceYears === "" ? null : Number(form.experienceYears),

        otherExpertise:
          form.expertiseType === "OTHER"
            ? form.otherExpertise.trim()
            : undefined,

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
      if (!res.ok) {
        // show server message
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = JSON.parse(text);

      localStorage.setItem("sessionId", json.sessionId);
      localStorage.setItem("publicToken", token);

      navigate(`/public/${token}/vision`);
    } catch (e2) {
      setErr(typeof e2?.message === "string" ? e2.message : "Server error");
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
            This profile is anonymous and helps interpret results. No vision
            score will be displayed.
          </p>

          <div className="info-card">
            <div className="card-title">Privacy</div>
            <p className="card-text">
              Answers are stored for research purposes only. You may choose
              “Prefer not to say”.
            </p>
          </div>
        </section>

        <aside className="form-right">
          <div className="panel-title">Profile form</div>
          <div className="panel-sub">
            All fields are required unless marked optional
          </div>

          <form onSubmit={onSubmit} className="panel-form">
            <div className="field">
              <label>Age</label>
              <input
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="e.g., 35"
                inputMode="numeric"
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Vision state</label>
                <select
                  value={form.visionStatus}
                  onChange={(e) => update("visionStatus", e.target.value)}
                >
                  {visionOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Fatigue level</label>
                <select
                  value={form.fatigueLevel}
                  onChange={(e) => update("fatigueLevel", e.target.value)}
                >
                  {fatigueOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Expertise</label>
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

              {form.expertiseType === "RADIOLOGY" ? (
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
              ) : (
                <div className="field">
                  <label>Specialty</label>
                  <input value="—" disabled style={{ opacity: 0.7 }} readOnly />
                </div>
              )}
            </div>

            {form.expertiseType === "OTHER" && (
              <div className="field">
                <label>Please specify</label>
                <input
                  value={form.otherExpertise}
                  onChange={(e) => update("otherExpertise", e.target.value)}
                  placeholder="e.g., student, engineer..."
                />
              </div>
            )}

            <div className="field">
              <label>Years of experience (optional)</label>
              <input
                value={form.experienceYears}
                onChange={(e) => update("experienceYears", e.target.value)}
                placeholder="e.g., 5"
                inputMode="numeric"
              />
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
