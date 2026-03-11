export function LandscapePromo() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="bg-primary rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
          
          {/* Content Left */}
          <div className="p-10 md:p-16 md:w-1/2 flex flex-col justify-center text-white z-10 relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 flex items-center gap-4">
              Thiết kế cảnh quan
              <span className="text-secondary-foreground">✦</span>
            </h2>
            
            <p className="text-gray-300 text-lg mb-4 leading-relaxed max-w-lg">
              Cho dù là tự trồng thực phẩm hay thiết lập khu vườn trên sân thượng của bạn, 
              chúng tôi cung cấp các dịch vụ thiết kế cảnh quan chất lượng cao nhất, 
              góp phần mang lại một thế giới xanh hơn và cuộc sống bền vững hơn!
            </p>
            
            <p className="text-primary-foreground/80 text-sm font-medium italic mb-8">
              * Dịch vụ hiện chỉ có mặt tại một số khu vực nhất định.
            </p>

            <button className="bg-white text-primary hover:bg-secondary px-8 py-3 rounded-xl font-bold text-lg w-max transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Đặt lịch ngay!
            </button>
          </div>

          {/* Image Right */}
          <div className="md:w-1/2 min-h-[300px] md:min-h-full relative">
            <img 
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop" 
              alt="Landscape Gardening" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay to blend left to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent hidden md:block"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent block md:hidden"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
