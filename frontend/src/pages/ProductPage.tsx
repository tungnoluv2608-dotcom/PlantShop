import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { CaretDown, CheckCircle, MapPin, Plus, Minus, CaretLeft, CaretRight, Star, ThumbsUp, Image as ImageIcon, X } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/ui/ProductCard";
import { productService } from "../services/productService";
import { planterApi, reviewApi } from "../services/apiService";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { useImageUpload } from "../hooks/useImageUpload";
import { toast } from "sonner";
import type { Product, Review } from "../types";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewTagsInput, setReviewTagsInput] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false); // New state for purchase check
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const {
    triggerUpload: triggerReviewImageUpload,
    uploading: isUploadingReviewImages,
    error: reviewUploadError,
    InputElement: ReviewImageInput,
  } = useImageUpload({ multiple: true });

  async function loadReviews() {
    if (!id) return;
    setIsReviewLoading(true);
    try {
      const reviewData = await reviewApi.getByProduct(id);
      setReviews(reviewData);

      // Check purchase history if authenticated
      if (isAuthenticated) {
        const orders = await orderApi.getMyOrders();
        const bought = orders.some(o =>
          o.status === 'delivered' &&
          o.items.some(item => item.id === id)
        );
        setHasPurchased(bought);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setIsReviewLoading(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const productId = id ?? "1";

      const [productData, related] = await Promise.all([
        productService.getProductById(productId),
        productService.getRelatedProducts(productId),
      ]);

      await loadReviews(); // Call the new loadReviews function here

      setProduct(productData);
      setRelatedProducts(related);
      setMainImageIndex(0);
      setQuantity(1);
      setActiveTab("care");
      setReviewRating(5);
      setReviewTitle("");
      setReviewContent("");
      setReviewTagsInput("");
      setReviewImages([]);

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

  const reloadReviews = async () => {
    if (!id) return;
    setIsReviewLoading(true);
    try {
      const reviewData = await reviewApi.getByProduct(id);
      setReviews(reviewData);
    } finally {
      setIsReviewLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để viết đánh giá");
      navigate("/signin");
      return;
    }

    const title = reviewTitle.trim();
    const content = reviewContent.trim();
    const tags = reviewTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Vui lòng chọn số sao hợp lệ");
      return;
    }
    if (title.length < 3) {
      toast.error("Tiêu đề đánh giá tối thiểu 3 ký tự");
      return;
    }
    if (content.length < 10) {
      toast.error("Nội dung đánh giá tối thiểu 10 ký tự");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewApi.create({
        productId: id,
        rating: reviewRating,
        title,
        content,
        tags,
        images: reviewImages,
      });
      toast.success("Đã gửi đánh giá thành công");
      setReviewRating(5);
      setReviewTitle("");
      setReviewContent("");
      setReviewTagsInput("");
      setReviewImages([]);
      await reloadReviews();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Gửi đánh giá thất bại";
      toast.error(message);
    } finally {
      setIsSubmittingReview(false);
    }
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
                const productReviews = reviews;
                const avgRating = productReviews.length > 0 ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length : 0;
                const ratingCounts = [5, 4, 3, 2, 1].map(star => ({ star, count: productReviews.filter(r => r.rating === star).length }));
                return (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Rating Summary Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col lg:flex-row gap-12 items-center">
                      <div className="text-center shrink-0 min-w-[200px]">
                        <div className="relative inline-block mb-4">
                          <span className="text-8xl font-black bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent leading-none">
                            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                          </span>
                        </div>
                        <div className="flex justify-center gap-1.5 my-4">
                          {[1,2,3,4,5].map(s => (
                            <Star 
                              key={s} 
                              size={28} 
                              weight={avgRating >= s ? "fill" : "regular"} 
                              className={avgRating >= s ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-gray-100"} 
                            />
                          ))}
                        </div>
                        <p className="text-base font-medium text-foreground/40 uppercase tracking-widest">{productReviews.length} Đánh giá</p>
                      </div>
                      
                      <div className="flex-1 w-full max-w-xl space-y-4">
                        {ratingCounts.map(({ star, count }) => (
                          <div key={star} className="group flex items-center gap-4 text-sm">
                            <span className="w-4 font-bold text-foreground/40 group-hover:text-primary transition-colors">{star}</span>
                            <div className="flex-1 bg-gray-50 rounded-full h-3 overflow-hidden border border-gray-100/50">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.2)]" 
                                style={{ width: `${productReviews.length > 0 ? (count / productReviews.length) * 100 : 0}%` }} 
                              />
                            </div>
                            <span className="w-12 text-foreground/60 font-medium text-right">{count} b/v</span>
                          </div>
                        ))}
                      </div>

                      <div className="shrink-0 lg:border-l lg:pl-12 border-gray-100 text-center lg:text-left">
                        <h4 className="font-bold text-xl text-foreground mb-3">Thêm đánh giá của bạn</h4>
                        <p className="text-foreground/50 text-sm leading-relaxed max-w-[240px] mb-6">Chia sẻ trải nghiệm của bạn để giúp cộng đồng yêu cây chọn được sản phẩm ưng ý nhất.</p>
                        {isAuthenticated && hasPurchased && (
                          <button 
                            onClick={() => {
                              const el = document.getElementById('review-form');
                              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]"
                          >
                            Viết đánh giá ngay
                          </button>
                        )}
                      </div>
                    </div>

                    {isReviewLoading && (
                      <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Review Cards Grid */}
                    {!isReviewLoading && productReviews.length === 0 ? (
                      <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-50">
                          <Star size={40} weight="duotone" className="text-primary/30" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-foreground/40 max-w-xs mx-auto text-sm">Hãy là người đầu tiên sở hữu và chia sẻ cảm nhận về {product.title}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {productReviews.map(review => (
                          <div key={review.id} className="group bg-white border border-gray-50 p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img src={review.avatar} alt={review.userName} className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg shrink-0" />
                                  {review.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Đã mua hàng">
                                      <CheckCircle size={14} weight="fill" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-extrabold text-lg text-foreground leading-tight">{review.userName}</p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={14} weight={review.rating >= s ? "fill" : "regular"} className={review.rating >= s ? "text-yellow-400" : "text-gray-200"} />)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-foreground/20 uppercase tracking-widest">{review.date}</span>
                            </div>
                            
                            <h5 className="font-bold text-foreground mb-3 text-lg leading-snug group-hover:text-primary transition-colors">{review.title}</h5>
                            <p className="text-foreground/60 leading-relaxed text-sm mb-6">{review.content}</p>
                            
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-3 mb-6">
                                {review.images.map((img, i) => (
                                  <div key={i} className="relative group/img overflow-hidden rounded-2xl w-24 h-24 border border-gray-100 shadow-sm">
                                    <img src={img} alt="review" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                              <div className="flex flex-wrap gap-2">
                                {(review.tags || []).map(tag => (
                                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-secondary/50 text-primary-dark px-3 py-1 rounded-full font-black">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <button className="flex items-center gap-2 text-xs font-bold text-foreground/30 hover:text-primary transition-colors group/btn">
                                <ThumbsUp size={16} className="group-hover/btn:scale-125 transition-transform" />
                                <span>{review.helpful || 0}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write Review Form Section */}
                    <div id="review-form" className="pt-20 border-t border-gray-100">
                      <div className="max-w-3xl mx-auto">
                        {!isAuthenticated ? (
                          <div className="bg-gray-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
                             <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                              <X size={40} className="text-red-400" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-4">Bạn chưa đăng nhập</h3>
                            <p className="text-foreground/50 mb-8 max-w-sm mx-auto">Vui lòng đăng nhập để có thể chia sẻ đánh giá về sản phẩm này.</p>
                            <button
                              onClick={() => navigate("/signin")}
                              className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-md hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                              Đăng nhập ngay
                            </button>
                          </div>
                        ) : !hasPurchased ? (
                          <div className="bg-orange-50/50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-orange-200">
                             <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-orange-100">
                              <ShoppingCart size={40} className="text-orange-400" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-4">Chỉ dành cho khách mua hàng</h3>
                            <p className="text-foreground/50 mb-8 max-w-sm mx-auto italic">Tính năng đánh giá chỉ khả dụng sau khi bạn đã mua và nhận sản phẩm này thành công.</p>
                            <button
                              disabled
                              className="bg-gray-300 text-white px-10 py-4 rounded-2xl font-black text-md cursor-not-allowed"
                            >
                              Không đủ điều kiện đánh giá
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <div className="relative z-10">
                              <h3 className="text-3xl font-black text-foreground mb-2">Đánh giá sản phẩm</h3>
                              <p className="text-foreground/40 text-base mb-10">Bạn đang đánh giá cho: <span className="text-primary font-bold">{product.title}</span></p>

                              <div className="space-y-8">
                                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50 flex flex-col items-center gap-4">
                                  <p className="text-sm font-black text-foreground/30 uppercase tracking-[0.2em]">Trải nghiệm của bạn thế nào?</p>
                                  <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setReviewRating(star)}
                                        onClick={() => setReviewRating(star)}
                                        className="transform hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                                      >
                                        <Star
                                          size={48}
                                          weight={reviewRating >= star ? "fill" : "regular"}
                                          className={reviewRating >= star ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-gray-200"}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">
                                    {reviewRating === 5 ? "Tuyệt vời" : reviewRating === 4 ? "Rất hài lòng" : reviewRating === 3 ? "Bình thường" : reviewRating === 2 ? "Không hài lòng" : "Rất kém"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground/40 uppercase ml-2">Tiêu đề</label>
                                    <input
                                      value={reviewTitle}
                                      onChange={(e) => setReviewTitle(e.target.value)}
                                      placeholder="VD: Cây rất đẹp và tươi"
                                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-foreground/20"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground/40 uppercase ml-2">Từ khóa (Tags)</label>
                                    <input
                                      value={reviewTagsInput}
                                      onChange={(e) => setReviewTagsInput(e.target.value)}
                                      placeholder="Tươi, đẹp, đóng gói kỹ..."
                                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-foreground/20"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-black text-foreground/40 uppercase ml-2">Đánh giá chi tiết</label>
                                  <textarea
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder="Nội dung đánh giá của bạn giúp ích rất nhiều cho người mua sau..."
                                    rows={5}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-5 text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-foreground/20"
                                  />
                                </div>

                                <div className="bg-gray-50/50 p-8 rounded-3xl border border-dashed border-gray-200">
                                   <ReviewImageInput onSuccess={(urls) => setReviewImages((prev) => [...prev, ...urls].slice(0, 5))} />
                                   
                                   <div className="flex flex-col items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={triggerReviewImageUpload}
                                        disabled={isUploadingReviewImages || reviewImages.length >= 5}
                                        className="bg-white border border-gray-100 px-8 py-4 rounded-2xl shadow-sm font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-foreground/60 flex items-center gap-3 disabled:opacity-50"
                                      >
                                        <Camera size={20} weight="fill" className="text-primary" />
                                        {isUploadingReviewImages ? "Đang xử lý ảnh..." : "Tải lên hình ảnh thực tế"}
                                      </button>
                                      <p className="text-[10px] uppercase font-black text-foreground/20 tracking-widest text-center">Tối đa 5 ảnh định dạng JPG/PNG</p>
                                   </div>

                                  {reviewImages.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                                      {reviewImages.map((img, idx) => (
                                        <div key={`${img}-${idx}`} className="relative group/revimg">
                                          <img src={img} alt="review upload" className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white ring-1 ring-gray-100" />
                                          <button
                                            type="button"
                                            onClick={() => setReviewImages((prev) => prev.filter((_, i) => i !== idx))}
                                            className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform group-hover/revimg:scale-110 transition-all"
                                          >
                                            <X size={14} weight="bold" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {reviewUploadError && <p className="text-xs text-red-500 text-center mt-4 font-bold">{reviewUploadError}</p>}
                                </div>

                                <button
                                  onClick={handleSubmitReview}
                                  disabled={isSubmittingReview || isUploadingReviewImages}
                                  className="w-full group relative overflow-hidden bg-primary text-white h-16 rounded-2xl font-black text-lg shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                  <div className="flex items-center justify-center gap-3 relative z-10">
                                    {isSubmittingReview ? (
                                      <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Đang lưu đánh giá...
                                      </>
                                    ) : (
                                      <>Gửi Đánh Giá Ngay <ArrowRight size={20} weight="bold" /></>
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
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
