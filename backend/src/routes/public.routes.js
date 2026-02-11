const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

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
 *   observer: { firstName, lastName, age?, expertiseType, specialty?, experienceYears?, consentAccepted }
 * }
 * -> { sessionId }
 */
router.post("/session/start", async (req, res) => {
  try {
    const { token, observer } = req.body || {};

    if (
      !token ||
      !observer?.firstName ||
      !observer?.lastName ||
      !observer?.expertiseType
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const invite = await prisma.studyInvitation.findUnique({
      where: { token },
    });

    if (!invite) return res.status(404).json({ message: "Invalid token" });
    if (invite.expiresAt && invite.expiresAt < new Date())
      return res.status(410).json({ message: "Token expired" });
    if (invite.maxUses != null && invite.usedCount >= invite.maxUses)
      return res.status(410).json({ message: "Token max uses reached" });

    const createdObserver = await prisma.observerProfile.create({
      data: {
        firstName: observer.firstName,
        lastName: observer.lastName,
        age: observer.age ?? null,
        expertiseType: observer.expertiseType, // "RADIOLOGY"|"IMAGE_QUALITY"|"OTHER"
        specialty: observer.specialty ?? null, // "CHEST"|...|"OTHER"
        experienceYears: observer.experienceYears ?? null,
        consentAccepted: !!observer.consentAccepted,
      },
    });

    const session = await prisma.session.create({
      data: {
        studyId: invite.studyId,
        observerId: createdObserver.id,
        invitationId: invite.id,
        displayProfileJson: observer,
      },
    });

    await prisma.studyInvitation.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return res.json({ sessionId: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
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
 * - Renvoie 2 images DICOM (UIDs) + baseUrl DICOMweb
 */
// GET /public/session/:sessionId/pairwise/next
router.get("/session/:sessionId/pairwise/next", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1) Récupérer toutes les images DICOM prêtes pour cette study
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

    // 2) Grouper par série
    const bySeries = new Map();
    for (const img of images) {
      const key = img.seriesInstanceUID;
      if (!bySeries.has(key)) bySeries.set(key, []);
      bySeries.get(key).push(img);
    }

    // Garder seulement les séries avec >= 2 images
    const eligibleSeries = [...bySeries.entries()].filter(
      ([, arr]) => arr.length >= 2,
    );
    if (eligibleSeries.length === 0) {
      return res
        .status(400)
        .json({ message: "No series has at least 2 instances" });
    }

    // 3) Choisir une série au hasard
    const [seriesUID, seriesImgs] =
      eligibleSeries[Math.floor(Math.random() * eligibleSeries.length)];

    // 4) Choisir 2 images différentes DANS cette série
    // 4) Choisir 2 images différentes DANS cette série
    const left = seriesImgs[Math.floor(Math.random() * seriesImgs.length)];
    let right = seriesImgs[Math.floor(Math.random() * seriesImgs.length)];
    while (right.id === left.id) {
      right = seriesImgs[Math.floor(Math.random() * seriesImgs.length)];
    }

    // 5) Créer la task
    const task = await prisma.pairwiseTask.create({
      data: {
        studyId: session.studyId,
        leftImageId: left.id,
        rightImageId: right.id,
        randomSeed: String(Date.now()),
      },
      include: { leftImage: true, rightImage: true },
    });

    // 6) Réponse viewer-friendly
    return res.json({
      taskId: task.id,
      dicomWeb: {
        baseUrl:
          process.env.ORTHANC_DICOMWEB_BASEURL ||
          "http://localhost:8042/dicom-web",
      },
      seriesContext: {
        seriesInstanceUID: seriesUID,
        studyInstanceUID: left.studyInstanceUID, // cohérent avec la série choisie
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

      // On ne renvoie que les images DICOM appartenant à la study de la session
      // et correspondant à la série demandée
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

          // essaie de lire InstanceNumber depuis metadataJson
          // (chez toi, tu stockes souvent MainDicomTags dedans)
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

      // Tri (si instanceNumber existe)
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
            "http://localhost:8042/dicom-web",
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
 * Body: { taskId, choice, responseTimeMs? }
 * choice: "LEFT_BETTER" | "RIGHT_BETTER" | "EQUAL"
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
