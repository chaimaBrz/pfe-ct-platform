import { useEffect, useMemo, useRef, useState } from "react";

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
    // Score between 0 and 1
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

  // Keyboard support (optional but nice)
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
    <div style={{ padding: 24, maxWidth: 780 }}>
      <h2 style={{ marginBottom: 6 }}>Contrast Sensitivity Test</h2>
      <p style={{ marginTop: 0 }}>
        Identify the orientation of the letter as quickly and accurately as
        possible.
      </p>

      <div style={{ marginTop: 8, marginBottom: 14 }}>
        <strong>Question {round}</strong> of <strong>{totalRounds}</strong>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: `rgb(${gray}, ${gray}, ${gray})`,
            transform: `rotate(${orientation}deg)`,
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          {letter}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ORIENTATIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => answer(o.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p style={{ marginTop: 14, color: "#666" }}>
        The letter, rotation and contrast level change randomly each time.
      </p>
    </div>
  );
}
