require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../src/db/prisma");

(async () => {
  // ADMIN (continue à se connecter)
  const adminEmail = "admin@local.test";
  const adminPassword = "Admin123!";

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: { email: adminEmail, password_hash: hash, role: "ADMIN" },
    });
  }

  // Protocol + Study (minimum)
  let protocol = await prisma.protocol.findFirst({ where: { name: "Pairwise v1" } });
  if (!protocol) {
    protocol = await prisma.protocol.create({
      data: {
        name: "Pairwise v1",
        studyType: "QUALITY",
        mode: "PAIRWISE",
        parametersJson: { allowEqual: true },
      },
    });
  }

  let study = await prisma.study.findFirst({ where: { name: "Demo Study" } });
  if (!study) {
    study = await prisma.study.create({
      data: {
        name: "Demo Study",
        studyType: "QUALITY",
        status: "RUNNING",
        protocolId: protocol.id,
      },
    });
  }

  // Invitation token (public link)
  const token = crypto.randomBytes(24).toString("hex");
  const invite = await prisma.studyInvitation.create({
    data: { token, studyId: study.id },
  });

  // Images demo + pool study (pour tester pairwise)
  const img1 = await prisma.imageAsset.create({
    data: { label: "X1", uri: "/demo/x1.png", format: "PNG" },
  });
  const img2 = await prisma.imageAsset.create({
    data: { label: "X2", uri: "/demo/x2.png", format: "PNG" },
  });

  await prisma.studyImage.createMany({
    data: [
      { studyId: study.id, imageId: img1.id },
      { studyId: study.id, imageId: img2.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ ADMIN (login pour gérer la plateforme) :");
  console.log("   email:", adminEmail);
  console.log("   pass :", adminPassword);

  console.log("✅ TOKEN public (observateurs sans compte) :");
  console.log("   token:", invite.token);

  console.log("✅ Study:", study.id, study.name);

  await prisma.$disconnect();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch (_) {}
  process.exit(1);
});
