import { ArrowRight } from "@phosphor-icons/react";

const categories = [
  { id: 1, name: "Bonsai", image: "https://images.unsplash.com/photo-1613143525642-45e079c65692?w=500&auto=format&fit=crop" },
  { id: 2, name: "Xương rồng", image: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop" },
  { id: 3, name: "Cây leo", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&auto=format&fit=crop" },
  { id: 4, name: "Sen đá", image: "https://images.unsplash.com/photo-1446071103084-22578be4bd07?w=500&auto=format&fit=crop" },
  { id: 5, name: "Hạt giống", image: "https://images.unsplash.com/photo-1594968411036-3a7cbab22fdb?w=500&auto=format&fit=crop" },
  { id: 6, name: "Quà tặng", image: "https://plus.unsplash.com/premium_photo-1675865396004-c7b8640bf4ad?w=500&auto=format&fit=crop" },
];

export function Categories() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Danh mục PlantWeb</h2>
          <button className="flex items-center gap-1 text-primary/80 font-semibold hover:text-primary transition-colors group">
            Xem tất cả
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center group cursor-pointer">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 shadow-sm border-4 border-transparent group-hover:border-secondary transition-all duration-300 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
              <span className="font-semibold text-gray-800 text-lg group-hover:text-primary transition-colors uppercase tracking-wider text-center">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
