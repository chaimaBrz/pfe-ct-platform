import { useEffect, useMemo, useState } from "react";
import "./ContrastTest.css";

// Letters with a clear “opening” direction when rotated (best: C, E)
const LETTERS = ["C", "E"];

const ORIENTATIONS = [
  { label: "Up", value: 0, key: "ArrowUp", icon: "↑" },
  { label: "Right", value: 90, key: "ArrowRight", icon: "→" },
  { label: "Down", value: 180, key: "ArrowDown", icon: "↓" },
  { label: "Left", value: 270, key: "ArrowLeft", icon: "←" },
];

// Helpers
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// Weighted: more “hard” (very faint) than “easy”
function weightedLevel() {
  // 1 = most visible, 12 = least visible
  // Make faint levels much more frequent
  const bag = [
    12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 7, 7, 6, 6, 5,
    // rare easy ones
    4, 3, 2, 1,
  ];
  return pickRandom(bag);
}

// On white background: choose light gray most of the time.
// Avoid pure black. Rarely produce darker gray.
function levelToGray(level) {
  // level 12 => extremely faint (near white)
  // level 1  => still not pure black (dark gray)
  const faintMin = 210; // hard
  const faintMax = 245; // very hard (almost white)
  const easyMin = 80; // rare easier
  const easyMax = 140;

  // Most levels should map to faint grays
  if (level >= 7) {
    // Map 7..12 to 210..245
    const t = (level - 7) / (12 - 7);
    return Math.round(faintMin + t * (faintMax - faintMin));
  }

  // Rare easier levels map to darker gray (still not black)
  const t = (level - 1) / (6 - 1);
  return Math.round(easyMin + t * (easyMax - easyMin));
}

function randomFontSizePx() {
  const bag = [90, 110, 130, 150, 150, 180, 180, 210, 240];
  return pickRandom(bag);
}

function randomPosition() {
  // position in % inside the stimulus box
  // Keep away from edges to avoid cut-off.
  const x = Math.random() * 70 + 15; // 15%..85%
  const y = Math.random() * 60 + 20; // 20%..80%
  return { x, y };
}

export default function ContrastTest({ totalRounds = 16, onDone }) {
  const [step, setStep] = useState("CONSENT"); // CONSENT | TEST | DONE
  const [agree, setAgree] = useState(false);

  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);

  const [letter, setLetter] = useState(() => pickRandom(LETTERS));
  const [orientation, setOrientation] = useState(
    () => pickRandom(ORIENTATIONS).value,
  );
  const [level, setLevel] = useState(() => weightedLevel());

  const [pos, setPos] = useState(() => randomPosition());
  const [fontSize, setFontSize] = useState(() => randomFontSizePx());

  const [error, setError] = useState("");

  const gray = useMemo(() => levelToGray(level), [level]);

  function nextQuestion() {
    setLetter(pickRandom(LETTERS));
    setOrientation(pickRandom(ORIENTATIONS).value);
    setLevel(weightedLevel());
    setPos(randomPosition());
    setFontSize(randomFontSizePx());
  }

  function finishTest(nextCorrect) {
    const contrastScore = Number((nextCorrect / totalRounds).toFixed(4));
    onDone?.({ contrastScore });
    setStep("DONE");
  }

  function answer(userOrientation) {
    const isCorrect = userOrientation === orientation;
    const nextCorrect = isCorrect ? correct + 1 : correct;

    if (isCorrect) setCorrect(nextCorrect);

    if (round >= totalRounds) {
      finishTest(nextCorrect);
      return;
    }

    setRound((r) => r + 1);
    nextQuestion();
  }

  // Keyboard support (only during TEST)
  useEffect(() => {
    function onKeyDown(e) {
      if (step !== "TEST") return;
      const found = ORIENTATIONS.find((o) => o.key === e.key);
      if (found) answer(found.value);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, orientation, round, correct]);

  const start = () => {
    setError("");
    if (!agree) {
      setError("Please confirm your consent to start the contrast test.");
      return;
    }
    setStep("TEST");
  };

  return (
    <div className="ct-page">
      <div className="ct-wrap">
        <div className="ct-header">
          <h2 className="ct-title">Contrast Sensitivity Test</h2>
          <p className="ct-subtitle">
            We show a rotated letter that may be <b>very faint</b>. Your job is
            to choose the direction of its <b>opening</b>.
          </p>
        </div>

        {error && <div className="ct-alert">❌ {error}</div>}

        {step === "CONSENT" && (
          <div className="ct-card">
            <div className="ct-infoCard">
              <div className="ct-infoTitle">What is this test?</div>
              <p className="ct-infoText">
                This is a short screening to check how well you detect{" "}
                <b>low-contrast</b> shapes on a <b>white</b> background. Some
                letters will be almost invisible. <b>No score will be shown.</b>
              </p>

              <div className="ct-grid">
                <div>
                  <div className="ct-miniTitle">How to answer</div>
                  <ol className="ct-list">
                    <li>A letter like “C” or “E” will appear.</li>
                    <li>It can be rotated and placed anywhere in the box.</li>
                    <li>
                      Choose where the <b>opening</b> points:
                      <span className="ct-arrows"> ↑ → ↓ ←</span>
                    </li>
                    <li>Answer with your first impression.</li>
                  </ol>
                </div>

                <div>
                  <div className="ct-miniTitle">Recommended conditions</div>
                  <ul className="ct-list">
                    <li>Use a well-lit screen.</li>
                    <li>
                      Avoid strong color filters / night mode if possible.
                    </li>
                    <li>Do not zoom the page.</li>
                  </ul>
                </div>
              </div>

              <div className="ct-noteSmall">
                Tip: you can also use your keyboard arrow keys (↑ ↓ ← →).
              </div>
            </div>

            <div className="ct-consent">
              <div className="ct-consentTitle">Consent</div>
              <label className="ct-check">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>I voluntarily agree to take this contrast test.</span>
              </label>
            </div>

            <div className="ct-actionsRow">
              <button className="ct-btnPrimary" onClick={start}>
                Start Contrast Test
              </button>
            </div>
          </div>
        )}

        {step === "TEST" && (
          <div className="ct-card">
            <div className="ct-progress">
              <span className="ct-badge">
                Question {round} / {totalRounds}
              </span>
            </div>

            <div className="ct-stimulusBox" aria-label="contrast-stimulus">
              <div
                className="ct-letter"
                style={{
                  color: `rgb(${gray}, ${gray}, ${gray})`,
                  transform: `translate(-50%, -50%) rotate(${orientation}deg)`,
                  left: `${clamp(pos.x, 10, 90)}%`,
                  top: `${clamp(pos.y, 12, 88)}%`,
                  fontSize: `${fontSize}px`,
                }}
              >
                {letter}
              </div>
            </div>

            <div className="ct-actions">
              {ORIENTATIONS.map((o) => (
                <button
                  key={o.value}
                  className="ct-btn"
                  onClick={() => answer(o.value)}
                  title={`Arrow key: ${o.key}`}
                >
                  <span className="ct-btnIcon">{o.icon}</span>
                  {o.label}
                </button>
              ))}
            </div>

            <div className="ct-foot">
              The letter position, size, rotation and contrast change each time.
            </div>
          </div>
        )}

        {step === "DONE" && (
          <div className="ct-card">
            <div className="ct-done">✅ Test completed.</div>
            <div className="ct-doneSub">
              Thank you. Your result has been saved.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
