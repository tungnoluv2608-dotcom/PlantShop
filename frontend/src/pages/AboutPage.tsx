import { Link } from "react-router";
import { Leaf, Plant, Users, Trophy, Heart, ArrowRight } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { teamMembers } from "../data/mockData";

const values = [
  { icon: Leaf, title: "Bền vững", desc: "Chúng tôi cam kết chỉ cung cấp cây cảnh được nhân giống và chăm sóc theo quy trình thân thiện với môi trường, không hóa chất độc hại." },
  { icon: Plant, title: "Tươi sáng", desc: "Mỗi chậu cây PAP mang theo một nguồn năng lượng tích cực, biến không gian sống của bạn thành một góc thiên nhiên xanh mát và tươi mới." },
  { icon: Heart, title: "Tận tâm", desc: "Đội ngũ PAP luôn sẵn sàng tư vấn, hỗ trợ khách hàng từ khi chọn cây cho đến khi cây đơm hoa, với sự tận tâm và chuyên môn cao nhất." },
];

const stats = [
  { icon: Plant, value: "500+", label: "Loài cây có sẵn" },
  { icon: Users, value: "10.000+", label: "Khách hàng tin yêu" },
  { icon: Trophy, value: "5 năm", label: "Kinh nghiệm" },
  { icon: Heart, value: "98%", label: "Hài lòng sau mua" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-white py-24 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10"><Leaf size={120} weight="fill" /></div>
          <div className="absolute bottom-10 right-10"><Plant size={160} weight="fill" /></div>
          <div className="absolute top-1/2 left-1/3"><Leaf size={80} weight="fill" /></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Leaf size={16} weight="fill" /> Câu chuyện của chúng tôi
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Trồng một mầm xanh<br />
            <span className="text-secondary">đổi thay một không gian</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Plan A Plant (PAP) ra đời từ tình yêu cây cảnh và niềm tin rằng mỗi góc nhỏ của cuộc sống đều có thể trở nên tươi đẹp hơn với một mầm xanh.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black text-foreground mb-6 leading-tight">Hành trình <span className="text-primary">5 năm</span> gieo xanh</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              PAP khởi đầu từ năm 2020 với một vườn ươm nhỏ tại Bình Dương. Khi đại dịch khiến mọi người phải ở nhà nhiều hơn, chúng tôi nhận ra nhu cầu về cây xanh trong nhà tăng vọt — và theo đó là một khao khát kết nối với thiên nhiên.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Từ vài chục loài cây, PAP đã phát triển lên hơn 500 loài, phục vụ hơn 10.000 khách hàng trên toàn quốc. Nhưng điều chúng tôi tự hào nhất không phải là con số — mà là nụ cười của khách hàng khi nhận được chậu cây đầu tiên.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              Chúng tôi không đơn thuần là shop bán cây. Chúng tôi là người đồng hành trong hành trình tạo dựng không gian xanh của bạn.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=500&auto=format&fit=crop" alt="Vườn ươm PAP" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg mt-6">
              <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop" alt="Đội ngũ PAP" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg -mt-6">
              <img src="https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=500&auto=format&fit=crop" alt="Sản phẩm PAP" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=500&auto=format&fit=crop" alt="Cây PAP" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center text-white">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={28} weight="fill" />
                </div>
                <p className="text-3xl md:text-4xl font-black mb-1">{value}</p>
                <p className="text-white/70 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#F0F5F1]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-foreground mb-3">Giá trị cốt lõi</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">Ba giá trị này định hình mọi quyết định và hành động của chúng tôi mỗi ngày.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-5 shadow-md">
                  <Icon size={28} weight="fill" className="text-white" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">{title}</h3>
                <p className="text-foreground/60 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-foreground mb-3">Đội ngũ PAP</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">Những con người tâm huyết đằng sau từng chậu cây bạn nhận được.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="group text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 shadow-lg border-4 border-transparent group-hover:border-secondary transition-all duration-300">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="font-bold text-foreground">{member.name}</p>
              <p className="text-primary text-sm font-semibold mb-2">{member.role}</p>
              <p className="text-xs text-foreground/50 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Sẵn sàng trồng mầm xanh?</h2>
          <p className="text-foreground/70 mb-8">Khám phá hơn 500 loài cây cảnh từ PAP và tìm ra người bạn xanh lý tưởng cho không gian của bạn.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-xl hover:-translate-y-1">
            Khám phá cửa hàng <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
