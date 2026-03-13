import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { CaretDown, CheckCircle, MapPin, Plus, Minus, CaretLeft, CaretRight, Star, ThumbsUp, Image as ImageIcon } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/ui/ProductCard";
import { productService } from "../services/productService";
import { planterApi } from "../services/apiService";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";
import type { Product } from "../types";
import { mockReviews } from "../data/mockData";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("care");
  const [planter, setPlanter] = useState("Không"); // Changed default to "Không"
  const [availablePlanters, setAvailablePlanters] = useState<any[]>([]); // New state for available planters
  const [pincode, setPincode] = useState("");
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

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

      if (productData.planterOptions && productData.planterOptions.length > 0) {
        try {
          const allPlanters = await planterApi.list();
          const filtered = allPlanters.filter((p: any) => productData.planterOptions.includes(p.id));
          setAvailablePlanters(filtered);
          if (filtered.length > 0) {
            setPlanter(`Có (Kèm ${filtered[0].name})`);
          }
        } catch (error) {
          console.error("Failed to fetch planters", error);
        }
      }

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
    
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/signin");
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      planter: planter,
      quantity: quantity,
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
                <span className="block text-sm font-semibold mb-2">Chậu đi kèm</span>
                <div className="relative border border-border rounded-md bg-white">
                  <select
                    value={planter}
                    onChange={(e) => setPlanter(e.target.value)}
                    className="appearance-none outline-none py-2 pl-4 pr-10 bg-transparent text-foreground cursor-pointer font-medium w-full"
                  >
                    <option value="Không">Không (Chỉ cây và chậu nhựa ươm)</option>
                    {availablePlanters.map(p => (
                      <option key={p.id} value={`Có (Kèm ${p.name})`}>Có (Kèm {p.name} {p.price ? `+${p.price.toLocaleString("vi-VN")}đ` : ""})</option>
                    ))}
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
               {activeTab === "reviews" && (() => {
                const productReviews = mockReviews.filter(r => r.productId === id);
                const avgRating = productReviews.length > 0 ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length : 0;
                const ratingCounts = [5, 4, 3, 2, 1].map(star => ({ star, count: productReviews.filter(r => r.rating === star).length }));
                return (
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-2xl">
                      <div className="text-center shrink-0">
                        <p className="text-6xl font-black text-primary">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                        <div className="flex justify-center gap-0.5 my-2">
                          {[1,2,3,4,5].map(s => <Star key={s} size={18} weight={avgRating >= s ? "fill" : "regular"} className={avgRating >= s ? "text-yellow-400" : "text-gray-200"} />)}
                        </div>
                        <p className="text-sm text-foreground/50">{productReviews.length} đánh giá</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {ratingCounts.map(({ star, count }) => (
                          <div key={star} className="flex items-center gap-2 text-sm">
                            <span className="w-4 text-foreground/60">{star}</span>
                            <Star size={12} weight="fill" className="text-yellow-400 shrink-0" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${productReviews.length > 0 ? (count / productReviews.length) * 100 : 0}%` }} />
                            </div>
                            <span className="w-4 text-foreground/60 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Cards */}
                    {productReviews.length === 0 ? (
                      <div className="text-center py-10">
                        <Star size={40} className="text-foreground/20 mx-auto mb-3" />
                        <p className="font-semibold text-foreground/60 mb-1">Chưa có đánh giá nào</p>
                        <p className="text-sm text-foreground/40">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {productReviews.map(review => (
                          <div key={review.id} className="border border-gray-100 rounded-2xl p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <img src={review.avatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border-2 border-secondary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-sm text-foreground">{review.userName}</p>
                                  {review.verified && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={10} weight="fill" />Đã mua hàng</span>}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={13} weight={review.rating >= s ? "fill" : "regular"} className={review.rating >= s ? "text-yellow-400" : "text-gray-200"} />)}
                                  <span className="text-xs text-foreground/40 ml-1">{review.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="font-semibold text-sm text-foreground mb-1">{review.title}</p>
                            <p className="text-sm text-foreground/70 leading-relaxed mb-3">{review.content}</p>
                            {review.images.length > 0 && (
                              <div className="flex gap-2 mb-3">
                                {review.images.map((img, i) => (
                                  <img key={i} src={img} alt="review" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {review.tags.map(tag => <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{tag}</span>)}
                            </div>
                            <button className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-primary transition-colors">
                              <ThumbsUp size={13} /> Hữu ích ({review.helpful})
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write Review CTA */}
                    <div className="border-t border-gray-100 pt-5 text-center">
                      <p className="text-sm text-foreground/60 mb-3">Bạn đã mua sản phẩm này?</p>
                      <button onClick={() => toast.info("Vui lòng đăng nhập để viết đánh giá")} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
                        <ImageIcon size={16} weight="fill" /> Viết đánh giá & Đăng ảnh thực tế
                      </button>
                    </div>
                  </div>
                );
              })()}
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
