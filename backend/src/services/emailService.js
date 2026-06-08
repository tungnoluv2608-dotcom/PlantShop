const nodemailer = require("nodemailer");

let cachedTransporter = null;

function isEmailConfigured() {
  return Boolean(
    String(process.env.SMTP_HOST || "").trim() &&
      String(process.env.SMTP_FROM || process.env.SMTP_USER || "").trim()
  );
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "",
        }
      : undefined,
  });

  return cachedTransporter;
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) return false;

  const from = String(process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!from || recipients.length === 0) return false;

  await transporter.sendMail({
    from,
    to: recipients.join(", "),
    subject,
    text,
    html: html || undefined,
  });

  return true;
}

module.exports = {
  isEmailConfigured,
  sendEmail,
};