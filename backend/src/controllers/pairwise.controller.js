const prisma = require("../db/prisma");

// GET /pairwise/next?studyId=...
exports.next = async (req, res) => {
  const userId = req.auth.userId;
  const { studyId } = req.query;
  if (!studyId) return res.status(400).json({ error: "studyId required" });

  // session en cours de cet utilisateur pour cette étude
  const session = await prisma.session.findFirst({
    where: {
      studyId: String(studyId),
      userId,
      status: "IN_PROGRESS",
    },
    select: { id: true },
  });

  if (!session) {
    return res.status(400).json({
      error: "no active session for this study (start session first)",
    });
  }

  // tâche non encore évaluée dans cette session
  const task = await prisma.pairwiseTask.findFirst({
    where: {
      studyId: String(studyId),
      evaluations: {
        none: {
          sessionId: session.id,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!task) return res.json({ done: true });

  return res.json({ sessionId: session.id, task });
};

// POST /pairwise/answer
// Body: { taskId, choice, responseTimeMs }
exports.answer = async (req, res) => {
  const userId = req.auth.userId;
  const { taskId, choice, responseTimeMs } = req.body;

  if (!taskId || !choice) {
    return res.status(400).json({ error: "taskId and choice required" });
  }

  // récupérer la tâche pour connaître studyId
  const task = await prisma.pairwiseTask.findUnique({
    where: { id: String(taskId) },
    select: { id: true, studyId: true },
  });

  if (!task) return res.status(404).json({ error: "task not found" });

  // retrouver session active pour cette étude
  const session = await prisma.session.findFirst({
    where: {
      studyId: task.studyId,
      userId,
      status: "IN_PROGRESS",
    },
    select: { id: true },
  });

  if (!session) {
    return res.status(400).json({
      error: "no active session for this study (start session first)",
    });
  }

  // créer l’évaluation (unique sessionId+taskId empêche doublon)
  try {
    const saved = await prisma.pairwiseEvaluation.create({
      data: {
        sessionId: session.id,
        taskId: task.id,
        choice,
        responseTimeMs: Number.isFinite(Number(responseTimeMs))
          ? Number(responseTimeMs)
          : null,
      },
      select: { id: true, createdAt: true, choice: true },
    });

    return res.status(201).json({ sessionId: session.id, ...saved });
  } catch (e) {
    // si doublon => déjà répondu
    return res.status(409).json({ error: "already answered" });
  }
};
