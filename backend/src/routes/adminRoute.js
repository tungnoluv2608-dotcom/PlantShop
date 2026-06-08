const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  adminLogin, getStats,
  listProducts, createProduct, updateProduct, deleteProduct,
  listAllOrders, updateOrderStatus, updateOrderNote, adminGetOrderById,
  listCustomers,
  listCategories, createCategory, updateCategory, deleteCategory,
  listAllReviews, updateReview, deleteReview,
  adminListPlanters, createPlanter, updatePlanter, deletePlanter,
  adminListBlog, createBlogPost, updateBlogPost, deleteBlogPost, generateBlogDraft,
} = require("../controllers/adminController");
const {
  listWholesaleInquiries,
  getWholesaleInquiryById,
  updateWholesaleInquiry,
} = require("../controllers/wholesaleController");
const {
  getPrintSettings,
  updatePrintSettings,
  resetPrintSettings,
} = require("../controllers/printSettingsController");
const {
  adminListVouchers,
  adminGetVoucherById,
  adminCreateVoucher,
  adminUpdateVoucher,
  adminDeleteVoucher,
  adminListVoucherRedemptions,
} = require("../controllers/voucherController");
const {
  adminListShippingZones,
  adminGetShippingZoneById,
  adminCreateShippingZone,
  adminUpdateShippingZone,
  adminDeleteShippingZone,
} = require("../controllers/shippingController");

// Public admin login
router.post("/login", adminLogin);

// All routes below require admin role
router.use(adminMiddleware);

// Stats
router.get("/stats", getStats);

// Products
router.get("/products", listProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Print settings
router.get("/print-settings", getPrintSettings);
router.patch("/print-settings", updatePrintSettings);
router.post("/print-settings/reset", resetPrintSettings);

// Orders
router.get("/orders", listAllOrders);
router.get("/orders/:id", adminGetOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/note", updateOrderNote);

// Customers
router.get("/customers", listCustomers);

// Wholesale inquiries
router.get("/wholesale-inquiries", listWholesaleInquiries);
router.get("/wholesale-inquiries/:id", getWholesaleInquiryById);
router.patch("/wholesale-inquiries/:id", updateWholesaleInquiry);

// Categories
router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Reviews
router.get("/reviews", listAllReviews);
router.patch("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);

// Planters
router.get("/planters", adminListPlanters);
router.post("/planters", createPlanter);
router.put("/planters/:id", updatePlanter);
router.delete("/planters/:id", deletePlanter);

// Shipping zones
router.get("/shipping-zones", adminListShippingZones);
router.get("/shipping-zones/:id", adminGetShippingZoneById);
router.post("/shipping-zones", adminCreateShippingZone);
router.put("/shipping-zones/:id", adminUpdateShippingZone);
router.delete("/shipping-zones/:id", adminDeleteShippingZone);

// Vouchers - literal routes first
router.get("/vouchers/:id/redemptions", adminListVoucherRedemptions);

// Vouchers
router.get("/vouchers", adminListVouchers);
router.get("/vouchers/:id", adminGetVoucherById);
router.post("/vouchers", adminCreateVoucher);
router.put("/vouchers/:id", adminUpdateVoucher);
router.delete("/vouchers/:id", adminDeleteVoucher);

// Blog - literal routes first, then param routes
router.post("/blog/ai-draft", generateBlogDraft);
router.get("/blog", adminListBlog);
router.post("/blog", createBlogPost);
router.put("/blog/:id", updateBlogPost);
router.delete("/blog/:id", deleteBlogPost);

module.exports = router;
