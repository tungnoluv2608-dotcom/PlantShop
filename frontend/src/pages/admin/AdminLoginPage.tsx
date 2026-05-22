import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Leaf, EnvelopeSimple, Lock, Eye, EyeSlash, ShieldCheck } from "@phosphor-icons/react";
import { useAdminStore } from "../../stores/adminStore";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("thanhtung@admin.com");
  const [password, setPassword] = useState("123456");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/admin");
    } else {
      toast.error("Email hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at top left, rgba(223,234,215,0.95), transparent 28%), radial-gradient(circle, rgba(79,127,79,0.08) 1px, transparent 1px)",
          backgroundSize: "auto, 28px 28px",
        }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#6f9d5d] shadow-[0_20px_42px_-24px_rgba(79,127,79,1)]">
              <Leaf size={26} weight="fill" className="text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-primary font-black text-xl tracking-wider">PLANS THANH TÙNG</p>
              <p className="text-muted-foreground/60 text-xs font-medium tracking-widest uppercase">Admin Portal</p>
            </div>
          </div>
          <h1 className="text-2xl font-black text-foreground">Đăng nhập quản trị</h1>
          <p className="text-muted-foreground text-sm mt-1">Chỉ dành cho nhân viên PlanS Thanh Tùng</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-border/80 bg-card/92 p-8 shadow-[0_32px_70px_-38px_rgba(36,53,42,0.7)] backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-border text-foreground placeholder-muted-foreground/45 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  placeholder="thanhtung@admin.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-border text-foreground placeholder-muted-foreground/45 rounded-xl pl-10 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors">
                  {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Đang xác thực...</>
                : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/40">
            <ShieldCheck size={14} />
            <span>Phiên làm việc được mã hóa & bảo mật</span>
          </div>
        </div>

        <p className="text-center text-muted-foreground/30 text-xs mt-6">
          © 2026 PlanS Thanh Tùng. Internal use only.
        </p>
      </div>
    </div>
  );
}
