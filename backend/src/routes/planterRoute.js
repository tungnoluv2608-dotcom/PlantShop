const express = require("express");
const router = express.Router();
const { getPlanters, getPlanterById } = require("../controllers/planterController");

router.get("/", getPlanters);
router.get("/:id", getPlanterById);

module.exports = router;
