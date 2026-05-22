import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { ProductCard } from "../ui/ProductCard";
import { productService } from "../../services/productService";
import type { Product } from "../../types";

export function HotSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService
      .getProducts({ sort: "sale", saleOnly: true, page: 1, pageSize: 4 })
      .then((result) => {
        setProducts(result.products);
      })
      .catch(() => {
        setProducts([]);
      });
  }, []);

  const handleViewAll = () => {
    navigate("/shop?filter=sale");
  };

  return (
    <section className="py-16 bg-secondary/28">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Khuyến mãi Hot" 
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
