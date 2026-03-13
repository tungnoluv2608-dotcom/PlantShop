const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../libs/db");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helpers ──────────────────────────────────────────────────
async function upsertOAuthUser(pool, { email, name, avatarUrl, provider }) {
  // Check if user exists
  const existing = await pool
    .request()
    .input("email", sql.NVarChar, email)
    .query("SELECT id, name, email, role FROM Users WHERE email = @email");

  if (existing.recordset.length > 0) {
    return existing.recordset[0];
  }

  // Create new user (no password needed, OAuth)
  const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
  const result = await pool
    .request()
    .input("name", sql.NVarChar, name)
    .input("email", sql.NVarChar, email)
    .input("passwordHash", sql.NVarChar, passwordHash)
    .input("role", sql.NVarChar, "customer")
    .query(
      `INSERT INTO Users (name, email, password_hash, role)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
       VALUES (@name, @email, @passwordHash, @role)`
    );
  return result.recordset[0];
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/google
async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Thiếu Google credential." });

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) return res.status(400).json({ message: "Không lấy được email từ Google." });

    const pool = await getPool();
    const user = await upsertOAuthUser(pool, { email, name, avatarUrl: picture, provider: "google" });
    const token = generateToken(user);

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Google OAuth error:", err.message);
    return res.status(401).json({ message: "Xác thực Google thất bại. Vui lòng thử lại." });
  }
}

// POST /api/auth/facebook
async function facebookLogin(req, res, next) {
  try {
    const { accessToken, userId } = req.body;
    if (!accessToken || !userId) return res.status(400).json({ message: "Thiếu Facebook access token." });

    // Verify token with Facebook Graph API
    const verifyUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
    const verifyRes = await axios.get(verifyUrl);
    const { data: debugData } = verifyRes.data;

    if (!debugData.is_valid || debugData.user_id !== userId) {
      return res.status(401).json({ message: "Facebook token không hợp lệ." });
    }

    // Get user info from Facebook
    const userRes = await axios.get(
      `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const { name, email, picture } = userRes.data;
    const fbEmail = email || `fb_${userId}@facebook.com`; // fallback if email not granted

    const pool = await getPool();
    const user = await upsertOAuthUser(pool, {
      email: fbEmail,
      name,
      avatarUrl: picture?.data?.url,
      provider: "facebook",
    });
    const token = generateToken(user);

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Facebook OAuth error:", err.message);
    return res.status(401).json({ message: "Xác thực Facebook thất bại. Vui lòng thử lại." });
  }
}

module.exports = { googleLogin, facebookLogin };
