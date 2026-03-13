const express = require("express");
const router = express.Router();
const { getMyOrders, getOrderById, createOrder, cancelOrder } = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
