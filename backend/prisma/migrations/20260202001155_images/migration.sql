-- CreateTable
CREATE TABLE "ImageAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storageUri" TEXT NOT NULL,
    "modality" TEXT NOT NULL DEFAULT 'CT',
    "doseLevel" TEXT,
    "category" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "meta" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageAsset_pkey" PRIMARY KEY ("id")
);
