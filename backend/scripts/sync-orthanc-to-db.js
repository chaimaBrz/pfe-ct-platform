/**
 * Sync Orthanc -> Postgres (ImageAsset + StudyImage)
 * - Lit Orthanc REST: /studies, /studies/{id}, /series/{id}, /instances/{id}
 * - Enregistre study/series/sop UIDs dans ImageAsset
 * - Lie à une Study applicative via StudyImage
 *
 * Usage:
 *   node .\scripts\sync-orthanc-to-db.js <APP_STUDY_ID> [--anonymize]
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const prisma = require("../src/db/prisma");

const ORTHANC_URL = process.env.ORTHANC_URL || "http://localhost:8042";
const ORTHANC_USER = process.env.ORTHANC_USER || "orthanc";
const ORTHANC_PASS = process.env.ORTHANC_PASS || "orthanc";

function authHeader() {
  const token = Buffer.from(`${ORTHANC_USER}:${ORTHANC_PASS}`).toString(
    "base64",
  );
  return { Authorization: `Basic ${token}` };
}

async function orthancGet(path) {
  const res = await fetch(`${ORTHANC_URL}${path}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok)
    throw new Error(
      `Orthanc GET ${path} failed: ${res.status} ${await res.text()}`,
    );
  return res.json();
}

async function orthancPost(path, body) {
  const res = await fetch(`${ORTHANC_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok)
    throw new Error(
      `Orthanc POST ${path} failed: ${res.status} ${await res.text()}`,
    );
  return res.json();
}

async function anonymizeStudy(orthancStudyId) {
  // Orthanc crée une copie anonymisée (nouvel ID Orthanc)
  // Remarque: les options exactes peuvent varier selon config Orthanc.
  // Ici on force au minimum la suppression/replacement des tags patients.
  const payload = {
    RemovePrivateTags: true,
    Force: true,
    // Tu peux fixer un "PatientName" neutre si tu veux :
    // Replace: { "0010,0010": "ANON" }
  };

  const result = await orthancPost(
    `/studies/${orthancStudyId}/anonymize`,
    payload,
  );
  // result contient typiquement l’ID de la nouvelle ressource (selon version)
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const appStudyId = args[0];
  const doAnonymize = args.includes("--anonymize");

  if (!appStudyId) {
    console.error(
      "❌ Usage: node .\\scripts\\sync-orthanc-to-db.js <APP_STUDY_ID> [--anonymize]",
    );
    process.exit(1);
  }

  // Vérifie que la study applicative existe
  const appStudy = await prisma.study.findUnique({ where: { id: appStudyId } });
  if (!appStudy) {
    console.error("❌ Study applicative introuvable:", appStudyId);
    process.exit(1);
  }

  console.log("ORTHANC_URL =", ORTHANC_URL);
  console.log("Sync vers Study =", appStudyId, "-", appStudy.name);

  // 1) Liste des studies Orthanc
  const orthancStudyIds = await orthancGet("/studies");
  console.log("Studies Orthanc trouvées:", orthancStudyIds.length);

  for (const orthStudyId of orthancStudyIds) {
    let studyIdToUse = orthStudyId;

    // (Optionnel) anonymiser la study dans Orthanc
    if (doAnonymize) {
      console.log("🔒 Anonymisation Orthanc study:", orthStudyId);
      try {
        await anonymizeStudy(orthStudyId);
        // Simplification: on ne remplace pas l’ID ici automatiquement
        // (selon la réponse Orthanc, on peut récupérer le nouvel ID si tu veux).
        // On peut aussi choisir: importer directement des DICOM déjà anonymisés.
      } catch (e) {
        console.warn("⚠️ Anonymize a échoué (on continue):", e.message);
      }
    }

    // 2) Détails study
    const study = await orthancGet(`/studies/${studyIdToUse}`);
    const STUDY_UID = study?.MainDicomTags?.StudyInstanceUID;
    if (!STUDY_UID) {
      console.warn("⚠️ Study sans StudyInstanceUID, skip:", studyIdToUse);
      continue;
    }

    // 3) Pour chaque série
    const seriesIds = study.Series || [];
    for (const seriesId of seriesIds) {
      const series = await orthancGet(`/series/${seriesId}`);
      const SERIES_UID = series?.MainDicomTags?.SeriesInstanceUID;
      if (!SERIES_UID) continue;

      const instanceIds = series.Instances || [];
      for (const instId of instanceIds) {
        const inst = await orthancGet(`/instances/${instId}`);
        const SOP_UID = inst?.MainDicomTags?.SOPInstanceUID;
        if (!SOP_UID) continue;

        // 4) Upsert ImageAsset via SOP UID (clé stable)
        // Si tu n'as pas de champ unique sur sopInstanceUID, on fait findFirst + update/create.
        const existing = await prisma.imageAsset.findFirst({
          where: { sopInstanceUID: SOP_UID },
        });

        let imageAsset;
        if (existing) {
          imageAsset = await prisma.imageAsset.update({
            where: { id: existing.id },
            data: {
              studyInstanceUID: STUDY_UID,
              seriesInstanceUID: SERIES_UID,
              sopInstanceUID: SOP_UID,
              format: "DICOM", // adapte à ton enum ImageFormat
            },
          });
        } else {
          imageAsset = await prisma.imageAsset.create({
            data: {
              label: inst?.MainDicomTags?.InstanceNumber
                ? `I${inst.MainDicomTags.InstanceNumber}`
                : null,
              uri: "", // on ne sert pas via uri fichier; on sert via dicomWeb+UIDs
              format: "DICOM", // adapte à ton enum
              studyInstanceUID: STUDY_UID,
              seriesInstanceUID: SERIES_UID,
              sopInstanceUID: SOP_UID,
              metadataJson: inst?.MainDicomTags ? inst.MainDicomTags : null,
            },
          });
        }

        // 5) Lier à la study applicative
        await prisma.studyImage.upsert({
          where: {
            studyId_imageId: { studyId: appStudyId, imageId: imageAsset.id },
          },
          update: {},
          create: { studyId: appStudyId, imageId: imageAsset.id },
        });
      }
    }
  }

  console.log("✅ Sync terminé");
}

main()
  .catch((e) => {
    console.error("❌ Sync failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma?.$disconnect) await prisma.$disconnect();
  });
