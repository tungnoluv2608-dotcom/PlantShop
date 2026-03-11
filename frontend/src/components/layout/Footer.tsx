import { Link } from "react-router";
import { FacebookLogo, TwitterLogo, InstagramLogo } from "@phosphor-icons/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-16 border-t border-gray-100">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand/Logo Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="font-bold text-3xl tracking-tighter text-primary mb-6 inline-block">
              PAP
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Chúng tôi cung cấp những chậu cây chất lượng cao nhất, góp phần tạo nên một thế giới xanh và cuộc sống bền vững!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 tracking-wide">Liên kết nhanh</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link to="/shop" className="hover:text-primary/80 transition-colors">Cửa hàng</Link></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Mua số lượng lớn</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Quà tặng</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 tracking-wide">Pháp lý</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary/80 transition-colors">Điều khoản & Điều kiện</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Vận chuyển</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 tracking-wide">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary/80 transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-primary/80 transition-colors">Liên hệ với chúng tôi</a></li>
              <li><Link to="/signin" className="hover:text-primary/80 transition-colors">Đăng nhập</Link></li>
              <li><Link to="/signup" className="hover:text-primary/80 transition-colors">Đăng ký</Link></li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-gray-100 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Plan A Plant. Đã đăng ký bản quyền.
          </p>
          <div className="flex gap-4 items-center text-gray-400">
            <a href="#" className="hover:text-primary/80 transition-colors">
              <FacebookLogo size={24} weight="fill" />
            </a>
            <a href="#" className="hover:text-primary/80 transition-colors">
              <TwitterLogo size={24} weight="fill" />
            </a>
            <a href="#" className="hover:text-primary/80 transition-colors">
              <InstagramLogo size={24} weight="fill" />
            </a>
          </div>
        </div>
      </div>

      {/* Mini Footer - Payment Gateways */}
      <div className="bg-gray-50 py-4 w-full">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>Chúng tôi hỗ trợ thanh toán qua các cổng uy tín</p>
          <div className="flex gap-4 flex-wrap justify-center items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">VISA</span>
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">Mastercard</span>
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">VNPay</span>
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">MoMo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
