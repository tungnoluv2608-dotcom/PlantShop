require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const blogRoute = require("./routes/blogRoute");
const reviewRoute = require("./routes/reviewRoute");
const orderRoute = require("./routes/orderRoute");
const planterRoute = require("./routes/planterRoute");
const adminRoute = require("./routes/adminRoute");
const uploadRoute = require("./routes/uploadRoute");
const addressRoute = require("./routes/addressRoute");
const errorHandler = require("./middlewares/errorHandler");
const { getPool } = require("./libs/db");

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (uploaded images) ───────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/blog", blogRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/orders", orderRoute);
app.use("/api/planters", planterRoute);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/addresses", addressRoute);

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🌱 PlantWeb API is running!", version: "1.0.0" });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await getPool(); // test DB connection on startup
    app.listen(PORT, () => {
      console.log(`🚀 PlantWeb backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }
}

start();
