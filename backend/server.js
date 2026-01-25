require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health
app.get("/health", async (req, res) => {
  const count = await prisma.user.count();
  res.json({ status: "ok", users: count });
});

// ✅ Créer un utilisateur
app.post("/users", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await prisma.user.create({
    data: { email, password, role },
  });
  res.json(user);
});

// ✅ Lister les utilisateurs
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
