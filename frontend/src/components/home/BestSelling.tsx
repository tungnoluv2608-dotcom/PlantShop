import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { CategoryCard } from "../ui/CategoryCard";
import { productService } from "../../services/productService";
import type { Product } from "../../types";

export function BestSelling() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService
      .getProducts({ sort: "best-selling", page: 1, pageSize: 3 })
      .then((result) => {
        setProducts(result.products);
      })
      .catch(() => {
        setProducts([]);
      });
  }, []);

  const handleShopNow = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const handleViewAll = () => {
    navigate("/shop");
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Bán chạy nhất" 
          onViewAllClick={handleViewAll}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
          {products.map((product) => (
            <CategoryCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              onShopClick={() => handleShopNow(product.category)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
