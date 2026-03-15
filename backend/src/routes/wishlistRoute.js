const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listMyWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.use(authMiddleware);

router.get("/", listMyWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
