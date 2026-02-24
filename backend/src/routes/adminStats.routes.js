const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const studies = await prisma.study.count();
    const sessions = await prisma.session.count();
    const invitations = await prisma.invitation.count();

    res.json({
      studies,
      sessions,
      evaluations: sessions, // SAFE DEMO ✅
      invitations,
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: "stats failed" });
  }
});

module.exports = router;
