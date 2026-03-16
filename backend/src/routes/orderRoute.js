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
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/vnpay/verify", verifyVnpayReturn);

router.use(authMiddleware);

router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.post("/:id/vnpay-url", createVnpayPaymentUrl);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
