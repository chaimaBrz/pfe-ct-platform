import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "./PreValidation.css";

GlobalWorkerOptions.workerSrc = workerUrl;

const PDF_URL = "/ishihara/ishihara_REAL.pdf";
const START_PDF_PAGE = 3;

const ANSWER_KEY = [
  "12",
  "8",
  "6",
  "29",
  "57",
  "5",
  "3",
  "15",
  "74",
  "2",
  "6",
  "97",
  "45",
  "5",
  "7",
  "16",
  "73",
  "nothing",
  "nothing",
  "nothing",
  "nothing",
  "26",
  "42",
  "35",
];

export default function IshiharaFromPDF({ onDone }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const [step, setStep] = useState("CONSENT"); // CONSENT | TEST | DONE
  const [agree, setAgree] = useState(false);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(0);
  const [error, setError] = useState("");

  const total = ANSWER_KEY.length;

  // Load PDF once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const doc = await getDocument(PDF_URL).promise;
        if (!cancelled) setPdfDoc(doc);
      } catch (e) {
        console.error("LOAD ERROR:", e);
        if (!cancelled)
          setError(
            "Unable to load the test file. Please contact the administrator.",
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Render plate when index/step changes (auto-fit)
  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!pdfDoc || step !== "TEST") return;

      try {
        setLoading(true);
        setError("");

        const pageNumber = START_PDF_PAGE + index;
        if (pageNumber > pdfDoc.numPages) {
          setError("The test file is not compatible (missing pages).");
          setLoading(false);
          return;
        }

        const page = await pdfDoc.getPage(pageNumber);

        // container width -> scale
        await new Promise((r) => requestAnimationFrame(r));
        if (cancelled) return;

        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;

        const unscaled = page.getViewport({ scale: 1 });
        const padding = 24; // padding inside wrapper
        const availableWidth = Math.max(320, wrap.clientWidth - padding);

        const scale = Math.min(2.0, availableWidth / unscaled.width);
        const viewport = page.getViewport({ scale });

        const ctx = canvas.getContext("2d");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("RENDER ERROR:", e);
        if (!cancelled) {
          setError("Display error. Please refresh the page.");
          setLoading(false);
        }
      }
    };

    render();

    // re-render on resize (important)
    const onResize = () => render();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [pdfDoc, index, step]);

  const normalize = (v) => (v ?? "").toString().trim().toLowerCase();

  const startTest = () => {
    setError("");
    if (!agree) {
      setError("Please confirm your consent to start the test.");
      return;
    }
    setStep("TEST");
  };

  const next = () => {
    setError("");

    const user = normalize(input);
    const expected = normalize(ANSWER_KEY[index]);

    const userSaysNothing =
      user === "" || user === "nothing" || user === "none" || user === "no";
    const isCorrect =
      expected === "nothing" ? userSaysNothing : user === expected;

    const nextCorrect = isCorrect ? correct + 1 : correct;
    setInput("");

    if (index + 1 < total) {
      setCorrect(nextCorrect);
      setIndex((i) => i + 1);
      return;
    }

    localStorage.setItem(
      "ishihara_result",
      JSON.stringify({
        testedAt: new Date().toISOString(),
        score: nextCorrect,
        total,
        ratio: total ? Number((nextCorrect / total).toFixed(4)) : 0,
        consent: true,
      }),
    );

    setCorrect(nextCorrect);
    setStep("DONE");
    onDone?.({ ishiharaScore: nextCorrect, ishiharaTotal: total });
  };

  return (
    <>
      <div className="pv-header">
        <h2 className="pv-title">Ishihara Color Vision Test</h2>
        <p className="pv-subtitle">
          Please answer based on what you see.{" "}
          <span className="pv-muted">(No score will be displayed.)</span>
        </p>
      </div>

      {error && <div className="pv-alert">❌ {error}</div>}

      {step === "CONSENT" && (
        <div className="pv-section pv-center">
          <div className="pv-consentBox">
            <div className="pv-consentTitle">Consent</div>
            <div className="pv-consentText">
              Before starting, please confirm that you voluntarily agree to take
              this test.
            </div>

            <label className="pv-checkboxRow">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I voluntarily agree to take the Ishihara color vision test.
              </span>
            </label>
          </div>

          <div className="pv-actions pv-actions-center">
            <button className="pv-btn" onClick={startTest} disabled={!pdfDoc}>
              {pdfDoc ? "Start Test" : "Loading..."}
            </button>
          </div>
        </div>
      )}

      {step === "TEST" && (
        <div className="pv-section">
          <div className="pv-meta pv-meta-center">
            <span className="pv-badge">
              Plate {index + 1}/{total}
            </span>
          </div>

          {/* ✅ Image centrée + titre au-dessus */}
          <div ref={wrapRef} className="pv-plateArea">
            <canvas ref={canvasRef} className="pv-canvas" />

            {loading && (
              <div className="pv-loadingOverlay">
                <div className="pv-spinner" />
                <div>Loading plate…</div>
              </div>
            )}
          </div>

          <div className="pv-questionBlock">
            <div className="pv-questionTitle">What number do you see?</div>
            <div className="pv-hint">
              If you see nothing, leave it empty and press <b>Next</b>.
            </div>

            <div className="pv-inputRow">
              <input
                className="pv-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Type the number (or leave empty for "nothing")'
                onKeyDown={(e) => e.key === "Enter" && next()}
              />
              <button className="pv-btn" onClick={next} disabled={loading}>
                Next
              </button>
            </div>

            <div className="pv-footerNote">
              Your answers are saved discreetly.
            </div>
          </div>
        </div>
      )}

      {step === "DONE" && (
        <div className="pv-section">
          <div className="pv-success">✅ Test completed.</div>
          <div className="pv-muted" style={{ marginTop: 6 }}>
            Thank you. Your result has been saved.
          </div>
        </div>
      )}
    </>
  );
}
