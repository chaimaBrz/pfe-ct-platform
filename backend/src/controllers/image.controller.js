const prisma = require("../db/prisma");
const axios = require("axios");

/* ===============================
   UPLOAD IMAGES TO ORTHANC
================================ */

exports.uploadImages = async (req, res) => {
  try {
    const files = req.files;
    const studyId = req.body.studyId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!studyId) {
      return res.status(400).json({ error: "Missing studyId" });
    }

    const createdAssets = [];

    for (const file of files) {
      const upload = await axios.post(
        "http://localhost:8042/instances",
        file.buffer,
        {
          headers: {
            "Content-Type": "application/dicom",
          },
          auth: {
            username: "admin",
            password: "admin",
          },
        },
      );

      console.log("ORTHANC RESPONSE:", upload.data);

      const orthancId = upload.data.ID;

      if (!orthancId) {
        throw new Error("Orthanc did not return instance ID");
      }

      const meta = await axios.get(
        `http://localhost:8042/instances/${orthancId}/simplified-tags`,
        {
          auth: {
            username: "admin",
            password: "admin",
          },
        },
      );

      const tags = meta.data;

      const asset = await prisma.imageAsset.create({
        data: {
          label: file.originalname,
          format: "DICOM",
          uri: orthancId,
          studyInstanceUID: tags.StudyInstanceUID || null,
          seriesInstanceUID: tags.SeriesInstanceUID || null,
          sopInstanceUID: tags.SOPInstanceUID || null,
          metadataJson: tags,
        },
      });

      await prisma.studyImage.create({
        data: {
          studyId: studyId,
          imageId: asset.id,
        },
      });

      createdAssets.push(asset);
    }

    return res.json({
      message: "Images uploaded",
      images: createdAssets,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return res.status(500).json({
      error: "Upload failed",
    });
  }
};

/* ===============================
   CREATE IMAGE (NOT USED)
================================ */

exports.create = async (req, res) => {
  res.json({ ok: true });
};

/* ===============================
   LIST IMAGES
================================ */

exports.list = async (req, res) => {
  const items = await prisma.imageAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(items);
};
