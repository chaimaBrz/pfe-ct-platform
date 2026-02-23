const prisma = require("../src/db/prisma");

async function main() {
  const studyId = "4dd81fcd-caff-44cd-9f4b-a26777d2d69f";

  const images = await prisma.imageAsset.findMany({
    where: {
      format: "DICOM",
      studyInstanceUID: { not: null },
      seriesInstanceUID: { not: null },
      sopInstanceUID: { not: null },
    },
    select: { id: true },
  });

  console.log("Images trouvées:", images.length);

  if (!images.length) {
    console.log("❌ aucune image");
    return;
  }

  const result = await prisma.studyImage.createMany({
    data: images.map((img) => ({
      studyId,
      imageId: img.id,
    })),
    skipDuplicates: true,
  });

  console.log("✅ StudyImage créées:", result.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
