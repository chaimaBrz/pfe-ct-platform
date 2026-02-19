import { useEffect, useMemo, useRef, useState } from "react";
import "./ContrastTest.css";

// Non-ambiguous letters
const LETTERS = ["C", "E", "F", "L", "P", "T", "U", "V", "H"];

const ORIENTATIONS = [
  { label: "Up", value: 0 },
  { label: "Right", value: 90 },
  { label: "Down", value: 180 },
  { label: "Left", value: 270 },
];

// Helpers
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLevel(min = 1, max = 12) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// level 1 = very visible, level 12 = barely visible
function levelToGray(level) {
  const min = 35; // dark (easy)
  const max = 235; // light (hard)
  return Math.round(min + (level - 1) * ((max - min) / 11));
}

export default function ContrastTest({ totalRounds = 16, onDone }) {
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);

  const [letter, setLetter] = useState(() => pickRandom(LETTERS));
  const [orientation, setOrientation] = useState(
    () => pickRandom(ORIENTATIONS).value,
  );
  const [level, setLevel] = useState(() => randomLevel(1, 12));

  const bestLevelRef = useRef(1);

  const gray = useMemo(() => levelToGray(level), [level]);

  function nextQuestion() {
    setLetter(pickRandom(LETTERS)); // random letter
    setOrientation(pickRandom(ORIENTATIONS).value); // random orientation
    setLevel(randomLevel(1, 12)); // random contrast
  }

  function finishTest(nextCorrect) {
    const contrastScore = Number((nextCorrect / totalRounds).toFixed(4));
    onDone?.({ contrastScore });
  }

  function answer(userOrientation) {
    const isCorrect = userOrientation === orientation;
    const nextCorrect = isCorrect ? correct + 1 : correct;

    if (isCorrect) {
      setCorrect(nextCorrect);
      bestLevelRef.current = Math.max(bestLevelRef.current, level);
    }

    if (round >= totalRounds) {
      finishTest(nextCorrect);
      return;
    }

    setRound((r) => r + 1);
    nextQuestion();
  }

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowUp") answer(0);
      if (e.key === "ArrowRight") answer(90);
      if (e.key === "ArrowDown") answer(180);
      if (e.key === "ArrowLeft") answer(270);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, round, correct]);

  return (
    <div className="ct-contrast">
      <div className="ct-contrast-inner">
        <h2 className="ct-title">Contrast Sensitivity Test</h2>
        <p className="ct-desc">
          Identify the orientation of the letter as quickly and accurately as
          possible.
        </p>

        <div className="ct-progress">
          <strong>Question {round}</strong> of <strong>{totalRounds}</strong>
        </div>

        <div className="ct-card">
          <div className="ct-stimulus">
            <div
              className="ct-letter"
              style={{
                color: `rgb(${gray}, ${gray}, ${gray})`,
                transform: `rotate(${orientation}deg)`,
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
              >
                {o.label}
              </button>
            ))}
          </div>

          <p className="ct-note">
            The letter, rotation and contrast level change randomly each time.
          </p>
        </div>
      </div>
    </div>
  );
}
