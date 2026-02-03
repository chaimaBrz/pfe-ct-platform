const prisma = require("../db/prisma");

// POST /images (admin)
exports.create = async (req, res) => {
  const {
    filename,
    storageUri,
    modality = "CT",
    doseLevel,
    category,
    width,
    height,
    meta,
  } = req.body;

  if (!filename || !storageUri) {
    return res.status(400).json({ error: "filename and storageUri required" });
  }

  const img = await prisma.imageAsset.create({
    data: {
      filename,
      storageUri,
      modality,
      doseLevel: doseLevel ?? null,
      category: category ?? null,
      width: Number.isFinite(Number(width)) ? Number(width) : null,
      height: Number.isFinite(Number(height)) ? Number(height) : null,
      meta: meta ?? null,
    },
  });

  return res.status(201).json(img);
};

// GET /images (admin)
exports.list = async (req, res) => {
  const items = await prisma.imageAsset.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 200,
  });
  return res.json(items);
};
