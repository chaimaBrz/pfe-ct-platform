require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ status: "ok", users: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

const bcrypt = require("bcrypt"); // en haut du fichier si pas encore

app.post("/users", async (req, res) => {
  const { email, password, role } = req.body;

  // 1) Hasher le mot de passe
  const hash = await bcrypt.hash(password, 10);

  // 2) Sauvegarder le hash (PAS le mot de passe brut)
  const user = await prisma.user.create({
    data: {
      email,
      password_hash: hash,
      role,
    },
  });

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
