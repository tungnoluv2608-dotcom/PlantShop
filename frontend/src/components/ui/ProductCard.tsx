import { Star } from "@phosphor-icons/react";

import { Link } from "react-router";

interface ProductCardProps {
  id?: string | number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  imageUrl?: string;
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  discount,
  imageUrl,
}: ProductCardProps) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
      {/* Image Container */}
      <Link to={`/product/${id || 1}`} className="relative aspect-square overflow-hidden bg-gray-50 p-6 flex items-center justify-center cursor-pointer group-hover:opacity-90 transition-opacity">
        {/* Placeholder for actual plant image, normally an <img> tag */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-32 h-40 bg-secondary rounded-b-full rounded-t-lg mx-auto group-hover:scale-105 transition-transform duration-500 shadow-inner"></div>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star size={12} weight="fill" />
            Giảm {discount}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${id || 1}`} className="hover:text-primary transition-colors inline-block mb-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{title}</h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="font-bold text-lg text-primary">{price.toLocaleString('vi-VN')} đ</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')} đ</span>
          )}
        </div>

        {/* Spacer to push button to bottom if title is short */}
        <div className="mt-auto">
          <Link
            to={`/product/${id || 1}`}
            className="block text-center w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Mua
          </Link>
        </div>
      </div>
    </div>
  );
}
