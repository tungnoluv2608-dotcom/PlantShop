import { useState, useEffect } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { productService } from "../../services/productService";
import type { Category } from "../../types";
import { StaggerContainer, StaggerItem } from "../motion";
import { CategoryCardSkeleton } from "../ui/Skeletons";

const fallbackCategories: Category[] = [
  { id: "1", name: "Cây trong nhà", image: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=500&auto=format&fit=crop" },
  { id: "2", name: "Sen đá", image: "https://images.unsplash.com/photo-1519068261745-b3f8ecd6b8d9?w=500&auto=format&fit=crop" },
  { id: "3", name: "Xương rồng", image: "https://images.unsplash.com/photo-1498408040764-ab6eb772a145?w=500&auto=format&fit=crop" },
  { id: "4", name: "Cây leo", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop" },
  { id: "5", name: "Bonsai", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=500&auto=format&fit=crop" },
  { id: "6", name: "Hạt giống", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
];

export function Categories() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService.getCategories()
      .then((data) => {
        setCats(data && data.length > 0 ? data : fallbackCategories);
      })
      .catch(() => {
        setCats(fallbackCategories);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  const handleViewAll = () => {
    navigate("/shop");
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Danh mục PlantWeb</h2>
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-primary/80 font-semibold hover:text-primary transition-colors group cursor-pointer"
          >
            Xem tất cả
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
            <CategoryCardSkeleton count={6} />
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
            {cats.map((cat) => (
              <StaggerItem key={cat.id}>
                <div
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-transparent shadow-[0_22px_40px_-28px_rgba(36,53,42,0.8)] transition-all duration-300 group-hover:border-secondary md:h-40 md:w-40">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <span className="text-center text-lg font-semibold uppercase tracking-wider text-foreground transition-colors group-hover:text-primary">
                    {cat.name}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
