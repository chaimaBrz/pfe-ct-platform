// Bank of contrast stimuli "packs"
// Each session picks ONE pack randomly -> different test each time

export const CONTRAST_PACKS = [
  {
    id: "landolt_c",
    name: "Landolt C",
    // C rotated to indicate gap direction
    type: "landolt_c",
  },
  {
    id: "letters_sloan",
    name: "Letters (Sloan-like)",
    type: "text",
    glyphs: ["C", "D", "E", "F", "H", "K", "N", "P", "R", "U", "V", "Z"],
  },
  {
    id: "digits",
    name: "Digits",
    type: "text",
    glyphs: ["2", "3", "4", "5", "6", "7", "8", "9"],
  },
  {
    id: "symbols",
    name: "Symbols",
    type: "text",
    glyphs: ["▲", "■", "●", "◆", "★", "⬟", "⬢"],
  },
];

// Difficulty levels (opacity): smaller = harder
export const CONTRAST_LEVELS = [0.08, 0.1, 0.12, 0.16, 0.22, 0.3, 0.4];

// Build trials for a given pack
export function buildContrastTrials(pack, count = 14) {
  const levels = CONTRAST_LEVELS;

  const trials = Array.from({ length: count }, (_, i) => {
    const level = levels[Math.min(levels.length - 1, Math.floor(i / 2))];
    const correct = Math.floor(Math.random() * 4); // 0..3 (up/right/down/left)

    // For text-based packs pick a random glyph each trial
    let glyph = null;
    if (pack.type === "text") {
      const arr = pack.glyphs || ["C"];
      glyph = arr[Math.floor(Math.random() * arr.length)];
    } else {
      // landolt_c uses the same "C" shape
      glyph = "C";
    }

    return { level, correct, glyph };
  });

  // Shuffle order
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trials[i], trials[j]] = [trials[j], trials[i]];
  }

  return trials;
}

// Choose a random pack
export function pickRandomPack() {
  return CONTRAST_PACKS[Math.floor(Math.random() * CONTRAST_PACKS.length)];
}
