import { useState } from "react";
import { Buildings, CheckCircle, PaperPlaneTilt, PhoneCall, Truck } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { toast } from "sonner";
import forestPattern from "../assets/forest_pattern.jpg";
import { wholesaleApi } from "../services/apiService";

const highlights = [
  {
    icon: Buildings,
    title: "Phù hợp doanh nghiệp",
    desc: "Văn phòng, nhà hàng, khách sạn, sự kiện.",
  },
  {
    icon: Truck,
    title: "Giao và lắp đặt",
    desc: "Tư vấn và triển khai tận nơi.",
  },
  {
    icon: PhoneCall,
    title: "Phản hồi nhanh",
    desc: "Liên hệ lại trong giờ làm việc.",
  },
];

const benefits = [
  "Chiết khấu tốt hơn khi mua số lượng lớn",
  "Tư vấn chọn cây theo không gian và ngân sách",
  "Có thể kèm dịch vụ chăm sóc định kỳ",
  "Hỗ trợ xuất hóa đơn VAT cho doanh nghiệp",
];

const spaceOptions = [
  "Văn phòng",
  "Khách sạn / Resort",
  "Nhà hàng / Café",
  "Sự kiện / Tiệc cưới",
  "Showroom / Cửa hàng",
  "Khác",
];

const budgetOptions = [
  "Dưới 10 triệu",
  "10 - 30 triệu",
  "30 - 70 triệu",
  "70 - 150 triệu",
  "Trên 150 triệu",
  "Chưa xác định",
];

const timelineOptions = [
  "Cần ngay trong 1 tuần",
  "Trong 2 - 4 tuần",
  "Trong 1 - 2 tháng",
  "Trên 2 tháng",
  "Chưa xác định",
];

export default function WholesalePage() {
  const [form, setForm] = useState({
    company: "",
    contact: "",
    phone: "",
    email: "",
    quantity: "",
    type: "",
    location: "",
    budget: "",
    timeline: "",
    note: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await wholesaleApi.createInquiry(form);
      setForm({ company: "", contact: "", phone: "", email: "", quantity: "", type: "", location: "", budget: "", timeline: "", note: "" });
      toast.success(`${response.message} Mã yêu cầu: #${response.id}`);
    } catch (error: unknown) {
      const message = typeof error === "object" && error && "response" in error
        ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message || "")
        : "";
      toast.error(message || "Không thể gửi yêu cầu báo giá. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans text-foreground flex flex-col">
      <Navbar />

      <section
        className="relative overflow-hidden border-b border-border/70"
        style={{ backgroundImage: `linear-gradient(rgba(24,34,26,0.72), rgba(24,34,26,0.72)), url(${forestPattern})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white/12 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/88">
              Giải pháp cây xanh cho doanh nghiệp
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
              Mua cây số lượng lớn, quy trình rõ ràng, liên hệ nhanh
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Gửi nhu cầu của bạn để nhận báo giá theo quy mô thực tế.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-grow">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={22} weight="fill" />
                </div>
                <h2 className="text-lg font-black text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-black text-foreground">Vì sao nên gửi yêu cầu tại đây?</h2>
              <ul className="mt-5 space-y-3">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-foreground/78">
                    <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-primary/15 bg-primary/5 p-6">
              <h2 className="text-2xl font-black text-foreground">Quy trình ngắn gọn</h2>
              <div className="mt-5 space-y-4">
                {[
                  "Bạn gửi thông tin doanh nghiệp và nhu cầu dự kiến.",
                  "Chúng tôi liên hệ để làm rõ quy mô, ngân sách và tiến độ.",
                  "Đội ngũ gửi phương án cây xanh và báo giá phù hợp.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-6 text-foreground/78">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-foreground">Yêu cầu báo giá</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Điền thông tin cơ bản để chúng tôi liên hệ lại.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Tên công ty *</label>
                  <input
                    required
                    value={form.company}
                    onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="Công ty ABC"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Người liên hệ *</label>
                  <input
                    required
                    value={form.contact}
                    onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Số điện thoại *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="0901 234 567"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="hr@company.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Số lượng dự kiến *</label>
                  <input
                    required
                    value={form.quantity}
                    onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="Ví dụ: 30 cây"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Loại không gian</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">Chọn loại không gian</option>
                    {spaceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Địa điểm triển khai</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="Ví dụ: Quận 1, TP.HCM"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Ngân sách dự kiến</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">Chọn ngân sách</option>
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Thời gian triển khai</label>
                  <select
                    value={form.timeline}
                    onChange={(e) => setForm((prev) => ({ ...prev, timeline: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">Chọn thời gian</option>
                    {timelineOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground/75">Mô tả nhu cầu</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="Ví dụ: cần cây cho văn phòng, ưu tiên dễ chăm..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
              >
                {sending ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  <>
                    <PaperPlaneTilt size={18} weight="fill" />
                    Gửi yêu cầu báo giá
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
