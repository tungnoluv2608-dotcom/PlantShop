import { ArrowRight } from "@phosphor-icons/react";

interface SectionHeaderProps {
  title: string;
  onViewAllClick?: () => void;
}

export function SectionHeader({ title, onViewAllClick }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
        {title}
      </h2>
      
      {onViewAllClick && (
        <button 
          onClick={onViewAllClick}
          className="text-primary/80 font-semibold hover:text-primary transition-colors flex items-center gap-1 group cursor-pointer"
        >
          Xem tất cả
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
