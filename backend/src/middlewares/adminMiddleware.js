const authMiddleware = require("./authMiddleware");

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập." });
    }
    next();
  });
}

module.exports = adminMiddleware;
