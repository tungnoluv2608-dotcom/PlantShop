const axios = require("axios");

const WEBHOOK_URL = String(process.env.WHOLESALE_NOTIFY_WEBHOOK_URL || "").trim();
const WEBHOOK_TYPE = String(process.env.WHOLESALE_NOTIFY_WEBHOOK_TYPE || "slack").trim().toLowerCase();

function buildMessage(inquiry) {
  return [
    "Lead wholesale moi",
    `Ma lead: #${inquiry.id}`,
    `Cong ty: ${inquiry.company}`,
    `Lien he: ${inquiry.contact}`,
    `Dien thoai: ${inquiry.phone}`,
    `Email: ${inquiry.email}`,
    `So luong: ${inquiry.quantity || "Chua ro"}`,
    `Khong gian: ${inquiry.type || "Chua ro"}`,
    `Dia diem: ${inquiry.location || "Chua ro"}`,
    `Ngan sach: ${inquiry.budget || "Chua ro"}`,
    `Timeline: ${inquiry.timeline || "Chua ro"}`,
    `Ghi chu: ${inquiry.note || "Khong co"}`,
  ].join("\n");
}

async function notifyNewWholesaleInquiry(inquiry) {
  if (!WEBHOOK_URL) return false;

  const text = buildMessage(inquiry);

  if (WEBHOOK_TYPE === "slack") {
    await axios.post(
      WEBHOOK_URL,
      { text },
      { timeout: 10000, headers: { "Content-Type": "application/json" } }
    );
    return true;
  }

  if (WEBHOOK_TYPE === "json") {
    await axios.post(
      WEBHOOK_URL,
      {
        event: "wholesale_inquiry_created",
        inquiry,
        text,
      },
      { timeout: 10000, headers: { "Content-Type": "application/json" } }
    );
    return true;
  }

  throw new Error(`WHOLESALE_NOTIFY_WEBHOOK_TYPE không hỗ trợ: ${WEBHOOK_TYPE}`);
}

module.exports = { notifyNewWholesaleInquiry };
