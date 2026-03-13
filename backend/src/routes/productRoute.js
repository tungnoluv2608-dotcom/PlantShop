const express = require("express");
const router = express.Router();
const { getProducts, searchProducts, getProductById, getRelatedProducts } = require("../controllers/productController");

router.get("/search", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

module.exports = router;
