const prisma = require("../db/prisma");

// Fallback safe si le fichier n'existe pas (ex: clone chez ta binôme)
let visionGate;
try {
  visionGate = require("../config/visionGate.json");
} catch {
  visionGate = {
    ishihara: {
      mode: "ratio",
      minRatio: 0.85,
      minCorrect: null,
      maxErrors: null,
    },
    contrast: { minScore: 0.5 },
  };
}

// Fonction utilitaire : calcule le seuil minimal de bonnes réponses Ishihara
function computeMinIshiharaCorrect(total) {
  const rule = visionGate.ishihara;
  const t = Number(total);

  if (!Number.isFinite(t) || t <= 0) return null;

  if (rule.mode === "ratio") {
    const r = Number(rule.minRatio);
    if (!Number.isFinite(r) || r <= 0 || r > 1) return Math.ceil(t * 0.85);
    return Math.ceil(t * r);
  }

  if (rule.mode === "minCorrect") {
    const mc = Number(rule.minCorrect);
    if (!Number.isFinite(mc) || mc < 0) return Math.ceil(t * 0.85);
    return mc;
  }

  if (rule.mode === "maxErrors") {
    const me = Number(rule.maxErrors);
    if (!Number.isFinite(me) || me < 0) return Math.ceil(t * 0.85);
    return Math.max(0, t - me);
  }

  // défaut sécurité
  return Math.ceil(t * 0.85);
}

// GET /vision/status
exports.getStatus = async (req, res) => {
  const userId = req.auth.userId;

  const last = await prisma.visionTestResult.findFirst({
    where: { userId },
    orderBy: { testedAt: "desc" },
    select: {
      status: true,
      ishiharaScore: true,
      ishiharaTotal: true,
      contrastScore: true,
      testedAt: true,
      details: true,
    },
  });

  if (!last) return res.json({ status: "PENDING" });
  return res.json(last);
};

// POST /vision/submit
exports.submit = async (req, res) => {
  const userId = req.auth.userId;
  const { ishiharaScore, ishiharaTotal, contrastScore, details } = req.body;

  const score = Number(ishiharaScore);
  const total = Number(ishiharaTotal);
  const cScore = Number(contrastScore);

  // Validation simple des types
  if (
    !Number.isFinite(score) ||
    !Number.isFinite(total) ||
    !Number.isFinite(cScore)
  ) {
    return res
      .status(400)
      .json({ error: "invalid payload (numbers required)" });
  }

  // Garde-fous : valeurs possibles
  if (total <= 0) {
    return res.status(400).json({ error: "ishiharaTotal must be > 0" });
  }
  if (score < 0 || score > total) {
    return res
      .status(400)
      .json({ error: "ishiharaScore must be between 0 and ishiharaTotal" });
  }
  if (cScore < 0) {
    return res.status(400).json({ error: "contrastScore must be >= 0" });
  }

  const minCorrect = computeMinIshiharaCorrect(total);
  if (minCorrect === null) {
    return res.status(400).json({ error: "ishiharaTotal must be > 0" });
  }

  const minContrast = Number(visionGate?.contrast?.minScore ?? 0.5);

  const ishPass = score >= minCorrect;
  const contrastPass = cScore >= minContrast;

  const status = ishPass && contrastPass ? "PASS" : "FAIL";

  const saved = await prisma.visionTestResult.create({
    data: {
      userId,
      ishiharaScore: score,
      ishiharaTotal: total,
      contrastScore: cScore,
      status,
      details: {
        ...(details ?? {}),
        gateApplied: {
          ishihara: {
            mode: visionGate?.ishihara?.mode ?? "ratio",
            minCorrect,
            minRatio: visionGate?.ishihara?.minRatio ?? null,
            maxErrors: visionGate?.ishihara?.maxErrors ?? null,
            minCorrectFixed: visionGate?.ishihara?.minCorrect ?? null,
          },
          contrast: {
            minScore: minContrast,
          },
        },
      },
    },
    select: {
      id: true,
      status: true,
      testedAt: true,
      ishiharaScore: true,
      ishiharaTotal: true,
      contrastScore: true,
      details: true,
    },
  });

  return res.status(201).json(saved);
};
