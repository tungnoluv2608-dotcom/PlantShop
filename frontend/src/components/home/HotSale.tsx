import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { ProductCard } from "../ui/ProductCard";
import { products } from "../../data/mockData";

// Get products that have discounts for the "Hot Sale" section
const hotProducts = products.filter((p) => p.discount).slice(0, 4);

export function HotSale() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/shop?filter=sale");
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Khuyến mãi Hot" 
          onViewAllClick={handleViewAll}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {hotProducts.map(product => (
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
