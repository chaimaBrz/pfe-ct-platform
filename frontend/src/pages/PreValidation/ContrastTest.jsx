import { useEffect, useMemo, useState } from "react";
import "./PreValidation.css";
import { buildContrastTrials, pickRandomPack } from "./contrastStimuli";

/**
 * ContrastTest (front-only)
 * - Randomly picks one "test pack" each new session
 * - Generates randomized trials
 * - Saves results discreetly (no score shown)
 */
export default function ContrastTest({ onDone }) {
  // ✅ Freeze the session pack + trials in localStorage to avoid changing on refresh
  const storageKey = "contrast_session_v1";

  const session = useMemo(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    const pack = pickRandomPack();
    const trials = buildContrastTrials(pack, 14);
    const fresh = {
      sessionId: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      pack,
      trials,
    };

    localStorage.setItem(storageKey, JSON.stringify(fresh));
    return fresh;
  }, []);

  const { pack, trials } = session;

  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const trial = trials[idx];

  // Optional: clear errors etc.
  useEffect(() => {
    // You can add per-trial timer here later
  }, [idx]);

  const choose = (choice) => {
    const ok = choice === trial.correct;
    const nextCorrect = ok ? correctCount + 1 : correctCount;

    if (ok) setCorrectCount(nextCorrect);

    // Next trial
    if (idx + 1 < trials.length) {
      setIdx((i) => i + 1);
      return;
    }

    // Finished -> save discreetly
    const ratio = nextCorrect / trials.length;

    const payload = {
      testedAt: new Date().toISOString(),
      sessionId: session.sessionId,
      packId: pack.id,
      packName: pack.name,
      correct: nextCorrect,
      total: trials.length,
      ratio: Number(ratio.toFixed(4)),
      trials: trials.map((t) => ({
        level: t.level,
        correct: t.correct,
        glyph: t.glyph,
      })),
    };

    localStorage.setItem("contrast_result", JSON.stringify(payload));
    localStorage.removeItem(storageKey); // ✅ remove so next time it's a new random test

    setSaving(true);
    try {
      onDone?.(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="pv-card pv-ish-card"
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <div className="pv-header">
        <h2 className="pv-title">Contrast Sensitivity Test</h2>
        <p className="pv-subtitle">
          Identify the opening direction: <b>Up / Right / Down / Left</b>.
          <span className="pv-muted"> (No score will be displayed.)</span>
        </p>
      </div>

      {/* ✅ We do NOT show technical details, but pack name is OK (optional).
          If you want totally hidden, delete the next line. */}
      <div className="pv-meta">
        <span className="pv-badge">Contrast</span>
        <span className="pv-badge">
          Trial {idx + 1}/{trials.length}
        </span>
        <span className="pv-badge">{pack.name}</span>
      </div>

      <div className="pv-plateArea" style={{ padding: 24 }}>
        <div className="pv-contrastBox">
          {pack.type === "landolt_c" ? (
            // ✅ Landolt C (C rotated) — letter C by design
            <div
              className="pv-landolt"
              style={{
                opacity: trial.level,
                transform: `rotate(${trial.correct * 90}deg)`,
              }}
              aria-label="Landolt C"
            >
              C
            </div>
          ) : (
            // ✅ Other packs: random glyph per trial (letters/digits/symbols)
            <div
              className="pv-landolt"
              style={{
                opacity: trial.level,
              }}
              aria-label="Contrast glyph"
            >
              {trial.glyph}
            </div>
          )}
        </div>
      </div>

      <div
        className="pv-actions"
        style={{ justifyContent: "center", marginTop: 14 }}
      >
        <button className="pv-btn" onClick={() => choose(0)} disabled={saving}>
          Up
        </button>
        <button className="pv-btn" onClick={() => choose(1)} disabled={saving}>
          Right
        </button>
        <button className="pv-btn" onClick={() => choose(2)} disabled={saving}>
          Down
        </button>
        <button className="pv-btn" onClick={() => choose(3)} disabled={saving}>
          Left
        </button>
      </div>

      <div className="pv-footerNote" style={{ textAlign: "center" }}>
        Please answer based on what you see. {saving ? "Saving..." : ""}
      </div>
    </div>
  );
}
