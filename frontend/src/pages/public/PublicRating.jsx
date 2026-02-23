import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config";
import "./PublicRating.css";
import bgImage from "../../assets/medical-bg.png";

function dicomRenderedUrl(img) {
  if (!img) return "";
  const q = new URLSearchParams({
    studyUID: img.studyInstanceUID,
    seriesUID: img.seriesInstanceUID,
    sopUID: img.sopInstanceUID,
  });
  return `${API_BASE_URL}/public/dicom/rendered?${q.toString()}`;
}

export default function PublicRating() {
  const sessionId = localStorage.getItem("sessionId") || "";
  const token = localStorage.getItem("publicToken") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskId, setTaskId] = useState("");
  const [image, setImage] = useState(null);
  const [done, setDone] = useState(false);

  const [score, setScore] = useState(3);
  const [comment, setComment] = useState("");

  const startRef = useRef(Date.now());

  async function loadNext() {
    setError("");
    setDone(false);

    if (!sessionId || !token) {
      setError(
        "Session missing. Please reopen the public link and start again.",
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/public/session/${sessionId}/rating/next`,
      );
      const text = await res.text();
      if (!res.ok) throw new Error(`Erreur (${res.status}) : ${text}`);

      const json = JSON.parse(text);

      if (json.done) {
        setDone(true);
        setTaskId("");
        setImage(null);
        return;
      }

      setTaskId(json.taskId);
      setImage(json.image);
      setScore(3);
      setComment("");
      startRef.current = Date.now();
    } catch (e) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setError("");

    if (!taskId) {
      setError("taskId missing. Click Reload.");
      return;
    }

    const responseTimeMs = Date.now() - startRef.current;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/public/session/${sessionId}/rating/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId,
            score: Number(score),
            comment: comment || null,
            responseTimeMs,
          }),
        },
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`Erreur (${res.status}) : ${text}`);

      await loadNext();
    } catch (e) {
      setError(e?.message || "Erreur");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rating-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="rating-overlay" />

      <header className="rating-header">
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
          <span className="badge">Rating</span>
        </div>
      </header>

      <main className="rating-content">
        <section className="rating-left">
          <h1 className="rating-title">
            Rate image quality <span>(Rating)</span>
          </h1>

          <p className="rating-desc">
            Rate the CT image quality from 1 (poor) to 5 (excellent).
          </p>

          {error && <div className="rating-error">{error}</div>}

          {done ? (
            <div className="rating-done">
              ✅ Study completed. Thank you!
              <button
                className="btn btnSoft"
                onClick={loadNext}
                style={{ marginTop: 12 }}
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              <div className="rating-meta">
                Task ID: <code>{taskId || "—"}</code>
              </div>

              <div className="rating-form">
                <label className="rating-label">Score (1–5)</label>
                <input
                  className="rating-range"
                  type="range"
                  min="1"
                  max="5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={loading}
                />
                <div className="rating-score">{score} / 5</div>

                <label className="rating-label">Comment (optional)</label>
                <textarea
                  className="rating-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a short comment…"
                  disabled={loading}
                />
              </div>

              <div className="rating-actions">
                <button
                  className="btn btnPrimary"
                  disabled={loading || !image}
                  onClick={submit}
                >
                  Submit
                </button>
                <button
                  className="btn btnSoft"
                  disabled={loading}
                  onClick={loadNext}
                >
                  Reload
                </button>
              </div>
            </>
          )}
        </section>

        <section className="rating-right">
          <div className="rating-viewerCard">
            {image ? (
              <img
                className="rating-img"
                src={dicomRenderedUrl(image)}
                alt="rating"
              />
            ) : (
              <div className="rating-imgEmpty">
                {loading ? "Loading…" : done ? "Completed" : "No image"}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="rating-footer">
        CT Image Evaluation Platform – Public observer access
      </footer>
    </div>
  );
}
