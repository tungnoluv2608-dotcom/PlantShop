const express = require("express");
const router = express.Router();
const {
	getMyOrders,
	getOrderById,
	createOrder,
	cancelOrder,
	createVnpayPaymentUrl,
	verifyVnpayReturn,
} = require("../controllers/orderController");
const { createPayosPaymentUrl, verifyPayosReturn } = require("../controllers/payosController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/vnpay/verify", verifyVnpayReturn);
router.get("/payos/verify", verifyPayosReturn);

router.use(authMiddleware);

router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.post("/:id/vnpay-url", createVnpayPaymentUrl);
router.post("/:id/payos-url", createPayosPaymentUrl);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
