import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { SectionHeader } from "../ui/SectionHeader";
import { ProductCard } from "../ui/ProductCard";
import { productService } from "../../services/productService";
import type { Product } from "../../types";
import { StaggerContainer, StaggerItem } from "../motion";
import { ProductCardSkeleton } from "../ui/Skeletons";

export function HotSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts({ sort: "sale", saleOnly: true, page: 1, pageSize: 4 })
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <ProductCardSkeleton count={4} />
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  imageUrl={product.imageUrl}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
