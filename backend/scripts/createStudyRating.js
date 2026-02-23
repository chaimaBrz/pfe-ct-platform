import "dotenv/config";
import prisma from "../src/db/prisma.js";

async function main() {
  // ✅ récupère le protocole Rating
  const protocol = await prisma.protocol.findFirst({
    where: { mode: "RATING" },
    orderBy: { createdAt: "desc" },
  });

  if (!protocol) throw new Error("Aucun protocole RATING trouvé");

  const study = await prisma.study.create({
    data: {
      name: "Demo Study Rating",
      status: "RUNNING",
      studyType: "QUALITY",
      protocolId: protocol.id,
    },
  });

  console.log("✅ Study created:", study.id, study.name);
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
