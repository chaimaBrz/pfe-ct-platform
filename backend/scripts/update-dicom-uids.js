// scripts/update-dicom-uids.js
const prisma = require("../src/db/prisma"); // <-- IMPORTANT: réutilise le prisma du projet

(async () => {
  try {
    // ✅ Mets ici les 2 IDs que tu vois dans Postman (left.id / right.id)
    const leftId = "f64dc818-0deb-4afa-ba03-5ff7f971caae";
    const rightId = "aca7957a-14b2-4934-8b44-146f75109525";

    // ✅ Mets ici les UIDs DICOM que tu as récupérés
    const STUDY_UID = "1.3.12.2.1107.5.1.4.73013.30000016012119261090200000001"; // 0020,000D
    const SERIES_UID =
      "1.3.12.2.1107.5.1.4.73013.30000016012119261090200000002"; // 0020,000E

    const SOP_LEFT = "1.3.12.2.1107.5.1.4.73013.30000016012119261090200000126"; // 0008,0018
    const SOP_RIGHT = "1.3.12.2.1107.5.1.4.73013.30000016012119261090200000032"; // 0008,0018

    await prisma.imageAsset.update({
      where: { id: leftId },
      data: {
        studyInstanceUID: STUDY_UID,
        seriesInstanceUID: SERIES_UID,
        sopInstanceUID: SOP_LEFT,
      },
    });

    await prisma.imageAsset.update({
      where: { id: rightId },
      data: {
        studyInstanceUID: STUDY_UID,
        seriesInstanceUID: SERIES_UID,
        sopInstanceUID: SOP_RIGHT,
      },
    });

    console.log("✅ OK: 2 ImageAsset mis à jour (UIDs renseignés)");
  } catch (e) {
    console.error("❌ Erreur:", e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
