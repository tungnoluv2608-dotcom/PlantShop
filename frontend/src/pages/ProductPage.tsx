import { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router";
import { CheckCircleIcon, PlusIcon, MinusIcon, CaretLeftIcon, CaretRightIcon, Star, ThumbsUp, X, ShoppingCart, Camera, ArrowRight, Heart, CaretDownIcon } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/ui/ProductCard";
import { productService } from "../services/productService";
import { planterApi, reviewApi, orderApi } from "../services/apiService";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { useWishlistStore } from "../stores/wishlistStore";
import { useImageUpload } from "../hooks/useImageUpload";
import { toast } from "sonner";
import type { Product, Review, Planter } from "../types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("care");
  const [selectedPlanterId, setSelectedPlanterId] = useState<string>("none");
  const [availablePlanters, setAvailablePlanters] = useState<Planter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewTagsInput, setReviewTagsInput] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false); // New state for purchase check
  const [isWishlistBusy, setIsWishlistBusy] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isFavorite = useWishlistStore((s) => s.isFavorite(product?.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const syncWishlist = useWishlistStore((s) => s.syncWishlist);
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
      const requestedTab = new URLSearchParams(location.search).get("tab");
      const openReviewTab = requestedTab === "reviews";
      setActiveTab(openReviewTab ? "reviews" : "care");
      setReviewRating(5);
      setReviewTitle("");
      setReviewContent("");
      setReviewTagsInput("");
      setReviewImages([]);

      if (openReviewTab) {
        setTimeout(() => {
          const reviewSection = document.getElementById("review-form");
          reviewSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }

      const planterOptions = productData?.planterOptions ?? [];
      setSelectedPlanterId("none");
      setAvailablePlanters([]);
      if (planterOptions.length > 0) {
        try {
          const allPlanters = await planterApi.list();
          const filtered = (allPlanters as Planter[]).filter((p) => planterOptions.includes(p.id));
          setAvailablePlanters(filtered);
        } catch (error) {
          console.error("Failed to fetch planters", error);
        }
      }

      setIsLoading(false);
    }
    fetchData();
  }, [id, location.search]);

  useEffect(() => {
    if (!isAuthenticated) return;
    syncWishlist().catch(() => undefined);
  }, [isAuthenticated, syncWishlist]);

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

    const selectedPlanter = availablePlanters.find((p) => String(p.id) === selectedPlanterId);
    const planterPrice = selectedPlanter?.price ?? 0;
    const planterLabel = selectedPlanter
      ? `Có (Kèm ${selectedPlanter.name}${planterPrice > 0 ? ` +${planterPrice.toLocaleString("vi-VN")}đ` : ""})`
      : "Không (Chỉ cây và chậu nhựa ươm)";

    addItem({
      id: product.id,
      title: product.title,
      price: product.price + planterPrice,
      image: product.images[0],
      planter: planterLabel,
      quantity: quantity,
    });
    toast.success("Đã thêm vào giỏ hàng!", {
      description: `${product.title} x${quantity}${selectedPlanter ? ` • ${selectedPlanter.name}` : ""}`,
    });
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để dùng danh sách yêu thích");
      navigate("/signin");
      return;
    }

    if (isWishlistBusy) return;
    setIsWishlistBusy(true);
    try {
      await toggleWishlist(product.id);
      toast.success(isFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
    } catch {
      toast.error("Không thể cập nhật danh sách yêu thích");
    } finally {
      setIsWishlistBusy(false);
    }
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
                  <CaretLeftIcon size={20} weight="bold" />
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
                  <CaretRightIcon size={20} weight="bold" />
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
                    <MinusIcon size={16} />
                  </button>
                  <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={increaseQuantity} className="p-2 hover:bg-gray-50 text-foreground cursor-pointer">
                    <PlusIcon size={16} />
                  </button>
                </div>
              </div>

               {/* Include Planter */}
               <div>
                <span className="block text-sm font-semibold mb-2">Chậu đi kèm</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanterId("none")}
                    className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${selectedPlanterId === "none" ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"}`}
                  >
                    <p className="text-sm font-semibold text-foreground">Không kèm chậu</p>
                    <p className="text-xs text-foreground/60 mt-1">Chỉ cây và chậu nhựa ươm</p>
                  </button>

                  {availablePlanters.map((p) => {
                    const isActive = selectedPlanterId === String(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanterId(String(p.id))}
                        className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/40"}`}
                      >
                        <div className="flex gap-3">
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground line-clamp-2">{p.name}</p>
                            <p className="text-xs text-foreground/60 mt-0.5">{p.material}</p>
                            <p className="text-sm font-semibold text-primary mt-1">+{p.price.toLocaleString("vi-VN")}đ</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="w-full sm:w-80 flex items-stretch gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-primary-foreground font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={isWishlistBusy}
                className={`w-14 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${isFavorite ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-gray-200 text-foreground/70 hover:text-red-500"}`}
                aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              >
                <Heart size={24} weight={isFavorite ? "fill" : "regular"} />
              </button>
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
                {activeTab === "care" && <CaretDownIcon weight="fill" />} 
                Hướng dẫn chăm sóc
              </button>
              <button 
                onClick={() => setActiveTab("bio")}
                className={`font-bold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "bio" ? "text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/80"}`}
              >
                {activeTab === "bio" && <CaretDownIcon weight="fill" />}
                Thông tin cây
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`font-bold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "reviews" ? "text-primary-foreground" : "text-primary-foreground/50 hover:text-primary-foreground/80"}`}
              >
                {activeTab === "reviews" && <CaretDownIcon weight="fill" />}
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
                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-secondary p-6 md:p-8 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="text-center lg:text-left">
                          <p className="text-sm font-semibold text-foreground/60 mb-2">Đánh giá trung bình</p>
                          <p className="text-5xl font-black text-primary leading-none">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                          <div className="flex items-center justify-center lg:justify-start gap-1 mt-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={18}
                                weight={avgRating >= s ? "fill" : "regular"}
                                className={avgRating >= s ? "text-yellow-400" : "text-gray-200"}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-foreground/50 mt-2">{productReviews.length} đánh giá</p>
                        </div>

                        <div className="lg:col-span-2 space-y-3">
                          {ratingCounts.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3 text-sm">
                              <span className="w-6 font-semibold text-foreground/70">{star}★</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-yellow-400 h-full rounded-full transition-all"
                                  style={{ width: `${productReviews.length > 0 ? (count / productReviews.length) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="w-10 text-right text-foreground/60">{count}</span>
                            </div>
                          ))}

                          {isAuthenticated && hasPurchased && (
                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  const el = document.getElementById("review-form");
                                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                              >
                                Viết đánh giá ngay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isReviewLoading && (
                      <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    )}

                    {!isReviewLoading && productReviews.length === 0 ? (
                      <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                          <Star size={26} weight="duotone" className="text-primary/40" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">Chưa có đánh giá nào</h3>
                        <p className="text-foreground/50 max-w-sm mx-auto text-sm">Hãy là người đầu tiên chia sẻ cảm nhận về {product.title}.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {productReviews.map(review => (
                          <div key={review.id} className="bg-white border border-secondary p-5 md:p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between gap-3 mb-4">
                              <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                  <img src={review.avatar} alt={review.userName} className="w-12 h-12 rounded-full object-cover border border-secondary" />
                                  {review.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white" title="Đã mua hàng">
                                      <CheckCircleIcon size={11} weight="fill" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground leading-tight">{review.userName}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} size={13} weight={review.rating >= s ? "fill" : "regular"} className={review.rating >= s ? "text-yellow-400" : "text-gray-200"} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-foreground/50">{review.date}</span>
                            </div>

                            <h5 className="font-semibold text-foreground mb-2 text-base leading-snug">{review.title}</h5>
                            <p className="text-foreground/70 leading-relaxed text-sm mb-4">{review.content}</p>

                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 flex-wrap mb-4">
                                {review.images.map((img, i) => (
                                  <div key={i} className="overflow-hidden rounded-xl w-20 h-20 border border-secondary">
                                    <img src={img} alt="review" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex flex-wrap gap-2">
                                {(review.tags || []).map(tag => (
                                  <span key={tag} className="text-xs bg-gray-100 text-foreground/70 px-2.5 py-1 rounded-full font-semibold">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <button className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50 hover:text-primary transition-colors">
                                <ThumbsUp size={14} />
                                <span>{review.helpful || 0}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div id="review-form" className="pt-8 border-t border-gray-100">
                      <div className="max-w-3xl mx-auto">
                        {!isAuthenticated ? (
                          <div className="bg-white rounded-2xl p-8 md:p-10 text-center border border-secondary shadow-sm">
                             <div className="bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                              <X size={24} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Bạn chưa đăng nhập</h3>
                            <p className="text-foreground/60 mb-6 max-w-sm mx-auto">Vui lòng đăng nhập để chia sẻ đánh giá về sản phẩm này.</p>
                            <button
                              onClick={() => navigate("/signin")}
                              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                            >
                              Đăng nhập ngay
                            </button>
                          </div>
                        ) : !hasPurchased ? (
                          <div className="bg-white rounded-2xl p-8 md:p-10 text-center border border-secondary shadow-sm">
                             <div className="bg-orange-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                              <ShoppingCart size={24} className="text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Chỉ dành cho khách mua hàng</h3>
                            <p className="text-foreground/60 mb-6 max-w-sm mx-auto">Tính năng đánh giá chỉ khả dụng sau khi bạn đã mua và nhận sản phẩm này.</p>
                            <button
                              disabled
                              className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl font-semibold cursor-not-allowed"
                            >
                              Không đủ điều kiện đánh giá
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white rounded-2xl p-6 md:p-8 border border-secondary shadow-sm">
                              <h3 className="text-2xl font-bold text-foreground mb-1">Đánh giá sản phẩm</h3>
                              <p className="text-foreground/60 text-sm mb-6">Bạn đang đánh giá: <span className="text-primary font-semibold">{product.title}</span></p>

                              <div className="space-y-6">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                  <p className="text-sm font-semibold text-foreground/70 mb-3">Mức độ hài lòng</p>
                                  <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className="cursor-pointer focus:outline-none"
                                      >
                                        <Star
                                          size={28}
                                          weight={reviewRating >= star ? "fill" : "regular"}
                                          className={reviewRating >= star ? "text-yellow-400" : "text-gray-300"}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs font-semibold text-foreground/60 mt-2">
                                    {reviewRating === 5 ? "Tuyệt vời" : reviewRating === 4 ? "Rất hài lòng" : reviewRating === 3 ? "Bình thường" : reviewRating === 2 ? "Không hài lòng" : "Rất kém"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/70">Tiêu đề</label>
                                    <input
                                      value={reviewTitle}
                                      onChange={(e) => setReviewTitle(e.target.value)}
                                      placeholder="VD: Cây rất đẹp và tươi"
                                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/70">Từ khóa (Tags)</label>
                                    <input
                                      value={reviewTagsInput}
                                      onChange={(e) => setReviewTagsInput(e.target.value)}
                                      placeholder="Tươi, đẹp, đóng gói kỹ..."
                                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-semibold text-foreground/70">Đánh giá chi tiết</label>
                                  <textarea
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder="Nội dung đánh giá của bạn giúp ích rất nhiều cho người mua sau..."
                                    rows={5}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                  />
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-dashed border-gray-300">
                                   <ReviewImageInput onSuccess={(urls) => setReviewImages((prev) => [...prev, ...urls].slice(0, 5))} />
                                   
                                   <div className="flex flex-col items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={triggerReviewImageUpload}
                                        disabled={isUploadingReviewImages || reviewImages.length >= 5}
                                        className="bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors text-foreground/70 flex items-center gap-2 disabled:opacity-50"
                                      >
                                        <Camera size={18} weight="fill" className="text-primary" />
                                        {isUploadingReviewImages ? "Đang xử lý ảnh..." : "Tải lên hình ảnh thực tế"}
                                      </button>
                                      <p className="text-xs text-foreground/50 text-center">Tối đa 5 ảnh định dạng JPG/PNG</p>
                                   </div>

                                  {reviewImages.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-3 mt-5">
                                      {reviewImages.map((img, idx) => (
                                        <div key={`${img}-${idx}`} className="relative">
                                          <img src={img} alt="review upload" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                                          <button
                                            type="button"
                                            onClick={() => setReviewImages((prev) => prev.filter((_, i) => i !== idx))}
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
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
                                  className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {isSubmittingReview ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Đang lưu đánh giá...
                                    </>
                                  ) : (
                                    <>Gửi đánh giá <ArrowRight size={16} weight="bold" /></>
                                  )}
                                </button>
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
