# EXPLAN.md — Tài liệu bảo vệ đồ án PlantWeb

> **Mục đích tài liệu:** Giải thích chi tiết 5 tính năng tốt nhất của dự án PlantWeb để bạn nắm vững **luồng hoạt động (flow)**, **cách tích hợp**, và **trả lời phản biện** khi bảo vệ đồ án tốt nghiệp.
>
> **Cách dùng:** Mỗi tính năng có 6 phần: (1) Mục đích, (2) Luồng end-to-end, (3) Cách tích hợp, (4) Điểm kỹ thuật đáng khoe, (5) API chính, (6) Câu hỏi phản biện & cách trả lời. Phần (6) là phần quan trọng nhất khi đứng trước hội đồng.

---

## 0. Tổng quan kiến trúc dự án (đọc trước khi vào từng tính năng)

PlantWeb là sàn thương mại điện tử bán cây cảnh, chậu và phụ kiện. Hệ thống gồm **3 ứng dụng tách biệt**:

| Ứng dụng | Công nghệ | Vai trò |
|----------|-----------|---------|
| `frontend-user` | React 19 + Vite + TypeScript + Tailwind v4 + Zustand | Giao diện khách hàng |
| `frontend-admin` | React 19 + Vite + TypeScript + Zustand | Trang quản trị |
| `backend` | Express.js (Node.js, CommonJS) | REST API duy nhất phục vụ cả 2 frontend |
| Database | **MS SQL Server** (qua package `mssql`) | Lưu trữ dữ liệu |

**Các điểm kiến trúc cần nói khi mở đầu bảo vệ:**

1. **Tách 2 frontend (user/admin) hoàn toàn độc lập:** khác store, khác key localStorage (`plantweb-auth` vs `pap-admin-auth`), khác axios instance → tránh xung đột phiên đăng nhập, bảo mật tốt hơn (admin và user không dùng chung token).
2. **Kiến trúc feature-based ở frontend:** mỗi tính năng nằm trong 1 thư mục `features/<tên>` chứa `api.ts`, `components/`, `pages/`, `schema.ts`, `types.ts` → dễ bảo trì, cô lập (high cohesion, low coupling).
3. **Backend phân lớp rõ ràng:** `routes/` (định nghĩa endpoint) → `controllers/` (xử lý HTTP) → `services/` (logic nghiệp vụ thuần) → `libs/db.js` (connection pool). Logic nghiệp vụ tách khỏi controller để **tái sử dụng** (ví dụ: cả đơn lẻ và đơn sỉ đều gọi chung `deductStockForOrderItems`).
4. **Validation 2 lớp:** Zod ở frontend (chặn sớm, hiển thị lỗi theo field) + validate lại ở backend (không bao giờ tin client).
5. **Nguyên tắc xuyên suốt: KHÔNG TIN GIÁ TỪ CLIENT.** Mọi tính toán tiền (giá sản phẩm, giảm giá, phí ship) đều load lại giá thật từ DB ở backend. Đây là điểm bảo mật quan trọng nhất của hệ thống.

**5 tính năng được chọn trình bày (theo thứ tự ưu tiên):**

1. 🏆 Đặt hàng & Thanh toán PayOS (flagship — phức tạp & bảo mật nhất)
2. 🎟️ Voucher / Khuyến mãi (chống race condition bằng pessimistic locking)
3. 🏢 Wholesale B2B (bán sỉ — auto-assignment + tái sử dụng pipeline)
4. 🤖 AI Plant Advisor (tư vấn cây bằng AI — tích hợp OpenRouter)
5. 🚚 Giao hàng theo vùng + địa chỉ hành chính VN (thuật toán matching zone)

---

## 1. 🏆 ĐẶT HÀNG & THANH TOÁN PAYOS

> **Đây là tính năng flagship — nên dành nhiều thời gian nhất.** Nó tích hợp đầy đủ: tạo đơn, trừ kho atomic, cổng thanh toán bên thứ 3, chữ ký số, webhook, idempotency, và transaction.

### 1.1. Mục đích

Cho phép khách đặt hàng và thanh toán an toàn qua nhiều phương thức. Hệ thống hỗ trợ 3 phương thức (khai báo tại `orderController.js`):

```js
const VALID_PAYMENT_METHODS = new Set(["cod", "payos", "vnpay"]);
```

- **COD** (thanh toán khi nhận hàng): đơn vào trạng thái `pending`, không gọi cổng thanh toán.
- **PayOS** (tích hợp đầy đủ & bảo mật nhất — **tập trung khoe cái này**): có tạo payment link, chữ ký HMAC-SHA256, **webhook server-to-server**.
- **VNPay**: tạo URL ký HMAC-SHA512, verify khi redirect về, nhưng **không có webhook/IPN riêng**.

> ⚠️ **Lưu ý khi bảo vệ:** MoMo/ZaloPay được nhắc trong tài liệu nhưng **chưa code thực tế**. Đừng nói là đã làm — nếu bị hỏi, trả lời thẳng: "PayOS và VNPay đã tích hợp hoàn chỉnh, COD hoạt động đầy đủ; MoMo/ZaloPay là hướng mở rộng."

### 1.2. Luồng đặt hàng end-to-end (HỌC THUỘC SƠ ĐỒ NÀY)

```
[1] CheckoutPage.tsx
    User chọn: địa chỉ + phương thức ship (standard/express/sameday)
              + phương thức thanh toán + voucher (nếu có)
    → handlePlaceOrder() → useCreateOrder() → POST /api/orders
        │
[2] orderController.createOrder()  ── MỞ SQL TRANSACTION ──
    a. normalizeIncomingItems()   : parse id phức hợp "product-123-planter-5"
    b. loadCatalogMaps()          : load giá THẬT từ DB (Products, Planters)
    c. buildCanonicalOrderItems() : unitPrice = giá sản phẩm + giá chậu kèm
    d. validateOrderItemStock()   : kiểm tra tồn kho TRƯỚC khi mở transaction
    e. validateVoucherForOrder(lock:true) : áp voucher có khóa chống race
    f. getNextOrderSequenceValue(): sinh mã đơn PSTT-2026-00001 (MERGE HOLDLOCK)
    g. INSERT INTO Orders (status='pending')
    h. INSERT INTO VoucherRedemptions (nếu có voucher)
    i. deductStockForOrderItems() : TRỪ KHO ngay (atomic, chống oversell)
    j. INSERT INTO OrderItems
    k. UPDATE Orders SET stock_reserved = 1
    l. INSERT INTO OrderTimeline ("Đặt hàng thành công")
    → transaction.commit()   (lỗi bất kỳ bước nào → rollback toàn bộ)
        │
[3] Tạo link thanh toán (nếu KHÔNG phải COD)
    - COD  : clear cart → /order-success/:id
    - PayOS: POST /api/orders/:id/payos-url → trả checkoutUrl → redirect
    - VNPay: POST /api/orders/:id/vnpay-url → trả paymentUrl → redirect
        │
[4] User thanh toán trên cổng (PayOS / VNPay)
        │
[5] Xác nhận thanh toán — HAI NGUỒN:
    (A) Return URL (browser redirect về):
        PayOS → /payment/payos-return → verifyPayosReturn
        VNPay → /payment/vnpay-return → verifyVnpayReturn
    (B) Webhook (chỉ PayOS, server-to-server — ĐÁNG TIN NHẤT):
        POST /api/webhooks/payos-webhook → handlePayosWebhook
        │
[6] markOrderPaid() : UPDATE Orders SET status='confirmed'
                      WHERE id=@id AND status='pending'   ← idempotent
                      + ghi OrderTimeline
```

### 1.3. Cách tích hợp PayOS (phần kỹ thuật lõi)

**a) Tạo payment link** (`payosService.createPaymentLink`):
- Build body gồm `orderCode` (số nguyên), `amount`, `description`, `returnUrl`, `cancelUrl`...
- Tạo `signature` trên 5 field theo thứ tự alphabet: `amount, cancelUrl, description, orderCode, returnUrl` (đúng spec PayOS).
- Gọi `POST https://api-merchant.payos.vn/v2/payment-requests` với header `x-client-id`, `x-api-key`.

**b) Ký & verify chữ ký (HMAC-SHA256)** — dùng chung cho cả tạo link và webhook:

```js
function createSignature(data, checksumKey) {
  return crypto.createHmac("sha256", checksumKey)
    .update(buildSignaturePayload(data))   // sort key alphabet đệ quy rồi nối key=value&...
    .digest("hex");
}
function verifyWebhookSignature(data, signature) {
  const expected = createSignature(data, getPayosConfig().checksumKey);
  return expected.toLowerCase() === String(signature || "").trim().toLowerCase();
}
```

**c) Webhook chống giả mạo** (`handlePayosWebhook`):
- Route mount với `express.raw({ type: "application/json" })` **đặt TRƯỚC** `express.json()` → giữ nguyên raw body để verify chữ ký (best practice).
- Verify chữ ký sai → trả `400 Invalid signature`, **không chạm DB**.
- Nếu `status === "PAID"` → tìm đơn qua `findOrderByPayosOrderCode` → `markOrderPaid`.
- **Luôn trả HTTP 200 `{received:true}`** dù xử lý hay không → tránh PayOS retry vô hạn.

**d) Verify return URL không tin browser:** `verifyPayosReturn` **gọi lại API PayOS** (`getPaymentLinkStatus`) lấy trạng thái thật từ server PayOS + so khớp `orderCode` → chống user tự sửa query string giả thành công.

### 1.4. Quản lý tồn kho — chống bán quá (oversell)

Đây là điểm kỹ thuật **đắt giá nhất** để khoe. Trừ kho bằng **một câu UPDATE atomic có điều kiện**:

```sql
UPDATE Products
SET stock_quantity = stock_quantity - @qty,
    in_stock = CASE WHEN stock_quantity - @qty > 0 THEN 1 ELSE 0 END
WHERE id = @id AND stock_quantity >= @qty   -- ← chốt chặn oversell
```

- Mệnh đề `WHERE stock_quantity >= @qty` đảm bảo update **chỉ thành công khi còn đủ hàng tại đúng thời điểm UPDATE** (row-level lock tự động của SQL Server).
- Nếu `rowsAffected[0] === 0` → throw lỗi 400 → **rollback toàn bộ transaction**. Không cần `SELECT ... FOR UPDATE` riêng.
- **Mô hình reserve/release:** trừ kho ngay khi tạo đơn (`stock_reserved=1`); hoàn kho (`restoreOrderStock`) khi hủy đơn. Cờ `stock_reserved` đảm bảo **hoàn đúng 1 lần**, không double-restore.
- Thanh toán thất bại → đơn giữ `pending`, kho **vẫn reserved** → user có thể thanh toán lại hoặc tự hủy (mới hoàn kho).

### 1.5. State machine trạng thái đơn

```
pending ──(thanh toán PayOS/VNPay OK)──► confirmed ──► processing ──► shipping ──► delivered
   │                                          │
   └──────────(user/admin hủy)───────────────┴──► cancelled  (→ restoreOrderStock hoàn kho)
```

User chỉ được hủy khi đơn ở `pending` hoặc `confirmed`. Mỗi lần đổi trạng thái → ghi 1 dòng vào `OrderTimeline` (lịch sử hiển thị cho khách).

### 1.6. API chính

| Method | Endpoint | Handler |
|--------|----------|---------|
| POST | `/api/orders` | `createOrder` |
| PATCH | `/api/orders/:id/cancel` | `cancelOrder` |
| POST | `/api/orders/:id/payos-url` | `createPayosPaymentUrl` |
| GET | `/api/orders/payos/verify` | `verifyPayosReturn` |
| POST | `/api/webhooks/payos-webhook` | `handlePayosWebhook` (raw body + signature) |

**Bảng DB:** `Orders`, `OrderItems`, `OrderTimeline`, `OrderNumberSequences`, `VoucherRedemptions`.

### 1.7. ❓ Câu hỏi phản biện & cách trả lời

**H: Làm sao chống 2 người mua cùng lúc sản phẩm cuối cùng (oversell)?**
> Dùng UPDATE atomic `WHERE stock_quantity >= @qty`. SQL Server tự khóa row khi UPDATE, nên chỉ 1 transaction trừ được; transaction kia thấy `rowsAffected=0` và bị rollback. Không cần lock thủ công.

**H: Webhook bị gọi nhiều lần thì sao (PayOS hay retry)?**
> Hàm `markOrderPaid` có điều kiện `WHERE status='pending'`, nên lần gọi thứ 2 trở đi `rowsAffected=0`, không ghi trùng timeline → **idempotent**.

**H: User sửa query string trên return URL để giả thanh toán thành công thì sao?**
> Em không tin query string. `verifyPayosReturn` gọi lại API PayOS để lấy trạng thái thật từ server PayOS và so khớp orderCode. Ngoài ra webhook server-to-server có ký HMAC-SHA256 mới là nguồn xác nhận chính.

**H: Tại sao trừ kho ngay khi tạo đơn mà chưa thanh toán?**
> Mô hình "reserve khi tạo đơn" để tránh oversell trong lúc chờ thanh toán. Nếu thất bại/hủy, kho được hoàn qua `restoreOrderStock`, cờ `stock_reserved` đảm bảo hoàn đúng 1 lần.

**H: Vì sao đặt `express.raw` trước `express.json`?**
> Verify chữ ký HMAC phải tính trên **raw body nguyên bản**. Nếu để `express.json` parse trước, body bị biến đổi → chữ ký không khớp. Nên route webhook phải nhận raw buffer.

---

## 2. 🎟️ VOUCHER / KHUYẾN MÃI

> Điểm nhấn: **pessimistic locking chống race condition** + **3 loại voucher** + **giá canonical từ server**.

### 2.1. Mục đích & các loại voucher

3 loại giảm giá (`VALID_DISCOUNT_TYPES` trong `voucherService.js`):

| Loại | Mô tả | Ghi chú |
|------|-------|---------|
| `percent` | Giảm theo % | Có thể có trần `max_discount` |
| `fixed` | Giảm số tiền cố định | Không vượt giá trị hàng |
| `freeship` | Miễn phí ship | `discount_value` = 0 |

3 phạm vi áp dụng (`applies_to`): `all` (cả giỏ), `category` (theo danh mục), `product` (theo sản phẩm cụ thể — cần bảng `VoucherScopes`).

Điều kiện: `min_order_value` (đơn tối thiểu), `usage_limit` (tổng lượt), `usage_per_user` (lượt/người), `starts_at`/`expires_at` (hiệu lực), `is_active`.

### 2.2. Luồng xác thực & áp dụng

```
[Preview] User nhập mã ở checkout (VoucherPickerSheet.tsx)
  → POST /api/vouchers/validate
  → validateVoucher() → normalizeIncomingItems → loadCatalogMaps (giá thật)
                      → buildCanonicalOrderItems → validateVoucherForOrder()

validateVoucherForOrder():        ← TRÁI TIM HỆ THỐNG
  normalizeVoucherCode()          : trim + uppercase
  loadVoucherByCode()             : SELECT (có thể kèm WITH (UPDLOCK,ROWLOCK))
  loadVoucherScopes()             : load phạm vi áp dụng
  assertVoucherSchedule()         : kiểm tra is_active + ngày hiệu lực
  countVoucherUsage()             : đếm tổng lượt + lượt của user này
  assertVoucherUsageLimits()      : so với usage_limit & usage_per_user
  computeEligibleSubtotal()       : tính phần giỏ đủ điều kiện
  computeDiscountAmount()         : tính tiền giảm
  → trả {discountAmount, shippingFee, total, savings}

[Đặt hàng thật] POST /api/orders (createOrder)
  → validateVoucherForOrder(lock:true)   ← VALIDATE LẠI có khóa
  → INSERT VoucherRedemptions (trong cùng transaction với đơn)
```

**Điểm quan trọng — validate 2 lần:** lần 1 lúc preview (không khóa), lần 2 lúc đặt hàng thật (**có khóa**). Tránh việc voucher hết hạn/hết lượt trong khoảng giữa 2 request.

### 2.3. Logic tính giảm giá

```js
// percent
discount = eligibleSubtotal * (discountValue / 100)
if (maxDiscount) discount = Math.min(discount, maxDiscount)
discount = Math.min(discount, eligibleSubtotal)
// fixed
discount = Math.min(discountValue, eligibleSubtotal)
// freeship
discount = 0; shippingFee = 0
// làm tròn
roundMoney(x) = Math.max(0, Math.round(x * 100) / 100)
total = roundMoney(subtotal - discountAmount + shippingFee)
```

Lưu ý logic tinh tế: `min_order_value` kiểm tra theo **tổng subtotal cả giỏ**, nhưng giảm giá chỉ tính trên **phần eligible** (khi voucher giới hạn theo danh mục/sản phẩm).

### 2.4. Chống lạm dụng (race condition)

**Đây là điểm khoe số 1 của tính năng voucher.** Khi đặt hàng, `loadVoucherByCode` chạy với khóa bi quan:

```sql
SELECT ... FROM Vouchers WITH (UPDLOCK, ROWLOCK) WHERE UPPER(LTRIM(RTRIM(code))) = @code
```

- `UPDLOCK`: ngăn transaction khác đọc row với ý định update đồng thời.
- `ROWLOCK`: chỉ khóa cấp row, không khóa cả bảng.
- Kết hợp validate + insert `VoucherRedemptions` trong **cùng transaction** → 2 người không thể đồng thời vượt `usage_limit`.

Bổ sung: đơn `cancelled` không tính vào usage; hủy đơn → `DELETE VoucherRedemptions WHERE order_id` → **tự hoàn lượt voucher**. Xóa voucher đã dùng → chỉ `is_active=0` (giữ lịch sử).

### 2.5. API & DB

| Method | Endpoint | Handler |
|--------|----------|---------|
| POST | `/api/vouchers/validate` | `validateVoucher` |
| POST | `/api/vouchers/available` | `listAvailableVouchers` (gợi ý voucher lợi nhất) |
| GET | `/api/admin/vouchers` | `adminListVouchers` |
| POST | `/api/admin/vouchers` | `adminCreateVoucher` |

**Bảng:** `Vouchers`, `VoucherScopes`, `VoucherRedemptions`, `UserVoucherClaims` (kho voucher đã lưu của user).

### 2.6. ❓ Câu hỏi phản biện

**H: 100 voucher mà 120 người bấm cùng lúc thì sao?**
> Dùng pessimistic lock `UPDLOCK, ROWLOCK` khi đặt hàng. Mỗi transaction phải giành lock trên row voucher trước khi đếm + ghi nhận, nên không thể vượt quá `usage_limit`.

**H: User sửa giá sản phẩm ở client để đủ điều kiện min_order rồi gian lận?**
> `buildCanonicalOrderItems` load lại giá từ DB, bỏ qua giá client gửi lên. Không gian lận được.

**H: User hủy đơn rồi có lấy lại được lượt voucher không?**
> Có. `countVoucherUsage` loại trừ đơn `cancelled`, và khi hủy còn `DELETE` bản ghi redemption → lượt được hoàn tự động.

---

## 3. 🏢 WHOLESALE B2B (BÁN SỈ)

> Điểm nhấn: **auto-assignment cân tải** + **tái sử dụng toàn bộ pipeline đơn hàng** + **state machine vòng đời deal**.

### 3.1. Mục đích

Phục vụ khách doanh nghiệp (văn phòng, resort, công trình xanh) đặt số lượng lớn. Khách gửi **yêu cầu báo giá** (inquiry) thay vì mua lẻ; hệ thống tự phân công sales, theo dõi deal từ `new` → `won/lost`, rồi tạo đơn hàng chính thức.

### 3.2. Luồng end-to-end

```
[1] Khách gửi yêu cầu (public, WholesalePage.tsx)
    → POST /api/wholesale-inquiries → createWholesaleInquiry()
       validatePublicInquiryPayload() + rate-limit 5 req/10 phút
[2] Auto-assign + lưu DB
    pickAutoAssignAdmin(): chọn admin có ÍT inquiry đang mở nhất
                           (COUNT open inquiries GROUP BY admin, ORDER BY ASC)
    → INSERT WholesaleInquiries + logWholesaleActivity("created","assigned")
[3] Notification & Email (await nhưng try-catch riêng)
    notifyNewWholesaleInquiry()          : webhook Slack / JSON endpoint
    sendWholesaleCustomerConfirmation()  : email xác nhận cho khách
    sendWholesaleAdminNotification()     : email cho admin
[4] Admin xử lý (WholesaleDetailPage.tsx)
    → PATCH /api/admin/wholesale-inquiries/:id → updateWholesaleInquiry()
       state: new → contacted → qualified → quoted → won/lost/archived
       mọi thay đổi → log vào WholesaleInquiryActivities
[5] Tạo đơn từ inquiry (chỉ khi qualified/quoted/won)
    createWholesaleOrder() → createOrderFromWholesaleInquiry()  ── TRANSACTION ──
       findOrCreateCustomer()  : tìm/tạo user theo email (bcrypt random pass)
       buildDefaultItemsFromInquiry() : build items từ sản phẩm quan tâm
       calculateOrderTotalsWithVoucher() + deductStockForOrderItems()
       INSERT Orders/OrderItems/OrderTimeline + UPDATE inquiry.order_id
       → tự chuyển inquiry sang "won"
```

### 3.3. Cách tích hợp

- **Bảng:** `WholesaleInquiries` (chính, có cột `order_id` link sang `Orders`), `WholesaleInquiryActivities` (audit log, cascade delete), `Users`, và **tái sử dụng** `Orders/OrderItems/OrderTimeline/OrderNumberSequences`.
- **Transaction:** `createOrderFromWholesaleInquiry` bọc full transaction (insert order + trừ kho + insert items + timeline + update inquiry). Lỗi → rollback hết.
- **Notification/email:** gọi đồng bộ (await) nhưng **wrap try-catch độc lập** → Slack/SMTP chết vẫn trả 201 và inquiry vẫn được lưu (graceful degradation).
- **Schema tự tạo:** `ensureWholesaleInquiriesTable()` chạy `IF NOT EXISTS` mỗi request, tự `ALTER TABLE` thêm cột thiếu → deploy không cần file migration riêng.

### 3.4. Điểm kỹ thuật đáng khoe

1. **Auto-assignment cân tải bằng SQL aggregation** — không cần lưu state round-robin bên ngoài.
2. **Tái sử dụng 100% pipeline đơn lẻ** (`validateOrderItemStock → deductStockForOrderItems → calculateOrderTotalsWithVoucher`) → không duplicate logic, kho không bao giờ oversell kể cả đơn sỉ.
3. **Idempotent schema migration** — zero-downtime.
4. **Graceful degradation** cho thông báo.
5. **Audit trail đầy đủ** — mọi hành động ghi vào `WholesaleInquiryActivities`.

### 3.5. API chính

| Method | Endpoint | Handler |
|--------|----------|---------|
| POST | `/api/wholesale-inquiries` | `createWholesaleInquiry` (public) |
| GET | `/api/admin/wholesale-inquiries` | `listWholesaleInquiries` |
| PATCH | `/api/admin/wholesale-inquiries/:id` | `updateWholesaleInquiry` |
| POST | `/api/admin/wholesale-inquiries/:id/create-order` | `createWholesaleOrder` |

### 3.6. ❓ Câu hỏi phản biện

**H: Phân công sales kiểu gì? Round-robin?**
> Cân tải theo số inquiry đang mở: query `COUNT ... GROUP BY admin ORDER BY openCount ASC`, chọn người ít việc nhất. Trạng thái nằm trong DB nên không cần biến đếm ngoài.

**H: Đơn sỉ có code riêng tách khỏi đơn lẻ không?**
> Không. Em tái sử dụng đúng pipeline đơn lẻ (trừ kho, tính tiền, sinh mã đơn), chỉ khác điểm khởi đầu là từ inquiry. Nhờ vậy logic nhất quán, không lặp code.

**H: Email gửi lỗi thì khách có nhận được phản hồi không?**
> Có. Email/webhook bọc try-catch riêng, lỗi không làm fail request → khách vẫn nhận 201, inquiry vẫn lưu.

---

## 4. 🤖 AI PLANT ADVISOR

> Điểm nhấn: tích hợp **OpenRouter LLM**, mô hình **RAG đơn giản** (đưa catalog sản phẩm vào prompt), **2 chế độ** (chat đa lượt + form), có **fallback** khi AI lỗi.

### 4.1. Mục đích & các chế độ

Tư vấn chọn cây phù hợp với người dùng. Có 3 thành phần dùng OpenRouter API:

1. **Chat Advisor** (floating widget): hội thoại đa lượt, gợi ý sản phẩm theo ngữ cảnh.
2. **Form Advisor**: user điền ngân sách/ánh sáng/thú cưng/ưu tiên → trả gợi ý 1 lần.
3. **Blog AI Draft** (admin): sinh nháp bài viết blog.

### 4.2. Luồng Chat Advisor

```
User mở widget → gõ câu hỏi → sendMessage()
  → POST /api/products/advisor/chat {messages}
  → advisorChatRateLimit (12 req/phút/IP)
  → chatProductAdvisor():
     a. normalizeAdvisorChatMessages() : validate role, cắt 1200 ký tự, lấy 20 tin cuối
     b. SELECT TOP 40 sản phẩm còn hàng (stock_quantity > 0) mới nhất
     c. enrichProducts() : bổ sung ảnh (ProductImages) + hướng dẫn chăm (CareGuides)
     d. summarizeProductForAdvisor() : build "catalog" (mô tả cắt 220, bio 180, 3 care guide)
     e. systemPrompt (tiếng Việt): chỉ hỏi 1 câu/lượt, ưu tiên hỏi ánh sáng→kinh nghiệm
                                    →ngân sách→thú cưng, gợi ý 2-4 SP kèm JSON recommendations
     f. POST https://openrouter.ai/api/v1/chat/completions
        model: deepseek/deepseek-chat-v3-0324:free, temperature 0.45,
        response_format: json_object, timeout 45s
     g. tryParseJson() : xử lý JSON bị bọc ```markdown fence```
     h. normalizeAdvisorOutput() : map id → object sản phẩm enriched
  → render ChatProductCard (ảnh, tên, giá, lý do gợi ý, fitTags)
```

Response của AI dạng:
```json
{ "message": "Nhà bạn có nhiều ánh sáng tự nhiên không?",
  "recommendations": [{ "id": 42, "reason": "...", "fitTags": ["Ánh sáng thấp","Dễ chăm"] }] }
```

### 4.3. Cách tích hợp & điểm đáng khoe

- **RAG đơn giản (Retrieval-Augmented Generation):** lấy 40 sản phẩm thật từ DB nhét vào prompt → AI chỉ gợi ý sản phẩm **đang bán & còn hàng**, không bịa. Đây là cách giải thích "AI không nói linh tinh".
- **Cắt token thông minh:** description 220 ký tự, bio 180, 3 care guide → giảm chi phí token.
- **Chống AI trả sai format:** `tryParseJson()` + `stripMarkdownFence()`, và **fallback rule cứng** (`buildFallbackAdvisorResponse`) đảm bảo luôn có ≥3 gợi ý kể cả khi AI lỗi.
- **Bảo mật & chi phí:** rate limit 12 req/phút/IP; chat store **không persist** (không lưu hội thoại vào localStorage → tránh lộ thông tin).
- **Model cấu hình qua env** (`OPENROUTER_PRODUCT_ADVISOR_MODEL`), dùng free tier.
- **temperature khác nhau theo mục đích:** chat 0.45, form 0.35 (ổn định hơn), blog 0.7 (sáng tạo hơn).

### 4.4. API & DB

| Method | Endpoint | Handler |
|--------|----------|---------|
| POST | `/api/products/advisor/chat` | `chatProductAdvisor` (rate limit) |
| POST | `/api/products/advisor` | `getProductAdvisorRecommendations` |
| POST | `/api/admin/blog/ai-draft` | `generateBlogDraft` |

**Bảng:** đọc `Products/Categories/ProductImages/CareGuides`; ghi `UserPlantAdvisorHistory`.

### 4.5. ❓ Câu hỏi phản biện

**H: Làm sao AI không gợi ý sản phẩm không có trong shop?**
> Em dùng mô hình RAG: lấy danh sách sản phẩm thật còn hàng từ DB đưa vào prompt, và sau khi AI trả về, `normalizeAdvisorOutput` chỉ giữ lại id nào thực sự tồn tại trong catalog. Sản phẩm bịa bị loại.

**H: Nếu API AI lỗi/timeout thì sao?**
> Có timeout 45s và cơ chế fallback rule cứng đảm bảo luôn trả ≥3 gợi ý. Người dùng không bao giờ thấy màn hình trống.

**H: Có sợ lộ API key không?**
> Key OpenRouter chỉ nằm ở backend (env), frontend không bao giờ thấy. Mọi request AI đi qua backend, có rate limit chống lạm dụng.

---

## 5. 🚚 GIAO HÀNG THEO VÙNG + ĐỊA CHỈ HÀNH CHÍNH VN

> Điểm nhấn: **thuật toán matching zone 4 tầng** + **chuẩn hóa tên tỉnh có dấu** + tích hợp **API địa chỉ hành chính VN**.

### 5.1. Mục đích

Tính phí ship động theo vùng địa lý (tỉnh/huyện), hỗ trợ 3 phương thức (`standard/express/sameday`), admin tự cấu hình bảng giá qua giao diện.

### 5.2. Luồng tính phí

```
CheckoutPage: chọn địa chỉ + phương thức ship
  → useShippingQuote() → POST /api/shipping/quote {items, shippingMethod, province, district, ward}
  → quoteShipping():
     a. loadCatalogMaps + buildCanonicalOrderItems → tính subtotal từ giá DB (không tin client)
     b. getShippingQuote():
        resolveShippingZone():
          loadActiveShippingZones() : SELECT ShippingZones WHERE is_active=1 ORDER BY priority DESC
          matchZoneFromList()       : THUẬT TOÁN MATCHING 4 TẦNG (xem 5.3)
        tính fee cho 3 phương thức:
          - sameday: nếu zone không hỗ trợ → available=false
          - standard: nếu subtotal >= freeShippingThreshold → fee=0 (miễn ship)
          - express: theo expressFee của zone
  → trả {shippingFee, zone, methods[3], allowsSameday}
  → voucher freeship có thể override: displayFee = voucher?.shippingFee ?? quote.shippingFee
```

### 5.3. Thuật toán matching zone (phần khoe chính)

```
matchZoneFromList() ưu tiên 4 tầng:
  1. Khớp province + district  (zone cấp huyện — vd "Quận 1, HCM")
  2. Khớp province, zone không có district (vd "Hà Nội" toàn thành phố)
  3. Zone default (không province, không district — áp cho tỉnh chưa cấu hình)
  4. buildFallbackZone() : nếu DB chưa có zone nào → giá cứng từ env (SHIPPING_*_FEE)

normalizeProvince(): chuẩn hóa tên tỉnh
  - stripDiacritics(): "Hà Nội" → "Ha Noi" (dùng String.normalize('NFD'))
  - bỏ tiền tố "thành phố"/"tỉnh"
  - PROVINCE_ALIASES: "tp.hcm"/"sai gon"/"saigon" → "tp. ho chi minh"
```

### 5.4. Tích hợp địa chỉ hành chính VN

- Frontend gọi **trực tiếp** `https://provinces.open-api.vn/api/v2/` (API cộng đồng mã nguồn mở) lấy 63 tỉnh + phường/xã; cache `staleTime` 24h (dữ liệu ít đổi).
- Quản lý địa chỉ user (`UserAddresses`): mọi route qua `authMiddleware`. Logic UX hay: xóa địa chỉ mặc định → **tự promote** địa chỉ mới nhất làm mặc định; địa chỉ đầu tiên tự set default.

### 5.5. Điểm đáng khoe

1. **Subtotal tính lại ở server** từ giá DB → chống gian lận để đạt ngưỡng freeship.
2. **Matching zone 4 tầng** đảm bảo luôn có giá ship hợp lý cho mọi địa chỉ.
3. **Chuẩn hóa tên tỉnh có dấu + alias** → match đúng dù người dùng gõ "TP.HCM" hay "Thành phố Hồ Chí Minh".
4. **Admin tự cấu hình bảng giá** linh hoạt theo `priority` (zone ưu tiên cao match trước).

### 5.6. API & DB

| Method | Endpoint | Handler |
|--------|----------|---------|
| POST | `/api/shipping/quote` | `quoteShipping` (public) |
| GET/POST/PUT/DELETE | `/api/admin/shipping-zones` | `adminListShippingZones`... |
| GET/POST/PUT/DELETE | `/api/addresses` | `listMyAddresses`... |

**Bảng:** `ShippingZones`, `UserAddresses`.

### 5.7. ❓ Câu hỏi phản biện

**H: Người dùng gõ tên tỉnh sai chính tả/không dấu thì sao?**
> `normalizeProvince` bỏ dấu (NFD normalize), bỏ tiền tố "tỉnh/thành phố", và có bảng alias cho các cách viết phổ biến (TP.HCM, Sài Gòn...). Nên vẫn match đúng zone.

**H: Nếu admin chưa cấu hình zone cho 1 tỉnh thì tính phí kiểu gì?**
> Có 4 tầng fallback: huyện → tỉnh → zone mặc định → giá cứng từ env. Luôn ra được một mức phí, không bao giờ lỗi.

**H: Sao không tự lưu phí ship từ client gửi lên cho nhanh?**
> Không an toàn. Phí ship phụ thuộc subtotal mà subtotal phải tính từ giá DB. Em luôn tính lại ở server để chống gian lận.

---

## 6. Bảng tổng kết nhanh (ôn cấp tốc trước khi vào phòng)

| # | Tính năng | 1 câu chốt đáng khoe |
|---|-----------|----------------------|
| 1 | Đặt hàng & PayOS | Trừ kho atomic chống oversell + webhook ký HMAC-SHA256 idempotent + transaction xuyên suốt |
| 2 | Voucher | Pessimistic lock `UPDLOCK,ROWLOCK` chống vượt giới hạn lượt khi nhiều người mua đồng thời |
| 3 | Wholesale B2B | Auto-assign cân tải + tái sử dụng 100% pipeline đơn lẻ, không duplicate logic |
| 4 | AI Advisor | RAG đơn giản — nhét catalog thật vào prompt nên AI chỉ gợi ý hàng đang bán, có fallback |
| 5 | Shipping | Matching zone 4 tầng + chuẩn hóa tên tỉnh có dấu, subtotal tính lại ở server |

**3 nguyên tắc xuyên suốt — nếu quên gì thì nói 3 câu này:**
1. **Không bao giờ tin client** — mọi tính tiền load lại giá từ DB.
2. **Transaction + atomic UPDATE** — đảm bảo dữ liệu nhất quán, chống race condition.
3. **Tách lớp service** — logic nghiệp vụ tái sử dụng được giữa đơn lẻ và đơn sỉ.

---

## 7. Sơ đồ kiến trúc tổng (vẽ lên bảng nếu được hỏi)

```
┌─────────────────┐     ┌─────────────────┐
│  frontend-user  │     │ frontend-admin  │   React + Vite + TS + Zustand
│ (plantweb-auth) │     │ (pap-admin-auth)│   (feature-based, axios interceptor)
└────────┬────────┘     └────────┬────────┘
         │  REST /api/*          │  REST /api/admin/*
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   backend (Express)   │   routes → controllers → services → db
         │  ┌─────────────────┐  │
         │  │  middlewares    │  │   authMiddleware / adminMiddleware /
         │  │                 │  │   optionalAuthMiddleware / rateLimit
         │  └─────────────────┘  │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐        ┌──────────────┐
         │   MS SQL Server       │        │  Bên thứ 3:  │
         │ (mssql, transaction,  │        │  PayOS,      │
         │  UPDLOCK/HOLDLOCK)    │◄──────►│  OpenRouter, │
         └───────────────────────┘        │  provinces.. │
                                          └──────────────┘
```

---

> **Lời khuyên cuối:** Khi bảo vệ, đừng đọc code dòng-by-dòng. Hãy (1) nói **bài toán nghiệp vụ**, (2) vẽ/kể **luồng**, (3) nhấn vào **1-2 điểm kỹ thuật đáng khoe**, (4) chuẩn bị sẵn câu trả lời phản biện ở phần 6 mỗi tính năng. Tự tin nói thẳng cái gì **chưa làm** (MoMo/ZaloPay) thay vì nói vống — hội đồng đánh giá cao sự trung thực.
