const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  adminLogin, getStats,
  listProducts, createProduct, updateProduct, deleteProduct,
  listAllOrders, updateOrderStatus, adminGetOrderById,
  listCustomers,
  listCategories, createCategory, updateCategory, deleteCategory,
  listAllReviews, updateReview, deleteReview,
  adminListPlanters, createPlanter, updatePlanter, deletePlanter,
  adminListBlog, createBlogPost, updateBlogPost, deleteBlogPost,
} = require("../controllers/adminController");

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

// Orders
router.get("/orders", listAllOrders);
router.get("/orders/:id", adminGetOrderById);
router.patch("/orders/:id/status", updateOrderStatus);

// Customers
router.get("/customers", listCustomers);

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

// Blog
router.get("/blog", adminListBlog);
router.post("/blog", createBlogPost);
router.put("/blog/:id", updateBlogPost);
router.delete("/blog/:id", deleteBlogPost);

module.exports = router;
