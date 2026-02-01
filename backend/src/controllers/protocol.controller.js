const prisma = require("../db/prisma");

exports.create = async (req, res) => {
  const { name, studyType, mode, parametersJson } = req.body;

  if (!name || !studyType || !mode) {
    return res.status(400).json({ error: "missing fields" });
  }

  const protocol = await prisma.protocol.create({
    data: { name, studyType, mode, parametersJson: parametersJson ?? null },
  });

  return res.status(201).json(protocol);
};

exports.list = async (req, res) => {
  const items = await prisma.protocol.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(items);
};
