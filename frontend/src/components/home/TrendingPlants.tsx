import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { ProductCard } from "../ui/ProductCard";
import { productService } from "../../services/productService";
import type { Product } from "../../types";

export function TrendingPlants() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService
      .getProducts({ sort: "trending", page: 1, pageSize: 8 })
      .then((result) => {
        setProducts(result.products);
      })
      .catch(() => {
        setProducts([]);
      });
  }, []);

  const handleViewAll = () => {
    navigate("/shop?sort=trending");
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Cây trồng xu hướng" 
          onViewAllClick={handleViewAll}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {products.map((product) => (
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
