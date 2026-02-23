require("dotenv/config");
const crypto = require("crypto");
const prisma = require("../src/db/prisma"); // ✅ chez toi il existe

async function main() {
  console.log("🚀 Creating rating tasks...");

  // 1) Trouver le study qui est lié à un protocole RATING
  const study = await prisma.study.findFirst({
    where: {
      protocol: { mode: "RATING" },
    },
    include: { protocol: true },
  });

  if (!study) {
    console.log("❌ Aucun Study lié à un Protocol mode=RATING trouvé.");
    return;
  }

  console.log(`✅ Study trouvé: ${study.name} (id=${study.id})`);

  // 2) Récupérer toutes les images attachées au study (StudyImage)
  const studyImages = await prisma.studyImage.findMany({
    where: { studyId: study.id },
    select: { imageId: true },
  });

  console.log("Images trouvées:", studyImages.length);

  if (studyImages.length === 0) {
    console.log("❌ StudyImage vide -> attache d’abord les images au study.");
    return;
  }

  // 3) Créer 1 RatingTask par image (ignore si déjà existant)
  let created = 0;
  let skipped = 0;

  for (const si of studyImages) {
    try {
      await prisma.ratingTask.create({
        data: {
          studyId: study.id,
          imageId: si.imageId,
          randomSeed: crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),
        },
      });
      created++;
    } catch (e) {
      // Unique constraint (studyId,imageId) => déjà existant
      skipped++;
    }
  }

  console.log(`✅ RatingTasks créés: ${created}`);
  console.log(`↩️  Déjà existants (skipped): ${skipped}`);
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
