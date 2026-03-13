const express = require("express");
const router = express.Router();
const { getReviewsByProduct, createReview } = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", getReviewsByProduct);
router.post("/", authMiddleware, createReview);

module.exports = router;
