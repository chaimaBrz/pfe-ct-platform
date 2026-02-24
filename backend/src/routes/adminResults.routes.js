const express = require("express");
const prisma = require("../db/prisma");

const { authRequired } = require("../middlewares/authRequired");
const { adminRequired } = require("../middlewares/adminRequired");

const router = express.Router();

router.get(
  "/admin/studies/:studyId/results",
  authRequired, // ✅ maintenant vraie fonction
  adminRequired, // ✅ maintenant vraie fonction
  async (req, res) => {
    const { studyId } = req.params;

    try {
      const sessions = await prisma.session.findMany({
        where: { studyId },
        include: {
          invitation: true,
          evaluations: true,
          visionTests: true,
        },
        orderBy: { startedAt: "desc" },
      });

      const formatted = sessions.map((s) => {
        const ishihara = s.visionTests.find((v) => v.testType === "ISHIHARA");

        const contrast = s.visionTests.find((v) => v.testType === "CONTRAST");

        return {
          id: s.id,
          token: s.invitation?.token,
          startedAt: s.startedAt,
          evaluationsCount: s.evaluations.length,
          ishiharaScore: ishihara?.score ?? "-",
          contrastScore: contrast?.score ?? "-",
        };
      });

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "results fetch failed" });
    }
  },
);

module.exports = router;
