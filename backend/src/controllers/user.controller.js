const prisma = require("../db/prisma");
const bcrypt = require("bcrypt");

// CREATE
exports.createUser = async (req, res) => {
  const { email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password_hash: hash, role },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
};

// READ ALL
exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
};

// READ ONE
exports.getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) return res.sendStatus(404);
  res.json(user);
};

// UPDATE
exports.updateUser = async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(user);
};

// DELETE
exports.deleteUser = async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.sendStatus(204);
};
