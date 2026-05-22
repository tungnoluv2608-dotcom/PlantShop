const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getProducts,
  searchProducts,
  getProductById,
  getRelatedProducts,
  getProductAdvisorRecommendations,
  listProductAdvisorHistory,
} = require("../controllers/productController");

router.get("/search", searchProducts);
router.get("/advisor/history", authMiddleware, listProductAdvisorHistory);
router.post("/advisor", getProductAdvisorRecommendations);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

module.exports = router;
