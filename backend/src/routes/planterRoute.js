const express = require("express");
const router = express.Router();
const { getPlanters } = require("../controllers/planterController");

router.get("/", getPlanters);

module.exports = router;
