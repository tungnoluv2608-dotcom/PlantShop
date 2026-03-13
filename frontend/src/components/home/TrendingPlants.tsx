import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { ProductCard } from "../ui/ProductCard";
import { products } from "../../data/mockData";

// Get 8 products for the "Trending" section
const trendingProducts = products.slice(0, 8);

export function TrendingPlants() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/shop?sort=trending");
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Cây trồng xu hướng" 
          onViewAllClick={handleViewAll}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {trendingProducts.map(product => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
