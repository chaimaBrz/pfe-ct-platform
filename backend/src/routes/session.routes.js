const express = require("express");
const { authRequired } = require("../middlewares/authRequired");
const ctrl = require("../controllers/session.controller");

const router = express.Router();

router.post("/start", authRequired, ctrl.start);

module.exports = router;
