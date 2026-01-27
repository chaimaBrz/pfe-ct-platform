const prisma = require("../db/prisma");
const bcrypt = require("bcrypt");

async function createUser(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password, role requis" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (err) {
    // Email déjà existant
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createUser, getUsers };
