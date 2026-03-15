import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { CaretDown, CaretRight, ShoppingCart } from "@phosphor-icons/react";
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

export default function AccessoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accessories, setAccessories] = useState<Planter[]>([]);
  const [filteredAccessories, setFilteredAccessories] = useState<Planter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(searchParams.get("group") || undefined);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(searchParams.get("brand") || undefined);
  const [selectedUsage, setSelectedUsage] = useState<string | undefined>(searchParams.get("usage") || undefined);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isUsageOpen, setIsUsageOpen] = useState(true);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchAccessories() {
      setIsLoading(true);
      try {
        const data = await planterApi.list("accessory");
        setAccessories(data);
      } catch {
        toast.error("Không thể tải danh sách phụ kiện");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAccessories();
  }, []);

  useEffect(() => {
    const grp = searchParams.get("group");
    const brand = searchParams.get("brand");
    const usage = searchParams.get("usage");
    setSelectedGroup(grp || undefined);
    setSelectedBrand(brand || undefined);
    setSelectedUsage(usage || undefined);
  }, [searchParams]);

  const materialGroups = useMemo(() => {
    return Array.from(new Set(accessories.map((item) => item.material).filter(Boolean)));
  }, [accessories]);

  const brandOptions = useMemo(() => {
    return Array.from(new Set(accessories.map((item) => item.accessoryBrand || "").filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
  }, [accessories]);

  const usageOptions = useMemo(() => {
    return Array.from(new Set(accessories.flatMap((item) => item.usageTags || []).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
  }, [accessories]);

  useEffect(() => {
    let result = accessories;

    result = result.filter((item) => item.inStock);

    if (selectedGroup) {
      result = result.filter((item) => item.material.toLowerCase() === selectedGroup.toLowerCase());
    }

    if (selectedBrand) {
      result = result.filter((item) => (item.accessoryBrand || "").toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedUsage) {
      result = result.filter((item) => (item.usageTags || []).some((tag) => tag.toLowerCase() === selectedUsage.toLowerCase()));
    }

    const range = priceRanges[selectedPriceRange];
    if (range.min !== undefined) {
      result = result.filter((item) => item.price >= range.min);
    }
    if (range.max !== undefined) {
      result = result.filter((item) => item.price <= range.max);
    }

    setFilteredAccessories(result);
  }, [accessories, selectedGroup, selectedBrand, selectedUsage, selectedPriceRange]);

  const updateQueryParams = (group?: string, brand?: string, usage?: string) => {
    const params = new URLSearchParams();
    if (group) params.set("group", group);
    if (brand) params.set("brand", brand);
    if (usage) params.set("usage", usage);
    setSearchParams(params);
  };

  const handleGroupSelect = (group: string | undefined) => {
    updateQueryParams(group, selectedBrand, selectedUsage);
  };

  const handleBrandSelect = (brand: string | undefined) => {
    updateQueryParams(selectedGroup, brand, selectedUsage);
  };

  const handleUsageSelect = (usage: string | undefined) => {
    updateQueryParams(selectedGroup, selectedBrand, usage);
  };

  const handleAddToCart = (item: Planter) => {
    addItem({
      id: `accessory-${item.id}`,
      title: item.name,
      price: item.price,
      quantity: 1,
      image: item.imageUrl,
      planter: "",
    });
    toast.success(`Đã thêm ${item.name} vào giỏ`, {
      description: "Bạn có thể tiếp tục mua sắm hoặc thanh toán ngay.",
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow w-full">
        <div
          className="w-full h-48 md:h-64 bg-primary relative flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url(${forestPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <h1 className="relative z-10 text-white text-3xl md:text-5xl font-black tracking-wide uppercase shadow-sm text-center px-4">
            PHỤ KIỆN CHĂM CÂY
          </h1>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                onClick={() => handleGroupSelect(undefined)}
                className={`flex items-center gap-2 mb-4 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left ${
                  !selectedGroup ? "text-primary" : "text-foreground"
                }`}
              >
                <CaretRight size={16} weight="bold" />
                <span className="text-lg">Tất cả phụ kiện</span>
              </button>

              <div className="ml-6 flex flex-col gap-3">
                <button
                  className="flex items-center gap-2 font-semibold text-foreground/80 cursor-pointer hover:text-primary transition-colors w-full text-left"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <CaretDown size={14} weight="bold" className={`transition-transform ${isFilterOpen ? "" : "-rotate-90"}`} />
                  Nhóm phụ kiện
                </button>

                {isFilterOpen && (
                  <div className="ml-5 flex flex-col gap-2.5 mt-1 border-l-2 border-primary/20 pl-4 py-1">
                    {materialGroups.map((group) => (
                      <button
                        key={group}
                        onClick={() => handleGroupSelect(group)}
                        className={`text-sm text-left hover:text-primary transition-colors cursor-pointer ${
                          selectedGroup === group ? "text-primary font-bold" : "text-foreground/70"
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                className="flex items-center gap-2 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left"
                onClick={() => setIsBrandOpen(!isBrandOpen)}
              >
                <CaretDown size={16} weight="bold" className={`transition-transform ${isBrandOpen ? "" : "-rotate-90"}`} />
                <span className="text-lg">Thương hiệu</span>
              </button>

              {isBrandOpen && (
                <div className="mt-4 flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleBrandSelect(undefined)}
                    className={`text-sm text-left hover:text-primary transition-colors ${!selectedBrand ? "text-primary font-semibold" : "text-foreground/70"}`}
                  >
                    Tất cả thương hiệu
                  </button>
                  {brandOptions.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className={`text-sm text-left hover:text-primary transition-colors ${selectedBrand === brand ? "text-primary font-semibold" : "text-foreground/70"}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                className="flex items-center gap-2 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left"
                onClick={() => setIsUsageOpen(!isUsageOpen)}
              >
                <CaretDown size={16} weight="bold" className={`transition-transform ${isUsageOpen ? "" : "-rotate-90"}`} />
                <span className="text-lg">Công dụng</span>
              </button>

              {isUsageOpen && (
                <div className="mt-4 flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleUsageSelect(undefined)}
                    className={`text-sm text-left hover:text-primary transition-colors ${!selectedUsage ? "text-primary font-semibold" : "text-foreground/70"}`}
                  >
                    Tất cả công dụng
                  </button>
                  {usageOptions.map((usage) => (
                    <button
                      key={usage}
                      onClick={() => handleUsageSelect(usage)}
                      className={`text-sm text-left hover:text-primary transition-colors ${selectedUsage === usage ? "text-primary font-semibold" : "text-foreground/70"}`}
                    >
                      {usage}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#fcfaf5] p-5 rounded-2xl shadow-sm border border-secondary">
              <button
                className="flex items-center gap-2 font-bold cursor-pointer hover:text-primary transition-colors w-full text-left"
                onClick={() => setIsPriceOpen(!isPriceOpen)}
              >
                <CaretDown size={16} weight="bold" className={`transition-transform ${isPriceOpen ? "" : "-rotate-90"}`} />
                <span className="text-lg">Khoảng giá</span>
              </button>

              {isPriceOpen && (
                <div className="mt-4 flex flex-col gap-3 ml-6">
                  {priceRanges.map((range, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="priceRangeAccessories"
                        checked={selectedPriceRange === idx}
                        onChange={() => setSelectedPriceRange(idx)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                      />
                      <span
                        className={`text-sm group-hover:text-primary transition-colors ${
                          selectedPriceRange === idx ? "text-primary font-semibold" : "text-foreground/70"
                        }`}
                      >
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow">
            {(selectedGroup || selectedBrand || selectedUsage) && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm font-medium text-foreground/70">Đang chọn:</span>
                {selectedGroup && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                    Nhóm: {selectedGroup}
                    <button onClick={() => handleGroupSelect(undefined)} className="ml-2 hover:text-primary/70 cursor-pointer">×</button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-200">
                    Thương hiệu: {selectedBrand}
                    <button onClick={() => handleBrandSelect(undefined)} className="ml-2 hover:text-indigo-500 cursor-pointer">×</button>
                  </span>
                )}
                {selectedUsage && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold border border-amber-200">
                    Công dụng: {selectedUsage}
                    <button onClick={() => handleUsageSelect(undefined)} className="ml-2 hover:text-amber-500 cursor-pointer">×</button>
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <p className="text-foreground/70 font-medium">
                Hiển thị <span className="text-foreground font-bold">{filteredAccessories.length}</span> phụ kiện
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-secondary">
                <p className="text-xl text-foreground font-semibold mb-2">Không có phụ kiện phù hợp!</p>
                <p className="text-foreground/60">Vui lòng thử điều kiện lọc khác.</p>
                <button
                  onClick={() => {
                    handleGroupSelect(undefined);
                    setSelectedPriceRange(0);
                  }}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccessories.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-secondary/50 flex flex-col h-full hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-secondary/30 relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                        {item.material && (
                          <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {item.material}
                          </span>
                        )}
                        {!!item.accessoryBrand && (
                          <span className="bg-indigo-100/95 backdrop-blur-sm text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {item.accessoryBrand}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      <p className="text-xs text-foreground/50 mb-2 line-clamp-2">Phụ kiện hỗ trợ chăm sóc cây và đất trồng.</p>

                      {!!item.usageTags?.length && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.usageTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-end justify-between pt-4">
                        <span className="font-extrabold text-primary text-lg">{item.price.toLocaleString("vi-VN")} đ</span>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleBrandSelect(undefined);
                            handleUsageSelect(undefined);
                            handleAddToCart(item);
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
