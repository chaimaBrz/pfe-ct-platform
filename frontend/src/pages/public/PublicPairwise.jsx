import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config";
import "./PublicPairwise.css";
import bgImage from "../../assets/medical-bg.png";
import MPRViewer from "../../components/MPRViewer";

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

  // ✅ MPR custom (ton composant)
  const [mprMode, setMprMode] = useState(false);

  // ✅ OHIF modal (same page)
  const [showOhif, setShowOhif] = useState(false);
  const [ohifSide, setOhifSide] = useState("left"); // "left" | "right"

  const startRef = useRef(Date.now());

  function buildOhifUrl(img) {
    if (!img?.studyInstanceUID) return "";
    const base = "http://localhost:3000"; // ✅ ton OHIF est sur 3000
    const ds = "ORTHANC_VIA_BACKEND"; // ✅ doit matcher default.js

    const params = new URLSearchParams({
      StudyInstanceUIDs: img.studyInstanceUID,
      ...(img.seriesInstanceUID
        ? { SeriesInstanceUIDs: img.seriesInstanceUID }
        : {}),
      dataSources: ds,
    });

    return `${base}/viewer?${params.toString()}`;
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

  // --------- UI states ----------
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

  const ohifImg = ohifSide === "left" ? left : right;
  const ohifUrl = buildOhifUrl(ohifImg);

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
            quality.
          </p>

          {error && <div className="pairwise-error">{error}</div>}

          <div className="pairwise-meta">
            Task ID: <code>{taskId || "—"}</code>
          </div>
        </section>

        <section className="pairwise-right">
          <div className="pairwise-card">
            {/* Pairwise images OR your custom MPR */}
            {mprMode ? (
              <div>
                <div style={{ marginBottom: 10, fontWeight: 600 }}>
                  MPR Viewer (Axial / Sagittal / Coronal)
                </div>
                <MPRViewer
                  apiBaseUrl={API_BASE_URL}
                  sessionId={sessionId}
                  studyInstanceUID={left?.studyInstanceUID}
                  seriesInstanceUID={left?.seriesInstanceUID}
                />
              </div>
            ) : (
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
            )}

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
                onClick={() => setMprMode((v) => !v)}
                title="Open your custom MPR viewer in the same page"
              >
                {mprMode ? "Back to Pairwise" : "View ITK-SNAP (MPR custom)"}
              </button>

              {/* ✅ OHIF DETAIL LEFT/RIGHT in same page */}
              <button
                className="btn btnSoft"
                disabled={!left?.studyInstanceUID}
                onClick={() => {
                  setOhifSide("left");
                  setShowOhif(true);
                }}
                title="Open LEFT series in OHIF (same page)"
              >
                Detail Left (OHIF)
              </button>

              <button
                className="btn btnSoft"
                disabled={!right?.studyInstanceUID}
                onClick={() => {
                  setOhifSide("right");
                  setShowOhif(true);
                }}
                title="Open RIGHT series in OHIF (same page)"
              >
                Detail Right (OHIF)
              </button>
            </div>

            {loading && <div className="pairwise-loading">Loading…</div>}
          </div>
        </section>
      </main>

      <footer className="pairwise-footer">
        CT Image Evaluation Platform – Public observer access
      </footer>

      {/* ✅ MODAL OHIF (same page) */}
      {showOhif && (
        <div className="ohif-modal">
          <div className="ohif-modal-header">
            <div>OHIF Viewer — {ohifSide.toUpperCase()}</div>
            <button className="btn btnSoft" onClick={() => setShowOhif(false)}>
              Close
            </button>
          </div>

          {!ohifUrl ? (
            <div className="ohif-empty">No series selected.</div>
          ) : (
            <iframe
              title="ohif"
              className="ohif-iframe"
              src={ohifUrl}
              allow="fullscreen"
            />
          )}
        </div>
      )}
    </div>
  );
}
