const express = require("express");
const multer = require("multer");

const { authRequired } = require("../middlewares/authRequired");
const { adminRequired } = require("../middlewares/adminRequired");
const ctrl = require("../controllers/image.controller");

const router = express.Router();

// ✅ Multer memory (files in req.files as buffer)
const upload = multer({ storage: multer.memoryStorage() });

// (optionnel) debug
console.log("authRequired:", typeof authRequired);
console.log("adminRequired:", typeof adminRequired);
console.log("upload.array:", typeof upload.array);
console.log("ctrl.uploadImages:", typeof ctrl.uploadImages);

// Existing routes
router.post("/", authRequired, adminRequired, ctrl.create);
router.get("/", authRequired, adminRequired, ctrl.list);

// ✅ Upload DICOM to Orthanc
router.post(
  "/upload",
  authRequired,
  adminRequired,
  upload.array("images"),
  ctrl.uploadImages,
);

module.exports = router;
