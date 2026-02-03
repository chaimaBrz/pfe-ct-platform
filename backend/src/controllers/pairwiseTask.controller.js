const prisma = require("../db/prisma");

/**
 * POST /pairwise/tasks/generate   (admin)
 * Body:
 * {
 *   "studyId": "...",
 *   "strategy": "adjacent" | "all_pairs",
 *   "limitImages": 50,
 *   "maxTasks": 200
 * }
 */
exports.generate = async (req, res) => {
  const {
    studyId,
    strategy = "adjacent",
    limitImages = 50,
    maxTasks = 200,
  } = req.body;

  if (!studyId) return res.status(400).json({ error: "studyId required" });

  const study = await prisma.study.findUnique({ where: { id: studyId } });
  if (!study) return res.status(404).json({ error: "study not found" });

  // On prend des images existantes (tu peux filtrer plus tard par dose/category/etc.)
  const images = await prisma.imageAsset.findMany({
    orderBy: { uploadedAt: "desc" },
    take: Number(limitImages) || 50,
    select: { id: true },
  });

  if (images.length < 2) {
    return res
      .status(400)
      .json({ error: "need at least 2 images to generate pairwise tasks" });
  }

  const ids = images.map((x) => x.id);

  // Fabrique la liste de paires
  const pairs = [];

  if (strategy === "all_pairs") {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        pairs.push([ids[i], ids[j]]);
        if (pairs.length >= Number(maxTasks)) break;
      }
      if (pairs.length >= Number(maxTasks)) break;
    }
  } else {
    // "adjacent" (simple, stable, moins de volume)
    for (let i = 0; i < ids.length - 1; i++) {
      pairs.push([ids[i], ids[i + 1]]);
      if (pairs.length >= Number(maxTasks)) break;
    }
  }

  // Re-génération propre: on supprime les anciennes tâches de cette étude
  const result = await prisma.$transaction(async (tx) => {
    const del = await tx.pairwiseTask.deleteMany({ where: { studyId } });

    const created = await tx.pairwiseTask.createMany({
      data: pairs.map(([leftImageId, rightImageId], idx) => ({
        studyId,
        leftImageId,
        rightImageId,
        randomSeed: `${Date.now()}-${idx}`,
      })),
    });

    return { deleted: del.count, created: created.count };
  });

  return res.status(201).json({
    studyId,
    strategy,
    imageCount: ids.length,
    taskCount: pairs.length,
    deletedOld: result.deleted,
    created: result.created,
  });
};

/**
 * GET /pairwise/tasks?studyId=...  (admin)
 */
exports.list = async (req, res) => {
  const { studyId } = req.query;
  if (!studyId) return res.status(400).json({ error: "studyId required" });

  const tasks = await prisma.pairwiseTask.findMany({
    where: { studyId: String(studyId) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return res.json(tasks);
};
