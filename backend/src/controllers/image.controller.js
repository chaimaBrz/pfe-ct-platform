const prisma = require("../db/prisma");
const axios = require("axios");
const FormData = require("form-data");

/* ✅ UPLOAD → ORTHANC */

exports.uploadImages = async (req, res) => {
  try {
    const files = req.files;

    if (!files?.length) {
      return res.status(400).json({ error: "No files received" });
    }

    const createdAssets = [];

    for (const file of files) {
      /* ✅ Send file → Orthanc */
      const response = await axios.post(
        "http://localhost:8042/instances",
        file.buffer,
        {
          headers: {
            "Content-Type": "application/dicom",
          },
        },
      );

      const orthancId = response.data.ID;

      /* ✅ Save reference → Prisma */
      const asset = await prisma.imageAsset.create({
        data: {
          filename: file.originalname,
          orthancId: orthancId,
          modality: "CT",
        },
      });

      createdAssets.push(asset);
    }

    res.json(createdAssets);
  } catch (e) {
    console.error("UPLOAD ERROR:", e.message);
    res.status(500).json({ error: "Orthanc upload failed" });
  }
};
/* ✅ CREATE IMAGE ASSET (manual) */
exports.create = async (req, res) => {
  return res.json({ ok: true });
};

/* ✅ LIST IMAGE ASSETS */
exports.list = async (req, res) => {
  const items = await prisma.imageAsset.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 50,
  });

  res.json(items);
};
