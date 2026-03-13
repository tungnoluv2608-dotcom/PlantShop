import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { CaretRight, CaretDown, Spinner } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/ui/ProductCard";
import { productService } from "../services/productService";
import type { Product } from "../types";
import forestPattern from "../assets/forest_pattern.jpg";

import { api } from "../services/apiService";

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

const priceRanges = [
  { label: "Tất cả", min: undefined, max: undefined },
  { label: "Dưới 200,000đ", min: 0, max: 200000 },
  { label: "200,000đ - 400,000đ", min: 200000, max: 400000 },
  { label: "Trên 400,000đ", min: 400000, max: undefined },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(searchParams.get("category") || undefined);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);

  const PAGE_SIZE = 6;

  useEffect(() => {
    api.get<Category[]>("/categories").then((res) => {
      setCategoryTree(res.data);
      const initialOpen = res.data.reduce((acc, cat) => {
        acc[cat.name] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setOpenCategories(initialOpen);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setPage(1);
      const range = priceRanges[selectedPriceRange];
      const result = await productService.getProducts({
        category: selectedCategory,
        minPrice: range.min,
        maxPrice: range.max,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setProducts(result.products);
      setTotal(result.total);
      setIsLoading(false);
    }
    fetchProducts();
  }, [selectedCategory, selectedPriceRange]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const range = priceRanges[selectedPriceRange];
    const result = await productService.getProducts({
      category: selectedCategory,
      minPrice: range.min,
      maxPrice: range.max,
      page: nextPage,
      pageSize: PAGE_SIZE,
    });
    setProducts((prev) => [...prev, ...result.products]);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const toggleCategoryGroup = (name: string) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const hasMore = products.length < total;

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow w-full">
        {/* Top Banner */}
        <div 
          className="w-full h-48 md:h-64 bg-primary relative flex items-center justify-center overflow-hidden"
          style={{ 
            backgroundImage: `url(${forestPattern})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <h1 className="relative z-10 text-white text-5xl md:text-6xl font-black tracking-widest uppercase shadow-sm">
            CỬA HÀNG
          </h1>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
            
            {/* Categories */}
            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                onClick={() => handleCategorySelect(undefined)}
                className={`flex items-center gap-2 mb-4 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left ${!selectedCategory ? "text-primary" : "text-foreground"}`}
              >
                <CaretRight size={16} weight="bold" />
                <span className="text-lg">Tất cả danh mục</span>
              </button>
              
              <div className="ml-6 flex flex-col gap-3">
                {categoryTree.map((group) => (
                  <div key={group.name}>
                    <button
                      className="flex items-center gap-2 font-semibold text-foreground/80 cursor-pointer hover:text-primary transition-colors w-full text-left"
                      onClick={() => toggleCategoryGroup(group.name)}
                    >
                      <CaretDown size={14} weight="bold" className={`transition-transform ${openCategories[group.name] ? '' : '-rotate-90'}`} />
                      {group.name}
                    </button>
                    
                    {openCategories[group.name] && group.subcategories.length > 0 && (
                      <div className="ml-6 flex flex-col gap-3 text-sm text-foreground/70 mt-2">
                        {group.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleCategorySelect(sub)}
                            className={`cursor-pointer hover:text-primary transition-colors text-left ${selectedCategory === sub ? "text-primary font-semibold" : ""}`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="flex justify-between items-center w-full cursor-pointer hover:text-primary transition-colors"
              >
                <span className="font-bold text-foreground">Phân loại giá</span>
                <CaretDown size={16} className={`transition-transform ${isPriceOpen ? "rotate-180" : ""}`} />
              </button>
              {isPriceOpen && (
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPriceRange === index}
                        onChange={() => setSelectedPriceRange(index)}
                        className="w-4 h-4 text-primary bg-white border-gray-300 focus:ring-primary cursor-pointer"
                      />
                      <span className={`group-hover:text-primary transition-colors ${selectedPriceRange === index ? "text-primary font-medium" : "text-foreground/80"}`}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="flex-1 flex flex-col">
            {/* Results count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-foreground/70">
                {isLoading ? "Đang tải..." : `Hiển thị ${products.length} / ${total} sản phẩm`}
                {selectedCategory && <span className="font-semibold text-primary ml-1">— {selectedCategory}</span>}
              </p>
              {selectedCategory && (
                <button
                  onClick={() => handleCategorySelect(undefined)}
                  className="text-sm text-primary font-semibold hover:text-primary/80 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-[380px] animate-pulse">
                    <div className="aspect-square bg-secondary/30" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-secondary/30 rounded w-3/4" />
                      <div className="h-5 bg-secondary/30 rounded w-1/3" />
                      <div className="h-10 bg-secondary/30 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-secondary">
                <p className="text-lg font-medium text-foreground/70">Không tìm thấy sản phẩm nào.</p>
                <button
                  onClick={() => handleCategorySelect(undefined)}
                  className="mt-4 text-primary font-semibold hover:text-primary/80 cursor-pointer"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {hasMore && (
                  <div className="flex justify-center mt-12 mb-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 font-bold text-foreground/70 hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <Spinner size={16} className="animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          Tải thêm <CaretDown size={16} weight="bold" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
