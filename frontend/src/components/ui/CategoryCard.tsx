interface CategoryCardProps {
  title: string;
  onShopClick?: () => void;
  imageUrl?: string;
}

export function CategoryCard({ title, onShopClick, imageUrl }: CategoryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl group cursor-pointer border border-gray-100 h-64 shadow-sm hover:shadow-lg transition-all">
      {/* Background Image / Placeholder */}
      <div className="absolute inset-0 bg-secondary transition-transform duration-500 group-hover:scale-105">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        )}
      </div>
      
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex justify-between items-end">
        <h3 className="text-white font-bold text-xl drop-shadow-md w-1/2">{title}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onShopClick?.(); }}
          className="px-4 py-2 bg-white/90 hover:bg-white text-primary font-semibold text-sm rounded-lg backdrop-blur-sm transition-colors"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
