import { ArrowRight } from "@phosphor-icons/react";

export function HeroBanner() {
  return (
    <div className="container mx-auto px-6 md:px-12 py-8 mt-2">
      <div className="relative w-full h-[500px] md:h-[600px] rounded-[32px] overflow-hidden bg-secondary">
        {/* Placeholder for Hero Image */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/80 to-transparent z-10"></div>
        
        {/* Actual image placeholder */}
        <div className="absolute right-0 top-0 w-2/3 h-full">
            <div className="w-full h-full bg-cover bg-center opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1416879598555-081e6ae76d05?q=80&w=2069&auto=format&fit=crop')" }}></div>
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center h-full max-w-xl p-10 md:p-16 text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-lg">
            Trồng một <br/>
            mầm xanh
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground mb-10 max-w-sm drop-shadow">
            Khám phá bộ sưu tập cây cảnh tuyệt đẹp giúp không gian sống của bạn bừng sáng.
          </p>
          <button className="bg-white text-primary hover:bg-secondary px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 w-max transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Khám phá ngay <ArrowRight size={20} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
