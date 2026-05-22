const express = require("express");
const router = express.Router();
const { handlePayosWebhook } = require("../controllers/payosController");

router.post("/payos-webhook", handlePayosWebhook);

module.exports = router;
