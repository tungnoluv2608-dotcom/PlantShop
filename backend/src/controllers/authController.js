const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../libs/db");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });

    const pool = await getPool();
    const existing = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id FROM Users WHERE email = @email");

    if (existing.recordset.length > 0)
      return res.status(409).json({ message: "Email này đã được sử dụng." });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .query(
        `INSERT INTO Users (name, email, password_hash, role)
         OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
         VALUES (@name, @email, @passwordHash, 'customer')`
      );

    const user = result.recordset[0];
    const token = generateToken(user);
    return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/signin
async function signin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id, name, email, password_hash, role FROM Users WHERE email = @email");

    if (result.recordset.length === 0)
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });

    const token = generateToken(user);
    return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.user.id)
      .query("SELECT id, name, email, role FROM Users WHERE id = @id");

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Người dùng không tồn tại." });

    const user = result.recordset[0];
    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, signin, getMe };
