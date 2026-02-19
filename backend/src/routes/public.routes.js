const express = require("express");
const prisma = require("../db/prisma");

const { createProxyMiddleware } = require("http-proxy-middleware");
const router = express.Router();

const ORTHANC_URL = process.env.ORTHANC_URL || "http://localhost:8042";
const ORTHANC_USER = process.env.ORTHANC_USER || "admin";
const ORTHANC_PASS = process.env.ORTHANC_PASS || "admin";

router.use(
  "/dicom-web",
  createProxyMiddleware({
    target: ORTHANC_URL,
    changeOrigin: true,

    // Express enlève "/dicom-web" => on remet avant d'envoyer à Orthanc
    pathRewrite: (path) =>
      path.startsWith("/dicom-web") ? path : `/dicom-web${path}`,

    // ✅ le plus robuste (au lieu de onProxyReq)
    auth: `${ORTHANC_USER}:${ORTHANC_PASS}`,

    // utile en debug
    logLevel: "debug",
  }),
);

router.use(
  "/wado",
  createProxyMiddleware({
    target: ORTHANC_URL,
    changeOrigin: true,
    pathRewrite: (path) => (path.startsWith("/wado") ? path : `/wado${path}`),
    onProxyReq: (proxyReq) => {
      const token = Buffer.from(`${ORTHANC_USER}:${ORTHANC_PASS}`).toString(
        "base64",
      );
      proxyReq.setHeader("Authorization", `Basic ${token}`);
    },
  }),
);

function orthancAuthHeader() {
  const token = Buffer.from(`${ORTHANC_USER}:${ORTHANC_PASS}`).toString(
    "base64",
  );
  return { Authorization: `Basic ${token}` };
}

/**
 * GET /public/dicom/rendered?studyUID=...&seriesUID=...&sopUID=...
 * -> renvoie une image (png/jpeg) rendue par Orthanc DICOMweb
 */
router.get("/dicom/rendered", async (req, res) => {
  try {
    const { studyUID, seriesUID, sopUID } = req.query;

    if (!studyUID || !seriesUID || !sopUID) {
      return res
        .status(400)
        .json({ message: "Missing studyUID/seriesUID/sopUID" });
    }

    const url =
      `${ORTHANC_URL}/dicom-web/studies/${encodeURIComponent(studyUID)}` +
      `/series/${encodeURIComponent(seriesUID)}` +
      `/instances/${encodeURIComponent(sopUID)}/rendered`;

    const r = await fetch(url, {
      headers: {
        ...orthancAuthHeader(),
        Accept: "image/png",
      },
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).send(t);
    }

    res.setHeader("Content-Type", r.headers.get("content-type") || "image/png");
    const buf = Buffer.from(await r.arrayBuffer());
    return res.send(buf);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /public/study/:token
 * - Vérifie token public
 * - Renvoie infos study + protocol
 */
router.get("/study/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await prisma.studyInvitation.findUnique({
      where: { token },
      include: { study: { include: { protocol: true } } },
    });

    if (!invite) return res.status(404).json({ message: "Invalid token" });
    if (invite.expiresAt && invite.expiresAt < new Date())
      return res.status(410).json({ message: "Token expired" });
    if (invite.maxUses != null && invite.usedCount >= invite.maxUses)
      return res.status(410).json({ message: "Token max uses reached" });

    return res.json({
      token: invite.token,
      study: {
        id: invite.study.id,
        name: invite.study.name,
        studyType: invite.study.studyType,
        status: invite.study.status,
        protocol: {
          id: invite.study.protocol.id,
          name: invite.study.protocol.name,
          mode: invite.study.protocol.mode,
        },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /public/session/start
 * Body:
 * {
 *   token,
 *   observer: {
 *     age,
 *     visionStatus,
 *     fatigueLevel,
 *     expertiseType,
 *     specialty?,          // si expertiseType === RADIOLOGY
 *     experienceYears?,    // optionnel
 *     otherExpertise?      // si expertiseType === OTHER
 *     consentAccepted
 *   }
 * }
 * -> { sessionId }
 */
// ✅ Remplace le handler de POST /public/session/start par celui-ci
router.post("/session/start", async (req, res) => {
  try {
    const body = req.body || {};
    const { token } = body;
    const observer = body.observer || {};

    const {
      age,
      visionStatus, // vient du front
      fatigueLevel,
      expertiseType,
      specialty,
      experienceYears,
      otherExpertise,
      consentAccepted,
    } = observer;

    const expertiseTypeMap = {
      RADIOLOGY: "RADIOLOGY",
      IMAGE_QUALITY: "MEDICAL_IMAGING", // front envoie IMAGE_QUALITY
      MEDICAL_IMAGING: "MEDICAL_IMAGING", // au cas où
      OTHER: "OTHER",
    };

    const mappedExpertiseType = expertiseTypeMap[expertiseType] || "OTHER";
    // 1) validations
    const parsedAge = Number(String(age ?? "").trim());
    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ message: "Invalid age" });
    }
    if (!consentAccepted) {
      return res.status(400).json({ message: "Consent required" });
    }
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    // 2) vérifier token invitation
    const invite = await prisma.studyInvitation.findUnique({
      where: { token },
      include: { study: true },
    });

    if (!invite) return res.status(404).json({ message: "Invalid token" });
    if (invite.expiresAt && invite.expiresAt < new Date())
      return res.status(410).json({ message: "Token expired" });
    if (invite.maxUses != null && invite.usedCount >= invite.maxUses)
      return res.status(410).json({ message: "Token max uses reached" });

    // 3) mapping visionStatus (front) -> valeurs sûres en DB
    let mappedVisionStatus = "OTHER";
    let visionStatusOther = null;

    switch (visionStatus) {
      case "NORMAL":
        mappedVisionStatus = "NORMAL";
        break;

      case "COLOR_VISION_DEFICIENCY":
        mappedVisionStatus = "COLOR_VISION_DEFICIENCY";
        break;

      case "REFRACTIVE_CORRECTED":
      case "REFRACTIVE_UNCORRECTED":
      case "REFRACTIVE_ERROR":
        mappedVisionStatus = "REFRACTIVE_ERROR";
        visionStatusOther = visionStatus;
        break;

      case "PREFER_NOT_TO_SAY":
        mappedVisionStatus = "OTHER";
        visionStatusOther = "PREFER_NOT_TO_SAY";
        break;

      case "OTHER":
      default:
        mappedVisionStatus = "OTHER";
        visionStatusOther = visionStatus ? String(visionStatus) : null;
        break;
    }

    // 4) transaction
    const result = await prisma.$transaction(async (tx) => {
      const observerProfile = await tx.observerProfile.create({
        data: {
          age: parsedAge,
          visionStatus: mappedVisionStatus,
          visionOtherText: visionStatusOther, // ✅ le bon champ Prisma
          consentAccepted: true,
          expertiseType: mappedExpertiseType,
        },
      });

      const session = await tx.session.create({
        data: {
          studyId: invite.studyId,
          invitationId: invite.id,
          observerId: observerProfile.id,
          displayProfileJson: {
            age: parsedAge,
            visionStatus,
            fatigueLevel,
            expertiseType,
            specialty,
            experienceYears,
            otherExpertise,
            consentAccepted: true,
          },
        },
      });

      await tx.studyInvitation.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });

      return session;
    });

    return res.status(200).json({ sessionId: result.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
/**
 * POST /public/session/:sessionId/vision
 * - NE BLOQUE PAS (même FAIL on continue)
 */
router.post("/session/:sessionId/vision", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { ishiharaScore, ishiharaTotal, contrastScore, status, details } =
      req.body || {};

    if (
      ishiharaScore == null ||
      ishiharaTotal == null ||
      contrastScore == null
    ) {
      return res.status(400).json({ message: "Missing vision fields" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const ratio =
      Number(ishiharaTotal) > 0
        ? Number(ishiharaScore) / Number(ishiharaTotal)
        : 0;

    const computedStatus = status ? status : ratio >= 0.85 ? "PASS" : "FAIL";

    const row = await prisma.visionTestResult.create({
      data: {
        sessionId,
        ishiharaScore: Number(ishiharaScore),
        ishiharaTotal: Number(ishiharaTotal),
        contrastScore: Number(contrastScore),
        status: computedStatus,
        details: details ?? null,
      },
    });

    return res.json({ ok: true, visionTestId: row.id, status: row.status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /public/session/:sessionId/pairwise/next
 */
router.get("/session/:sessionId/pairwise/next", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const rows = await prisma.studyImage.findMany({
      where: {
        studyId: session.studyId,
        image: {
          format: "DICOM",
          studyInstanceUID: { not: null },
          seriesInstanceUID: { not: null },
          sopInstanceUID: { not: null },
        },
      },
      include: { image: true },
    });

    const images = rows.map((r) => r.image);

    if (images.length < 2) {
      return res.status(400).json({ message: "Not enough DICOM-ready images" });
    }

    const bySeries = new Map();
    for (const img of images) {
      const key = img.seriesInstanceUID;
      if (!bySeries.has(key)) bySeries.set(key, []);
      bySeries.get(key).push(img);
    }

    const eligibleSeries = [...bySeries.entries()].filter(
      ([, arr]) => arr.length >= 2,
    );
    if (eligibleSeries.length === 0) {
      return res
        .status(400)
        .json({ message: "No series has at least 2 instances" });
    }

    const [seriesUID, seriesImgs] =
      eligibleSeries[Math.floor(Math.random() * eligibleSeries.length)];

    const left = seriesImgs[Math.floor(Math.random() * seriesImgs.length)];
    let right = seriesImgs[Math.floor(Math.random() * seriesImgs.length)];
    while (right.id === left.id) {
      right = seriesImgs[Math.floor(Math.random() * seriesImgs.length)];
    }

    const task = await prisma.pairwiseTask.create({
      data: {
        studyId: session.studyId,
        leftImageId: left.id,
        rightImageId: right.id,
        randomSeed: String(Date.now()),
      },
      include: { leftImage: true, rightImage: true },
    });

    return res.json({
      taskId: task.id,
      dicomWeb: {
        baseUrl:
          process.env.ORTHANC_DICOMWEB_BASEURL ||
          "http://localhost:4000/public/dicom-web",
      },
      seriesContext: {
        seriesInstanceUID: seriesUID,
        studyInstanceUID: left.studyInstanceUID,
      },
      left: {
        id: task.leftImage.id,
        studyInstanceUID: task.leftImage.studyInstanceUID,
        seriesInstanceUID: task.leftImage.seriesInstanceUID,
        sopInstanceUID: task.leftImage.sopInstanceUID,
      },
      right: {
        id: task.rightImage.id,
        studyInstanceUID: task.rightImage.studyInstanceUID,
        seriesInstanceUID: task.rightImage.seriesInstanceUID,
        sopInstanceUID: task.rightImage.sopInstanceUID,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /public/session/:sessionId/series/:seriesUID/instances
router.get(
  "/session/:sessionId/series/:seriesUID/instances",
  async (req, res) => {
    try {
      const { sessionId, seriesUID } = req.params;

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });
      if (!session)
        return res.status(404).json({ message: "Session not found" });

      const rows = await prisma.studyImage.findMany({
        where: {
          studyId: session.studyId,
          image: {
            format: "DICOM",
            seriesInstanceUID: seriesUID,
            sopInstanceUID: { not: null },
          },
        },
        include: { image: true },
      });

      const instances = rows
        .map((r) => {
          const img = r.image;
          const meta = img.metadataJson || {};
          const instanceNumber =
            meta.InstanceNumber ?? meta["InstanceNumber"] ?? null;

          return {
            sopInstanceUID: img.sopInstanceUID,
            instanceNumber:
              instanceNumber != null ? String(instanceNumber) : null,
          };
        })
        .filter((x) => !!x.sopInstanceUID);

      instances.sort((a, b) => {
        const ai =
          a.instanceNumber != null
            ? parseInt(a.instanceNumber, 10)
            : Number.POSITIVE_INFINITY;
        const bi =
          b.instanceNumber != null
            ? parseInt(b.instanceNumber, 10)
            : Number.POSITIVE_INFINITY;
        return ai - bi;
      });

      return res.json({
        dicomWeb: {
          baseUrl:
            process.env.ORTHANC_DICOMWEB_BASEURL ||
            "http://localhost:4000/public/dicom-web",
        },
        seriesInstanceUID: seriesUID,
        instances,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  },
);

/**
 * POST /public/session/:sessionId/pairwise/answer
 */
router.post("/session/:sessionId/pairwise/answer", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { taskId, choice, responseTimeMs } = req.body || {};

    if (!taskId || !choice) {
      return res.status(400).json({ message: "Missing taskId/choice" });
    }

    const row = await prisma.pairwiseEvaluation.create({
      data: {
        sessionId,
        taskId,
        choice,
        responseTimeMs: responseTimeMs ?? null,
      },
    });

    return res.json({ ok: true, evaluationId: row.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
