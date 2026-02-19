import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config";
import "./PublicPairwise.css";
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

export default function PublicPairwise() {
  const sessionId = localStorage.getItem("sessionId") || "";
  const token = localStorage.getItem("publicToken") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskId, setTaskId] = useState("");
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);

  const startRef = useRef(Date.now());

  // ✅ Ouvre OHIF avec la route correcte
  function openOhif(studyUID, seriesUID) {
    const base = "http://localhost:3001";
    const ds = "ORTHANC_VIA_BACKEND"; // DOIT matcher window.config.dataSources[].sourceName

    const params = new URLSearchParams({
      StudyInstanceUIDs: studyUID,
      ...(seriesUID ? { SeriesInstanceUIDs: seriesUID } : {}),
      dataSources: ds, // ✅ OHIF v3
    });

    window.open(`${base}/viewer?${params.toString()}`, "_blank");
  }
  async function loadNext() {
    setError("");

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
        `${API_BASE_URL}/public/session/${sessionId}/pairwise/next`,
      );
      const text = await res.text();
      if (!res.ok) throw new Error(`Erreur (${res.status}) : ${text}`);

      const json = JSON.parse(text);

      setTaskId(json.taskId);
      setLeft(json.left);
      setRight(json.right);
      startRef.current = Date.now();
    } catch (e) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function answer(choice) {
    setError("");

    if (!taskId) {
      setError("taskId missing. Click Reload.");
      return;
    }

    const responseTimeMs = Date.now() - startRef.current;

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/public/session/${sessionId}/pairwise/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, choice, responseTimeMs }),
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

  // ✅ 1) pas de session → message clair
  if (!sessionId || !token) {
    return (
      <div
        className="pairwise-page"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="pairwise-overlay" />

        <header className="pairwise-header">
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
            <span className="badge">Pairwise</span>
          </div>
        </header>

        <main className="pairwise-content">
          <section className="pairwise-left">
            <h1 className="pairwise-title">
              Image comparisons <span>(Pairwise)</span>
            </h1>
            <div className="pairwise-error">
              Session missing. Please reopen the public link and start the study
              again.
            </div>
          </section>

          <section className="pairwise-right">
            <div className="pairwise-card">
              <div className="pairwise-imgEmpty">Nothing to display.</div>
            </div>
          </section>
        </main>

        <footer className="pairwise-footer">
          CT Image Evaluation Platform – Public observer access
        </footer>
      </div>
    );
  }

  // ✅ 2) loading initial
  if (loading && !left && !right) {
    return (
      <div
        className="pairwise-page"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="pairwise-overlay" />

        <header className="pairwise-header">
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
            <span className="badge">Pairwise</span>
          </div>
        </header>

        <main className="pairwise-content">
          <section className="pairwise-left">
            <h1 className="pairwise-title">
              Image comparisons <span>(Pairwise)</span>
            </h1>
            <p className="pairwise-desc">Loading the next comparison…</p>
          </section>

          <section className="pairwise-right">
            <div className="pairwise-card">
              <div className="pairwise-imgEmpty">Loading…</div>
            </div>
          </section>
        </main>

        <footer className="pairwise-footer">
          CT Image Evaluation Platform – Public observer access
        </footer>
      </div>
    );
  }

  // ✅ 3) UI principale
  return (
    <div
      className="pairwise-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="pairwise-overlay" />

      <header className="pairwise-header">
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
          <span className="badge">Pairwise</span>
        </div>
      </header>

      <main className="pairwise-content">
        <section className="pairwise-left">
          <h1 className="pairwise-title">
            Image comparisons <span>(Pairwise)</span>
          </h1>

          <p className="pairwise-desc">
            Compare the two CT images and choose which one has better perceived
            quality. Use “Equal” only if they look comparable.
          </p>

          {error && <div className="pairwise-error">{error}</div>}

          <div className="pairwise-meta">
            Task ID: <code>{taskId || "—"}</code>
          </div>
        </section>

        <section className="pairwise-right">
          <div className="pairwise-card">
            <div className="pairwise-grid">
              <div className="pairwise-imgBlock">
                <div className="pairwise-imgLabel">Left</div>
                {left ? (
                  <img
                    className="pairwise-img"
                    src={dicomRenderedUrl(left)}
                    alt="left"
                  />
                ) : (
                  <div className="pairwise-imgEmpty">No image</div>
                )}
              </div>

              <div className="pairwise-imgBlock">
                <div className="pairwise-imgLabel">Right</div>
                {right ? (
                  <img
                    className="pairwise-img"
                    src={dicomRenderedUrl(right)}
                    alt="right"
                  />
                ) : (
                  <div className="pairwise-imgEmpty">No image</div>
                )}
              </div>
            </div>

            <div className="pairwise-actions">
              <button
                className="btn btnPrimary"
                disabled={loading}
                onClick={() => answer("LEFT_BETTER")}
              >
                Left better
              </button>

              <button
                className="btn btnGhost"
                disabled={loading}
                onClick={() => answer("EQUAL")}
              >
                Equal
              </button>

              <button
                className="btn btnPrimary"
                disabled={loading}
                onClick={() => answer("RIGHT_BETTER")}
              >
                Right better
              </button>

              <button
                className="btn btnSoft"
                disabled={loading}
                onClick={loadNext}
              >
                Reload
              </button>

              <button
                className="btn btnSoft"
                disabled={!left?.studyInstanceUID}
                onClick={() =>
                  openOhif(left?.studyInstanceUID, left?.seriesInstanceUID)
                }
                title="Open the selected series in OHIF"
              >
                Open in OHIF (detail)
              </button>
            </div>

            {loading && <div className="pairwise-loading">Loading…</div>}
          </div>
        </section>
      </main>

      <footer className="pairwise-footer">
        CT Image Evaluation Platform – Public observer access
      </footer>
    </div>
  );
}
