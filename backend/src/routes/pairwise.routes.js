const express = require("express");
const { authRequired } = require("../middlewares/authRequired");
const { adminRequired } = require("../middlewares/adminRequired");

const tasksCtrl = require("../controllers/pairwisetask.controller");
const evalCtrl = require("../controllers/pairwise.controller");

const router = express.Router();

// Admin: génération + liste des tasks
router.post("/tasks/generate", authRequired, adminRequired, tasksCtrl.generate);
router.get("/tasks", authRequired, adminRequired, tasksCtrl.list);

// Observateur: next + answer
router.get("/next", authRequired, evalCtrl.next);
router.post("/answer", authRequired, evalCtrl.answer);

module.exports = router;
