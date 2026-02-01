const express = require("express");
const { authRequired } = require("../middlewares/authRequired");
const { adminRequired } = require("../middlewares/adminRequired");
const ctrl = require("../controllers/study.controller");

const router = express.Router();

router.post("/", authRequired, adminRequired, ctrl.create);
router.get("/", authRequired, adminRequired, ctrl.list);

module.exports = router;
