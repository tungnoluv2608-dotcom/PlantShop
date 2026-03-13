function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Lỗi máy chủ nội bộ.",
  });
}

module.exports = errorHandler;
