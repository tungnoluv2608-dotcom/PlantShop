const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");
const {
  listPromotions,
  getWallet,
  listAvailableVouchers,
  claimVoucher,
  validateVoucher,
} = require("../controllers/voucherController");

router.get("/promotions", optionalAuthMiddleware, listPromotions);

router.use(authMiddleware);

router.get("/wallet", getWallet);
router.post("/available", listAvailableVouchers);
router.post("/validate", validateVoucher);
router.post("/:id/claim", claimVoucher);

module.exports = router;