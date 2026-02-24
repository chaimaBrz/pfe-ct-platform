const express = require("express");
const crypto = require("crypto");
const prisma = require("../db/prisma");

const router = express.Router();

/**
 * POST /invitations
 * body: { studyId: string, maxUses?: number, expiresAt?: string }
 * -> retourne { id, token, studyId, maxUses, expiresAt }
 */
router.post("/", async (req, res) => {
  try {
    const { studyId, maxUses, expiresAt } = req.body || {};

    if (!studyId) return res.status(400).json({ message: "Missing studyId" });

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { protocol: true },
    });
    if (!study) return res.status(404).json({ message: "Study not found" });

    const token = crypto.randomBytes(24).toString("hex");

    const invite = await prisma.studyInvitation.create({
      data: {
        token,
        studyId,
        maxUses: maxUses != null ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return res.status(201).json(invite);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
