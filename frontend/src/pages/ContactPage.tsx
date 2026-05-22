import { useState } from "react";
import { MapPin, Phone, Envelope, Clock, FacebookLogo, InstagramLogo, PaperPlaneTilt } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { toast } from "sonner";
import forestPattern from "../assets/forest_pattern.jpg";

const subjects = ["Đặt hàng & Vận chuyển", "Đổi trả & Hoàn tiền", "Hỏi về cây cảnh", "Hợp tác & B2B", "Phản hồi dịch vụ", "Khác"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    toast.success("Gửi thành công! Chúng tôi sẽ phản hồi trong 24 giờ.");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <div
        className="relative flex h-48 w-full items-center justify-center overflow-hidden md:h-56"
        style={{ backgroundImage: `url(${forestPattern})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,53,42,0.72),rgba(79,127,79,0.45))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,253,247,0.18),transparent_25%)]" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase">LIÊN HỆ</h1>
          <p className="text-white/80 mt-2">Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact Info */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-5 text-foreground">Thông tin liên hệ</h2>
              {[
                { icon: MapPin, label: "Địa chỉ showroom", value: "123 Nguyễn Huệ, Quận 1\nTP. Hồ Chí Minh" },
                { icon: Phone, label: "Hotline", value: "1800 6868 (Miễn phí)" },
                { icon: Envelope, label: "Email", value: "hello@planapalnt.vn" },
                { icon: Clock, label: "Giờ mở cửa", value: "T2-T7: 8:00 - 18:00\nChủ nhật: 9:00 - 16:00" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4 mb-5 last:mb-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-foreground whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <h3 className="font-bold mb-4">Nhắn tin nhanh qua mạng xã hội</h3>
              <div className="space-y-3">
                {[
                  { icon: FacebookLogo, label: "Facebook Fanpage", color: "bg-blue-600", sub: "Phản hồi trong vài phút" },
                  { icon: InstagramLogo, label: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500", sub: "@planapalnt" },
                ].map(({ icon: Icon, label, color, sub }) => (
                  <a key={label} href="#" className={`flex items-center gap-3 p-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity ${color}`}>
                    <Icon size={22} weight="fill" />
                    <div>
                      <p>{label}</p>
                      <p className="text-white/70 text-xs font-normal">{sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8 lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Họ và tên *</label>
                  <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Số điện thoại</label>
                  <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} type="tel"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="0901 234 567" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Email *</label>
                <input required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} type="email"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Chủ đề</label>
                <select value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Chọn chủ đề...</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Nội dung *</label>
                <textarea required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={5}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Nhập nội dung liên hệ..." />
              </div>
              <button type="submit" disabled={sending}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2">
                {sending ? <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />Đang gửi...</> : <><PaperPlaneTilt size={20} weight="fill" />Gửi tin nhắn</>}
              </button>
            </form>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="relative mt-8 h-64 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(237,244,231,0.9),rgba(255,253,247,1))]">
            <div className="text-center">
              <MapPin size={48} className="text-primary/30 mx-auto mb-2" />
              <p className="text-foreground/40 font-medium">Google Maps</p>
              <p className="text-xs text-foreground/30">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
