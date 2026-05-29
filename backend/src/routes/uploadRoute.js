const express = require("express");
const multer = require("multer");
const { uploadBuffer } = require("../libs/cloudinary");
const authMiddleware = require("../middlewares/authMiddleware");
const { createInMemoryRateLimit } = require("../middlewares/rateLimit");

const router = express.Router();
const uploadRateLimit = createInMemoryRateLimit({
  windowMs: Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  max: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 20),
  message: "Bạn upload quá nhanh. Vui lòng thử lại sau ít phút.",
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok = allowed.test(file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase()) &&
    allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)."));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

async function handleUpload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Không có file được upload." });
    const result = await uploadBuffer(req.file.buffer, {
      original_filename: req.file.originalname.slice(0, req.file.originalname.lastIndexOf(".")),
    });
    return res.json({
      url: result.secure_url,
      filename: result.public_id,
    });
  } catch (err) {
    next(err);
  }
}

async function handleMultipleUpload(req, res, next) {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "Không có file được upload." });

    const urls = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadBuffer(file.buffer, {
          original_filename: file.originalname.slice(0, file.originalname.lastIndexOf(".")),
        });
        return result.secure_url;
      })
    );

    return res.json({ urls });
  } catch (err) {
    next(err);
  }
}

// POST /api/upload       → { url: "https://...", filename: "public_id" }
router.post("/", authMiddleware, uploadRateLimit, upload.single("image"), handleUpload);

// POST /api/upload/multiple → { urls: ["https://...", ...] }
router.post("/multiple", authMiddleware, uploadRateLimit, upload.array("images", 10), handleMultipleUpload);

module.exports = router;
