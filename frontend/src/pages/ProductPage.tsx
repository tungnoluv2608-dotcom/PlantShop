import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { CaretDown, CheckCircle, MapPin, Plus, Minus, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/ui/ProductCard";
import { productService } from "../services/productService";
import { useCartStore } from "../stores/cartStore";
import { toast } from "sonner";
import type { Product } from "../types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("care");
  const [planter, setPlanter] = useState("Có");
  const [pincode, setPincode] = useState("");
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const productId = id ?? "1";
      const [productData, related] = await Promise.all([
        productService.getProductById(productId),
        productService.getRelatedProducts(productId),
      ]);
      setProduct(productData);
      setRelatedProducts(related);
      setMainImageIndex(0);
      setQuantity(1);
      setActiveTab("care");
      setIsLoading(false);
    }
    fetchData();
  }, [id]);

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handlePrevImage = () => {
    if (!product) return;
    setMainImageIndex((i) => (i > 0 ? i - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setMainImageIndex((i) => (i < product.images.length - 1 ? i + 1 : 0));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      planter: planter,
    });
    toast.success("Đã thêm vào giỏ hàng!", {
      description: `${product.title} x${quantity}`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="flex flex-col gap-4">
              <div className="aspect-square bg-secondary/50 rounded-2xl animate-pulse" />
              <div className="flex gap-4 justify-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-20 bg-secondary/50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            {/* Info skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-10 bg-secondary/50 rounded-lg w-3/4 animate-pulse" />
              <div className="h-8 bg-secondary/50 rounded-lg w-1/3 animate-pulse" />
              <div className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
              <div className="h-14 bg-secondary/50 rounded-xl w-80 animate-pulse mt-4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy sản phẩm</h1>
          <p className="text-foreground/70">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const mainImage = product.images[mainImageIndex];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      <main>
        {/* Top Section: Product Details */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden shadow-md">
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="relative flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={handlePrevImage}
                  className="absolute left-0 p-1 bg-white/80 rounded-full shadow hover:bg-white text-primary z-10 cursor-pointer"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>

                <div className="flex gap-4 overflow-x-auto px-8 no-scrollbar">
                  {product.images.map((img, index) => (
                    <button 
                      key={index}
                      onClick={() => setMainImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${mainImageIndex === index ? 'border-primary' : 'border-transparent shadow-sm'}`}
                    >
                      <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextImage}
                  className="absolute right-0 p-1 bg-white/80 rounded-full shadow hover:bg-white text-primary z-10 cursor-pointer"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-foreground mb-4">{product.title}</h1>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">{product.price.toLocaleString('vi-VN')} đ</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">{product.originalPrice.toLocaleString('vi-VN')} đ</span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-1">-{product.discount}</span>
              )}
            </div>

            <p className="text-foreground/80 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-8 mb-8">
              {/* Quantity */}
              <div>
                <span className="block text-sm font-semibold mb-2">Số lượng</span>
                <div className="flex items-center border border-border rounded-md bg-white">
                  <button onClick={decreaseQuantity} className="p-2 hover:bg-gray-50 text-foreground cursor-pointer">
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={increaseQuantity} className="p-2 hover:bg-gray-50 text-foreground cursor-pointer">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

               {/* Include Planter */}
               <div>
                <span className="block text-sm font-semibold mb-2">Kèm theo chậu</span>
                <div className="relative border border-border rounded-md bg-white">
                  <select
                    value={planter}
                    onChange={(e) => setPlanter(e.target.value)}
                    className="appearance-none outline-none py-2 pl-4 pr-10 bg-transparent text-foreground cursor-pointer font-medium"
                  >
                    <option value="Có">Có</option>
                    <option value="Không">Không</option>
                  </select>
                  <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" />
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full sm:w-80 bg-primary text-primary-foreground font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mb-10 cursor-pointer"
            >
              Thêm vào giỏ hàng
            </button>

            {/* Delivery Section */}
            <div className="border-t border-border pt-8">
              <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Kiểm tra giao hàng
              </h3>
              <p className="text-sm text-foreground/70 mb-4">Nhập quận/huyện hoặc mã bưu điện để xem thời gian giao hàng.</p>
              
              <div className="flex items-center gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Ví dụ: Quận 1, 70000..." 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 bg-white border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button 
                  onClick={() => setIsCheckingDelivery(true)}
                  className="font-bold text-primary tracking-wide hover:text-primary/80 transition-colors cursor-pointer"
                >
                  KIỂM TRA
                </button>
              </div>

              {isCheckingDelivery && (
                <div className="bg-white border border-border rounded-md p-4 text-sm text-foreground/80 shadow-sm">
                  <p className="font-semibold text-primary flex items-center gap-1 mb-1">
                    <CheckCircle size={16} weight="fill" /> Có hỗ trợ giao hàng tới khu vực này.
                  </p>
                  <p>Thời gian giao hàng dự kiến: 2-3 ngày làm việc (Giao hàng tiêu chuẩn).</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Middle Section: Specs/Tabs */}
        <div className="w-full bg-primary py-16 mt-8 relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            {/* Tabs */}
            <div className="flex items-center justify-center gap-8 md:gap-16 border-b border-primary-foreground/20 pb-4 mb-8">
              <button 
                onClick={() => setActiveTab("care")}
                className={`font-bold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "care" ? "text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/80"}`}
              >
                {activeTab === "care" && <CaretDown weight="fill" />} 
                Hướng dẫn chăm sóc
              </button>
              <button 
                onClick={() => setActiveTab("bio")}
                className={`font-bold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "bio" ? "text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/80"}`}
              >
                {activeTab === "bio" && <CaretDown weight="fill" />}
                Thông tin cây
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`font-bold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "reviews" ? "text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/80"}`}
              >
                {activeTab === "reviews" && <CaretDown weight="fill" />}
                Đánh giá
              </button>
            </div>

            {/* Tab Content Card */}
            <div className="bg-background rounded-2xl shadow-2xl p-8 md:p-10 mb-8 max-w-4xl mx-auto">
              {activeTab === "care" && (
                <div className="space-y-8">
                  {product.careGuide && product.careGuide.length > 0 ? (
                    product.careGuide.map((guide, index) => (
                      <div key={index}>
                        <h3 className="font-bold text-foreground text-xl mb-2">{guide.title}</h3>
                        <p className="text-foreground/80 leading-relaxed">{guide.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/80">Hướng dẫn chăm sóc cho sản phẩm này đang được cập nhật.</p>
                  )}
                </div>
              )}
               {activeTab === "bio" && (
                <div className="text-foreground/80 leading-relaxed">
                  <p>{product.bio || "Thông tin sinh học của cây đang được cập nhật. Vui lòng quay lại sau."}</p>
                </div>
              )}
               {activeTab === "reviews" && (
                <div className="text-foreground/80 leading-relaxed text-center py-8">
                  <p className="text-lg font-medium mb-2">Chưa có đánh giá nào</p>
                  <p>Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: You may also like */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 pb-24">
            <div className="text-center mb-12 relative overflow-hidden">
              <h2 className="text-4xl font-black text-foreground relative z-10 inline-block bg-background px-4">
                Có thể bạn sẽ thích...
              </h2>
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -z-0"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard 
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  discount={item.discount}
                  imageUrl={item.imageUrl}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
