import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Leaf, EnvelopeSimple, Lock, Eye, EyeSlash, ShieldCheck } from "@phosphor-icons/react";
import { useAdminStore } from "../../stores/adminStore";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pap.vn");
  const [password, setPassword] = useState("admin123");
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
    <div className="min-h-screen bg-[#0F1923] flex items-center justify-center px-4 font-sans">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, #F7E7CE 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#102C26] rounded-2xl flex items-center justify-center shadow-lg border border-[#F7E7CE]/20">
              <Leaf size={26} weight="fill" className="text-[#F7E7CE]" />
            </div>
            <div className="text-left">
              <p className="text-[#F7E7CE] font-black text-xl tracking-wider">PLAN A PLANT</p>
              <p className="text-white/40 text-xs font-medium tracking-widest uppercase">Admin Portal</p>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Đăng nhập quản trị</h1>
          <p className="text-white/50 text-sm mt-1">Chỉ dành cho nhân viên PAP</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Email</label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F7E7CE]/30 focus:border-[#F7E7CE]/50 transition-all"
                  placeholder="admin@pap.vn"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl pl-10 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F7E7CE]/30 focus:border-[#F7E7CE]/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#102C26] hover:bg-[#102C26]/80 text-[#F7E7CE] font-bold py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><span className="w-5 h-5 border-2 border-[#F7E7CE]/30 border-t-[#F7E7CE] rounded-full animate-spin" />Đang xác thực...</>
                : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30">
            <ShieldCheck size={14} />
            <span>Phiên làm việc được mã hóa & bảo mật</span>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 Plan A Plant. Internal use only.
        </p>
      </div>
    </div>
  );
}
