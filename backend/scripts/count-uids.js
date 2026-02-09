/**
 * Count how many ImageAsset rows have DICOM UIDs filled.
 * Usage:
 *   node .\scripts\count-uids.js
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const prisma = require("../src/db/prisma");

async function main() {
  const ok = await prisma.imageAsset.count({
    where: {
      studyInstanceUID: { not: null },
      seriesInstanceUID: { not: null },
      sopInstanceUID: { not: null },
    },
  });

  const total = await prisma.imageAsset.count();

  console.log(`UIDs OK: ${ok} / ${total}`);
}

main()
  .catch((e) => {
    console.error("❌ count-uids failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma?.$disconnect) await prisma.$disconnect();
  });
