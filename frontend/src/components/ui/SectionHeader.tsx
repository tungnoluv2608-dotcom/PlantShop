import { ArrowRight } from "@phosphor-icons/react";

interface SectionHeaderProps {
  title: string;
  onViewAllClick?: () => void;
}

export function SectionHeader({ title, onViewAllClick }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
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
