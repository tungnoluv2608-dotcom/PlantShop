import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { CaretRight, CaretDown, ShoppingCart } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { planterApi } from "../services/apiService";
import { useCartStore } from "../stores/cartStore";
import { toast } from "sonner";
import type { Planter } from "../types";
import forestPattern from "../assets/forest_pattern.jpg";

const priceRanges = [
  { label: "Tất cả", min: undefined, max: undefined },
  { label: "Dưới 100,000đ", min: 0, max: 100000 },
  { label: "100,000đ - 300,000đ", min: 100000, max: 300000 },
  { label: "Trên 300,000đ", min: 300000, max: undefined },
];

export default function PlantersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [filteredPlanters, setFilteredPlanters] = useState<Planter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(searchParams.get("material") || undefined);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchPlanters() {
      setIsLoading(true);
      try {
        const data = await planterApi.list("planter");
        setPlanters(data);
      } catch {
        toast.error("Không thể tải danh sách chậu");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlanters();
  }, []);

  useEffect(() => {
    const mat = searchParams.get("material");
    setSelectedMaterial(mat || undefined);
  }, [searchParams]);

  const materials = useMemo(() => {
    return Array.from(new Set(planters.map((item) => item.material).filter(Boolean)));
  }, [planters]);

  useEffect(() => {
    let result = planters;

    // Filter by IN STOCK
    result = result.filter(p => p.inStock);

    // Filter by material
    if (selectedMaterial) {
      result = result.filter(p => 
        p.material.toLowerCase() === selectedMaterial.toLowerCase() || 
        p.name.toLowerCase().includes(selectedMaterial.toLowerCase())
      );
    }

    // Filter by price
    const range = priceRanges[selectedPriceRange];
    if (range.min !== undefined) {
      result = result.filter(p => p.price >= range.min!);
    }
    if (range.max !== undefined) {
      result = result.filter(p => p.price <= range.max!);
    }

    setFilteredPlanters(result);
  }, [planters, selectedMaterial, selectedPriceRange]);


  const handleMaterialSelect = (material: string | undefined) => {
    setSelectedMaterial(material);
    if (material) {
      setSearchParams({ material });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = (planter: Planter) => {
    addItem({
      id: `planter-${planter.id}`,
      title: planter.name,
      price: planter.price,
      quantity: 1,
      image: planter.imageUrl,
      planter: "" // Nó tự là chậu rồi nên ko kèm chậu khác
    });
    toast.success(`Đã thêm ${planter.name} vào giỏ`, {
      description: "Có thể thanh toán ngay bây giờ.",
    });
  };

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
          <h1 className="relative z-10 text-white text-4xl md:text-5xl font-black tracking-widest uppercase shadow-sm text-center px-4">
            CHẬU & PHỤ KIỆN
          </h1>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
            
            {/* Filter Group */}
            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                onClick={() => handleMaterialSelect(undefined)}
                className={`flex items-center gap-2 mb-4 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left ${!selectedMaterial ? "text-primary" : "text-foreground"}`}
              >
                <CaretRight size={16} weight="bold" />
                <span className="text-lg">Tất cả chậu cây</span>
              </button>
              
              <div className="ml-6 flex flex-col gap-3">
                <button
                  className="flex items-center gap-2 font-semibold text-foreground/80 cursor-pointer hover:text-primary transition-colors w-full text-left"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <CaretDown size={14} weight="bold" className={`transition-transform ${isFilterOpen ? '' : '-rotate-90'}`} />
                  Chất liệu chậu
                </button>
                
                {isFilterOpen && (
                  <div className="ml-5 flex flex-col gap-2.5 mt-1 border-l-2 border-primary/20 pl-4 py-1">
                    {materials.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => handleMaterialSelect(mat)}
                        className={`text-sm text-left hover:text-primary transition-colors cursor-pointer ${
                          selectedMaterial === mat ? "text-primary font-bold" : "text-foreground/70"
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                className="flex items-center gap-2 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left"
                onClick={() => setIsPriceOpen(!isPriceOpen)}
              >
                <CaretDown size={16} weight="bold" className={`transition-transform ${isPriceOpen ? '' : '-rotate-90'}`} />
                <span className="text-lg">Khoảng giá</span>
              </button>
              
              {isPriceOpen && (
                <div className="mt-4 flex flex-col gap-3 ml-6">
                  {priceRanges.map((range, idx) => (
                    <label 
                      key={idx} 
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input 
                        type="radio" 
                        name="priceRangePlanters"
                        checked={selectedPriceRange === idx}
                        onChange={() => setSelectedPriceRange(idx)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                      />
                      <span className={`text-sm group-hover:text-primary transition-colors ${selectedPriceRange === idx ? 'text-primary font-semibold' : 'text-foreground/70'}`}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Product Grid */}
          <div className="flex-grow">
            {/* Active Filters Display */}
            {selectedMaterial && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm font-medium text-foreground/70">Đang chọn:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                  {selectedMaterial}
                  <button 
                    onClick={() => handleMaterialSelect(undefined)}
                    className="ml-2 hover:text-primary/70 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {/* View controls */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-foreground/70 font-medium">
                Hiển thị <span className="text-foreground font-bold">{filteredPlanters.length}</span> chậu cây
              </p>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPlanters.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-secondary">
                <p className="text-xl text-foreground font-semibold mb-2">Không có sản phẩm nào!</p>
                <p className="text-foreground/60">Vui lòng thử điều kiện lộc khác.</p>
                <button 
                  onClick={() => {
                    handleMaterialSelect(undefined);
                    setSelectedPriceRange(0);
                  }}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Xoá bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlanters.map((product) => (
                  <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-secondary/50 flex flex-col h-full hover:-translate-y-1">
                    <div className="aspect-square bg-secondary/30 relative overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.material && (
                          <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {product.material}
                          </span>
                        )}
                      </div>
                    </div>
                
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                
                      {product.sizes && product.sizes.length > 0 && (
                        <p className="text-xs text-foreground/50 mb-3 line-clamp-1">
                          Kích thước: {product.sizes.join(', ')}
                        </p>
                      )}
                
                      <div className="mt-auto flex items-end justify-between pt-4">
                        <span className="font-extrabold text-primary text-lg">
                          {product.price.toLocaleString('vi-VN')} đ
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer z-10"
                        >
                          <ShoppingCart size={18} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
