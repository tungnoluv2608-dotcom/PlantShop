const express = require("express");
const { createWholesaleInquiry } = require("../controllers/wholesaleController");
const { createInMemoryRateLimit } = require("../middlewares/rateLimit");

const router = express.Router();

const wholesaleRateLimit = createInMemoryRateLimit({
  windowMs: Number(process.env.WHOLESALE_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  max: Number(process.env.WHOLESALE_RATE_LIMIT_MAX || 5),
  message: "Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau ít phút.",
});

router.post("/", wholesaleRateLimit, createWholesaleInquiry);

module.exports = router;
