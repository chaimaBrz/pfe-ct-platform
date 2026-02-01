const prisma = require("../db/prisma");

exports.create = async (req, res) => {
  try {
    const { name, studyType, protocolId } = req.body;

    if (!name || !studyType || !protocolId) {
      return res.status(400).json({ error: "missing fields" });
    }

    const proto = await prisma.protocol.findUnique({
      where: { id: protocolId },
      select: { id: true },
    });

    if (!proto) {
      return res.status(400).json({ error: "protocolId does not exist" });
    }

    const study = await prisma.study.create({
      data: { name, studyType, protocolId },
    });

    return res.status(201).json(study);
  } catch (err) {
    if (err?.code === "P2003") {
      return res
        .status(400)
        .json({ error: "invalid protocolId (foreign key)" });
    }
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

exports.list = async (req, res) => {
  try {
    const items = await prisma.study.findMany({
      orderBy: { createdAt: "desc" },
      include: { protocol: true },
    });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
