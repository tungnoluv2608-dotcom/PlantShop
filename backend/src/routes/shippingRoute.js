const express = require("express");
const router = express.Router();
const { quoteShipping } = require("../controllers/shippingController");

router.post("/quote", quoteShipping);

module.exports = router;