import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { CategoryCard } from "../ui/CategoryCard";

export function BestSelling() {
  const navigate = useNavigate();

  const handleShopNow = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const handleViewAll = () => {
    navigate("/shop");
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Bán chạy nhất" 
          onViewAllClick={handleViewAll}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
          <CategoryCard 
            id="1"
            title="Cây trong nhà" 
            price={150000}
            imageUrl="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop" 
            onShopClick={() => handleShopNow("Cây trong nhà")}
          />
          <CategoryCard 
            id="2"
            title="Dịch lọc không khí" 
            price={250000}
            imageUrl="https://images.unsplash.com/photo-1545241047-6083a36a1c08?w=500&auto=format&fit=crop" 
            onShopClick={() => handleShopNow("Dịch lọc không khí")}
          />
          <CategoryCard 
            id="3"
            title="Cây có hoa" 
            price={180000}
            imageUrl="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=500&auto=format&fit=crop" 
            onShopClick={() => handleShopNow("Cây có hoa")}
          />
        </div>
      </div>
    </section>
  );
}
