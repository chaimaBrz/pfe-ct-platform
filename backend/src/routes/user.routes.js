const express = require("express");
const ctrl = require("../controllers/user.controller");

const router = express.Router();

router.post("/", ctrl.createUser);
router.get("/", ctrl.getUsers);
router.get("/:id", ctrl.getUserById);
router.put("/:id", ctrl.updateUser);
router.delete("/:id", ctrl.deleteUser);

module.exports = router;
