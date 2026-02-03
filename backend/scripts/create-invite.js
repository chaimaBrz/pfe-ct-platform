require("dotenv").config();
const crypto = require("crypto");
const prisma = require("../src/db/prisma");

(async () => {
  const study = await prisma.study.findFirst();
  if (!study) {
    console.log("❌ Aucune Study trouvée. Lance bootstrap-dev.js d'abord.");
    process.exit(1);
  }

  const token = crypto.randomBytes(24).toString("hex");

  const inv = await prisma.studyInvitation.create({
    data: { token, studyId: study.id },
  });

  console.log("✅ TOKEN:", inv.token);
  console.log("✅ Study:", study.id, study.name);

  await prisma.$disconnect();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  try {
    await prisma.$disconnect();
  } catch (_) {}
  process.exit(1);
});
