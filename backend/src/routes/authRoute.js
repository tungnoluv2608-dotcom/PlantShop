const express = require("express");
const router = express.Router();
const { googleLogin, facebookLogin } = require("../controllers/oauthController");
const { signup, signin, getMe } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", authMiddleware, getMe);
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);

module.exports = router;
