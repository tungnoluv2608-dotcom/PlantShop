const express = require("express");
const router = express.Router();
const { getBlogPosts, getBlogPostById, getBlogCategories } = require("../controllers/blogController");

router.get("/categories", getBlogCategories);
router.get("/", getBlogPosts);
router.get("/:id", getBlogPostById);

module.exports = router;
