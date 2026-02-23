const path = require("path");
const dotenv = require("dotenv");

// ✅ charge backend/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL manquant dans backend/.env");
  process.exit(1);
}

// ✅ pool Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Prisma adapter
const adapter = new PrismaPg(pool);

// ✅ Prisma Client (Prisma v7 exige des options)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
