require("dotenv").config();

const crypto = require("crypto");
const prisma = require("../src/db/prisma");

async function main() {
  const studyId = process.argv[2];

  if (!studyId) {
    console.error("❌ Usage:");
    console.error("node scripts/create-invite.js <studyId>");
    process.exit(1);
  }

  // ✅ chercher EXACTEMENT le study demandé
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: { protocol: true },
  });

  if (!study) {
    console.error("❌ Study not found");
    process.exit(1);
  }

  // ✅ génération token propre
  const token = crypto.randomBytes(24).toString("hex");

  const invite = await prisma.studyInvitation.create({
    data: {
      token,
      studyId: study.id,
    },
  });

  console.log("✅ TOKEN:", invite.token);
  console.log("✅ Study:", study.id, "-", study.name);
  console.log("✅ Mode:", study.protocol.mode);

  console.log("\n🔗 LINKS:");
  console.log(
    `Pairwise: http://localhost:5173/public/${invite.token}/pairwise`,
  );
  console.log(`Rating:   http://localhost:5173/public/${invite.token}/rating`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
