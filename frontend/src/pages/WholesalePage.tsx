import { useState } from "react";
import { Buildings, Plant, Flower, TreePalm, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { toast } from "sonner";
import forestPattern from "../assets/forest_pattern.jpg";

const tiers = [
  { label: "Gói Khởi Đầu", qty: "10 – 49 cây", discount: "10%", badge: "", color: "border-gray-200" },
  { label: "Gói Doanh Nghiệp", qty: "50 – 99 cây", discount: "18%", badge: "PHỔ BIẾN", color: "border-primary bg-primary/5" },
  { label: "Gói Đối Tác", qty: "100+ cây", discount: "25%+", badge: "BEST VALUE", color: "border-primary bg-primary/5" },
];

const useCases = [
  { icon: Buildings, label: "Văn phòng", desc: "Cây lọc không khí, tăng năng suất làm việc" },
  { icon: Flower, label: "Khách sạn & Resort", desc: "Tăng thẩm mỹ không gian, thu hút khách hàng" },
  { icon: Plant, label: "Nhà hàng & Café", desc: "Tạo không gian xanh độc đáo, sống ảo" },
  { icon: TreePalm, label: "Sự kiện & Tiệc cưới", desc: "Trang trí concept thiên nhiên, hot trend" },
];

const services = [
  "Tư vấn chọn cây phù hợp với không gian và ngân sách",
  "Thiết kế layout bố trí cây theo từng khu vực",
  "Giao hàng và lắp đặt tận nơi",
  "Dịch vụ chăm sóc định kỳ theo hợp đồng",
  "Thay thế cây miễn phí nếu cây không phát triển tốt",
  "Hóa đơn VAT đầy đủ cho doanh nghiệp",
];

export default function WholesalePage() {
  const [form, setForm] = useState({ company: "", contact: "", phone: "", email: "", quantity: "", type: "", note: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setForm({ company: "", contact: "", phone: "", email: "", quantity: "", type: "", note: "" });
    toast.success("Yêu cầu đã gửi! Chuyên viên B2B sẽ liên hệ bạn trong vòng 2 giờ làm việc.");
  };

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <div
        className="relative w-full h-56 md:h-72 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${forestPattern})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center px-4">
          <span className="inline-block bg-secondary text-primary text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">Dành cho doanh nghiệp</span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-wide uppercase mb-2">MUA SỐ LƯỢNG LỚN</h1>
          <p className="text-white/80 md:text-lg">Ưu đãi hấp dẫn · Giao hàng tận nơi · Chăm sóc định kỳ</p>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

        {/* Use Cases */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-foreground mb-2">Phù hợp với mọi không gian</h2>
          <p className="text-foreground/60">PlanS Thanh Tùng đã phục vụ hàng trăm doanh nghiệp trên toàn quốc</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {useCases.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-secondary text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary transition-colors">
                <Icon size={24} className="text-primary group-hover:text-white transition-colors" weight="fill" />
              </div>
              <p className="font-bold text-sm mb-1">{label}</p>
              <p className="text-xs text-foreground/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-foreground mb-2">Bảng giá chiết khấu</h2>
          <p className="text-foreground/60">Chiết khấu càng nhiều khi mua số lượng lớn</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {tiers.map((tier) => (
            <div key={tier.label} className={`bg-white rounded-2xl p-6 border-2 shadow-sm relative ${tier.color}`}>
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-4 py-1 rounded-full shadow">
                  {tier.badge}
                </span>
              )}
              <p className="font-black text-lg text-foreground mb-1">{tier.label}</p>
              <p className="text-foreground/60 text-sm mb-4">{tier.qty}</p>
              <p className="text-5xl font-black text-primary mb-1">{tier.discount}</p>
              <p className="text-foreground/50 text-sm mb-6">chiết khấu</p>
              <ul className="space-y-2">
                {["Miễn phí vận chuyển", "Tư vấn chuyên sâu miễn phí", tier.badge ? "Chăm sóc định kỳ miễn phí 1 tháng" : "Giao hàng ưu tiên"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check size={16} className="text-green-600 shrink-0" weight="bold" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="bg-primary rounded-3xl p-8 md:p-10 text-white mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-black mb-4">Dịch vụ trọn gói</h2>
              <p className="text-white/70 mb-6">Chúng tôi không chỉ bán cây — chúng tôi mang đến giải pháp xanh hóa không gian toàn diện.</p>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <Check size={18} className="text-secondary shrink-0 mt-0.5" weight="bold" />
                    <span className="text-white/80">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden h-64 shadow-xl">
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop" alt="Office plants" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* B2B Contact Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-secondary p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-foreground mb-2">Yêu cầu báo giá</h2>
            <p className="text-foreground/60">Điền form bên dưới — chuyên viên B2B của chúng tôi sẽ liên hệ trong vòng 2 giờ làm việc.</p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Tên công ty *</label>
                <input required value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                  placeholder="Công ty ABC" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Người liên hệ *</label>
                <input required value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                  placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Số điện thoại *</label>
                <input required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                  placeholder="0901 234 567" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Email *</label>
                <input required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                  placeholder="hr@company.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Số lượng cây dự kiến</label>
                <input value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                  placeholder="VD: 50 cây" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Loại không gian</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all bg-white">
                  <option value="">Chọn loại không gian</option>
                  {["Văn phòng", "Khách sạn / Resort", "Nhà hàng / Café", "Sự kiện / Tiệc cưới", "Khác"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Yêu cầu thêm</label>
              <textarea value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all resize-none"
                placeholder="Mô tả không gian, loại cây mong muốn, timeline dự án..." />
            </div>
            <button type="submit" disabled={sending}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2">
              {sending ? <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />Đang gửi...</> : <><PaperPlaneTilt size={20} weight="fill" />Gửi yêu cầu báo giá</>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
