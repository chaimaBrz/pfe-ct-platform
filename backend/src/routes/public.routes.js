const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

// GET /public/study/:token
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

// POST /public/session/start
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

    res.json({ sessionId: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /public/session/:sessionId/vision  (NE BLOQUE PAS)
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

    res.json({ ok: true, visionTestId: row.id, status: row.status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /public/session/:sessionId/pairwise/next
router.get("/session/:sessionId/pairwise/next", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const pool = await prisma.studyImage.findMany({
      where: { studyId: session.studyId },
      include: { image: true },
    });

    if (pool.length < 2)
      return res.status(400).json({ message: "Not enough images in pool" });

    const left = pool[Math.floor(Math.random() * pool.length)].image;
    let right = pool[Math.floor(Math.random() * pool.length)].image;
    while (right.id === left.id)
      right = pool[Math.floor(Math.random() * pool.length)].image;

    const task = await prisma.pairwiseTask.create({
      data: {
        studyId: session.studyId,
        leftImageId: left.id,
        rightImageId: right.id,
        randomSeed: String(Date.now()),
      },
      include: { leftImage: true, rightImage: true },
    });

    res.json({
      taskId: task.id,
      left: { id: task.leftImage.id, uri: task.leftImage.uri },
      right: { id: task.rightImage.id, uri: task.rightImage.uri },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /public/session/:sessionId/pairwise/answer  (EQUAL inclus)
router.post("/session/:sessionId/pairwise/answer", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { taskId, choice, responseTimeMs } = req.body || {};
    if (!taskId || !choice)
      return res.status(400).json({ message: "Missing taskId/choice" });

    const row = await prisma.pairwiseEvaluation.create({
      data: {
        sessionId,
        taskId,
        choice, // "LEFT_BETTER" | "RIGHT_BETTER" | "EQUAL"
        responseTimeMs: responseTimeMs ?? null,
      },
    });

    res.json({ ok: true, evaluationId: row.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
