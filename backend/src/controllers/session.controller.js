const prisma = require("../db/prisma");

exports.start = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { studyId, displayProfileJson } = req.body;

    if (!studyId) {
      return res.status(400).json({ error: "studyId required" });
    }

    // Vérifier que la study existe
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { id: true, status: true },
    });

    if (!study) {
      return res.status(400).json({ error: "studyId does not exist" });
    }

    const session = await prisma.session.create({
      data: {
        studyId,
        userId,
        displayProfileJson: displayProfileJson ?? null,
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        studyId: true,
        userId: true,
      },
    });

    return res.status(201).json(session);
  } catch (err) {
    if (err?.code === "P2003") {
      return res.status(400).json({ error: "invalid studyId (foreign key)" });
    }
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
