const { sendEmail } = require("./emailService");

const SHOP_NAME = String(process.env.SHOP_NAME || "PlantShop").trim();

function formatInquirySummary(inquiry) {
  const categories = Array.isArray(inquiry.interestedCategories)
    ? inquiry.interestedCategories.map((item) => item.name || item.id).filter(Boolean).join(", ")
    : "";
  const products = Array.isArray(inquiry.interestedProducts)
    ? inquiry.interestedProducts.map((item) => item.title || item.id).filter(Boolean).join(", ")
    : "";

  return [
    `Mã yêu cầu: #${inquiry.id}`,
    `Công ty: ${inquiry.company}`,
    `Liên hệ: ${inquiry.contact}`,
    `Điện thoại: ${inquiry.phone}`,
    `Email: ${inquiry.email}`,
    `Số lượng: ${inquiry.quantity || "—"}`,
    `Loại hình: ${inquiry.type || "—"}`,
    `Khu vực: ${inquiry.location || "—"}`,
    `Ngân sách: ${inquiry.budget || "—"}`,
    `Thời gian: ${inquiry.timeline || "—"}`,
    categories ? `Danh mục quan tâm: ${categories}` : null,
    products ? `Sản phẩm quan tâm: ${products}` : null,
    inquiry.note ? `Ghi chú: ${inquiry.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendWholesaleCustomerConfirmation(inquiry) {
  const subject = `[${SHOP_NAME}] Đã nhận yêu cầu báo giá #${inquiry.id}`;
  const text = [
    `Xin chào ${inquiry.contact},`,
    "",
    `Cảm ơn bạn đã gửi yêu cầu báo giá số lượng lớn tới ${SHOP_NAME}.`,
    `Mã yêu cầu của bạn: #${inquiry.id}`,
    "",
    "Đội ngũ kinh doanh sẽ liên hệ trong giờ làm việc để làm rõ nhu cầu và gửi phương án phù hợp.",
    "",
    "Trân trọng,",
    SHOP_NAME,
  ].join("\n");

  return sendEmail({
    to: inquiry.email,
    subject,
    text,
  });
}

async function sendWholesaleAdminNotification(inquiry) {
  const adminEmail = String(process.env.WHOLESALE_ADMIN_EMAIL || "").trim();
  if (!adminEmail) return false;

  const subject = `[${SHOP_NAME}] Lead B2B mới #${inquiry.id} — ${inquiry.company}`;
  const text = [
    "Có yêu cầu báo giá B2B mới:",
    "",
    formatInquirySummary(inquiry),
    "",
    inquiry.assignedTo ? `Phụ trách: ${inquiry.assignedTo}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    to: adminEmail,
    subject,
    text,
  });
}

module.exports = {
  sendWholesaleCustomerConfirmation,
  sendWholesaleAdminNotification,
};