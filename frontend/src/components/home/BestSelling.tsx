import { SectionHeader } from "../ui/SectionHeader";
import { CategoryCard } from "../ui/CategoryCard";

export function BestSelling() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader title="Bán chạy nhất" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
          <CategoryCard 
            title="Cây trong nhà" 
            imageUrl="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop" 
          />
          <CategoryCard 
            title="Dịch lọc không khí" 
            imageUrl="https://images.unsplash.com/photo-1545241047-6083a36a1c08?w=500&auto=format&fit=crop" 
          />
          <CategoryCard 
            title="Cây có hoa" 
            imageUrl="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=500&auto=format&fit=crop" 
          />
        </div>
      </div>
    </section>
  );
}
