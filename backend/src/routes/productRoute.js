const express = require("express");
const router = express.Router();
const { createInMemoryRateLimit } = require("../middlewares/rateLimit");
const {
  getProducts,
  searchProducts,
  getProductById,
  getRelatedProducts,
  getProductAdvisorRecommendations,
  chatProductAdvisor,
} = require("../controllers/productController");

const advisorChatRateLimit = createInMemoryRateLimit({
  windowMs: 60_000,
  max: 12,
  message: "Bạn gửi tin nhắn quá nhanh. Vui lòng đợi một chút.",
});

router.get("/search", searchProducts);
router.post("/advisor/chat", advisorChatRateLimit, chatProductAdvisor);
router.post("/advisor", getProductAdvisorRecommendations);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

module.exports = router;
