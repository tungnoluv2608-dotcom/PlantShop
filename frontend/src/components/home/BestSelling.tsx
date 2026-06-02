import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { CategoryCard } from "../ui/CategoryCard";
import { productService } from "../../services/productService";
import type { Product } from "../../types";
import { StaggerContainer, StaggerItem } from "../motion";
import { ProductCardSkeleton } from "../ui/Skeletons";

export function BestSelling() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts({ sort: "best-selling", page: 1, pageSize: 3 })
      .then((result) => {
        setProducts(result.products);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
            <ProductCardSkeleton count={3} />
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <CategoryCard
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  onShopClick={() => handleShopNow(product.category)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
