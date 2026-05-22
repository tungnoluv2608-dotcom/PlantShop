import { Link } from "react-router";
import { FacebookLogo, TwitterLogo, InstagramLogo } from "@phosphor-icons/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(255,253,247,0.94),rgba(237,244,231,0.88))] pt-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand/Logo Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="font-bold text-3xl tracking-tighter text-primary mb-6 inline-block">
              PlanS Thanh Tùng
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Chúng tôi cung cấp những chậu cây chất lượng cao nhất, góp phần tạo nên một thế giới xanh và cuộc sống bền vững!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-bold tracking-wide text-foreground">Liên kết nhanh</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><Link to="/shop" className="hover:text-primary/80 transition-colors">Cửa hàng</Link></li>
              <li><Link to="/about" className="hover:text-primary/80 transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/wholesale" className="hover:text-primary/80 transition-colors">Mua số lượng lớn</Link></li>
              <li><Link to="/blog" className="hover:text-primary/80 transition-colors">Blog cây cảnh</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-bold tracking-wide text-foreground">Pháp lý</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><a href="#" className="hover:text-primary/80 transition-colors">Điều khoản & Điều kiện</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Vận chuyển</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-bold tracking-wide text-foreground">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><Link to="/faq" className="hover:text-primary/80 transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/contact" className="hover:text-primary/80 transition-colors">Liên hệ với chúng tôi</Link></li>
              <li><Link to="/signin" className="hover:text-primary/80 transition-colors">Đăng nhập</Link></li>
              <li><Link to="/signup" className="hover:text-primary/80 transition-colors">Đăng ký</Link></li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/70 py-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} PlanS Thanh Tùng. Đã đăng ký bản quyền.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card transition-colors hover:border-primary/30 hover:text-primary">
              <FacebookLogo size={24} weight="fill" />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card transition-colors hover:border-primary/30 hover:text-primary">
              <TwitterLogo size={24} weight="fill" />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card transition-colors hover:border-primary/30 hover:text-primary">
              <InstagramLogo size={24} weight="fill" />
            </a>
          </div>
        </div>
      </div>

      {/* Mini Footer - Payment Gateways */}
      <div className="w-full border-t border-border/70 bg-secondary/35 py-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 text-xs text-muted-foreground md:flex-row md:px-12">
          <p>Chúng tôi hỗ trợ thanh toán qua các cổng uy tín</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
            <span className="rounded-md border border-border/80 bg-card px-3 py-1.5 shadow-sm">VISA</span>
            <span className="rounded-md border border-border/80 bg-card px-3 py-1.5 shadow-sm">Mastercard</span>
            <span className="rounded-md border border-border/80 bg-card px-3 py-1.5 shadow-sm">VNPay</span>
            <span className="rounded-md border border-border/80 bg-card px-3 py-1.5 shadow-sm">MoMo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}



