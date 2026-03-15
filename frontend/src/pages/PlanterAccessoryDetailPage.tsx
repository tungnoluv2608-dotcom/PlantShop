import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, ShoppingCart } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { planterApi } from "../services/apiService";
import { useCartStore } from "../stores/cartStore";
import { toast } from "sonner";
import type { Planter } from "../types";

export default function PlanterAccessoryDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const addItem = useCartStore((s) => s.addItem);

  const isAccessoryRoute = location.pathname.startsWith("/accessories/");
  const expectedType: "planter" | "accessory" = isAccessoryRoute ? "accessory" : "planter";

  const [item, setItem] = useState<Planter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await planterApi.getById(id, expectedType);
        setItem(data as Planter);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id, expectedType]);

  const handleAddToCart = () => {
    if (!item) return;
    addItem({
      id: `${item.type}-${item.id}`,
      title: item.name,
      price: item.price,
      quantity: 1,
      image: item.imageUrl,
      planter: "",
    });
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
  };

  const backPath = expectedType === "accessory" ? "/accessories" : "/planters";

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6">
          <ArrowLeft size={16} weight="bold" /> Quay lại danh sách
        </Link>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notFound || !item ? (
          <div className="bg-white rounded-2xl border border-secondary p-10 text-center">
            <p className="text-xl font-bold text-foreground mb-2">Không tìm thấy sản phẩm</p>
            <p className="text-foreground/60 mb-5">Sản phẩm đã bị xóa hoặc không đúng loại.</p>
            <Link to={backPath} className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">
              Về trang danh sách
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl border border-secondary p-5 md:p-8 shadow-sm">
            <div className="rounded-2xl overflow-hidden border border-secondary bg-secondary/20">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover min-h-[320px]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.type === "accessory" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                  {item.type === "accessory" ? "Phụ kiện" : "Chậu cây"}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{item.material}</span>
                {!!item.accessoryBrand && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">{item.accessoryBrand}</span>
                )}
              </div>

              <h1 className="text-3xl font-black text-foreground mb-3">{item.name}</h1>
              <p className="text-3xl font-black text-primary mb-4">{item.price.toLocaleString("vi-VN")}đ</p>

              <p className={`inline-flex items-center text-sm font-semibold mb-5 ${item.inStock ? "text-green-600" : "text-red-600"}`}>
                {item.inStock ? "Còn hàng" : "Tạm hết hàng"}
              </p>

              {item.type === "planter" && item.sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-bold text-foreground mb-2">Kích thước</p>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size) => (
                      <span key={size} className="text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.type === "accessory" && (item.usageTags?.length || item.accessoryBrand) ? (
                <div className="mb-5 space-y-3">
                  {!!item.usageTags?.length && (
                    <div>
                      <p className="text-sm font-bold text-foreground mb-2">Công dụng</p>
                      <div className="flex flex-wrap gap-2">
                        {item.usageTags.map((tag) => (
                          <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <button
                onClick={handleAddToCart}
                disabled={!item.inStock}
                className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} weight="bold" /> Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
