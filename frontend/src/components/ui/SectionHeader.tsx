import { ArrowRight } from "@phosphor-icons/react";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
        {title}
        <ArrowRight size={24} className="text-primary" weight="bold" />
      </h2>
    </div>
  );
}
