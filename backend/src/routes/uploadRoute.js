const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload  → { url: "/uploads/filename.jpg" }
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file được upload." });
  const url = `/uploads/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});

// POST /api/upload/multiple → { urls: [...] }
router.post("/multiple", upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: "Không có file được upload." });
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  return res.json({ urls });
});

module.exports = router;
