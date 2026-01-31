const express = require("express");
const { authRequired } = require("../middlewares/authRequired");
const ctrl = require("../controllers/vision.controller");

const router = express.Router();

router.get("/status", authRequired, ctrl.getStatus);
router.post("/submit", authRequired, ctrl.submit);

module.exports = router;
