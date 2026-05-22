import { useState, useEffect } from "react";
import { Star, CheckCircle, Eye, EyeSlash, MagnifyingGlass, Image as ImageIcon } from "@phosphor-icons/react";
import { adminApi } from "../../services/apiService";
import { toast } from "sonner";

interface Review {
  id: number;
  productId: number;
  productTitle: string;
  userName: string;
  avatar: string | null;
  rating: number;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  verified: boolean;
  createdAt: string;
  visible: boolean;
}

type ReviewStatus = "approved" | "hidden";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    adminApi.listReviews()
      .then((data) => setReviews(data as Review[]))
      .catch(() => toast.error("Không thể tải đánh giá"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reviews.filter((r) => {
    const matchSearch = !search.trim() ||
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.productTitle.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === 0 || r.rating === ratingFilter;
    return matchSearch && matchRating;
  });

  const setStatus = async (id: number, status: ReviewStatus) => {
    const visible = status === "approved";
    try {
      await adminApi.updateReview(id, { visible });
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, visible } : r));
      toast.success(visible ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const statusCfg: Record<ReviewStatus, { label: string; color: string }> = {
    approved: { label: "Đã duyệt", color: "bg-green-500/10 text-green-400 border border-green-500/25" },
    hidden:   { label: "Đã ẩn",    color: "bg-secondary/20 text-muted-foreground border border-border" },
  };

  const approvedCount = reviews.filter((r) => r.visible).length;
  const hiddenCount = reviews.filter((r) => !r.visible).length;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-foreground">Đánh giá sản phẩm</h1>
        <p className="text-muted-foreground text-sm">{reviews.length} đánh giá · {approvedCount} đã duyệt · {hiddenCount} đã ẩn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng đánh giá", value: reviews.length, color: "text-foreground" },
          { label: "Đã duyệt", value: approvedCount, color: "text-green-400" },
          { label: "Đã ẩn", value: hiddenCount, color: "text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách hàng, sản phẩm..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        <div className="flex gap-1">
          {[0, 5, 4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => setRatingFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${ratingFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"}`}>
              {r === 0 ? "Tất cả" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const status: ReviewStatus = review.visible ? "approved" : "hidden";
            const cfg = statusCfg[status];
            return (
              <div key={review.id} className={`bg-card rounded-2xl border border-border p-5 shadow-sm transition-opacity ${!review.visible ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: user + stars */}
                  <div className="flex items-start gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-black text-primary">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{review.userName}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} weight={review.rating >= s ? "fill" : "regular"}
                            className={review.rating >= s ? "text-yellow-400" : "text-muted-foreground/20"} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>

                  {/* Center: content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-foreground">{review.title}</p>
                      {review.verified && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={9} weight="fill" /> Đã mua
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-primary/80 font-semibold mb-1">Sản phẩm: {review.productTitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, i) => (
                          <button key={i} onClick={() => setLightbox(img)}
                            className="w-14 h-14 rounded-xl overflow-hidden border border-border hover:opacity-80 transition-opacity relative group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <ImageIcon size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {review.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-secondary/40 text-muted-foreground border border-border px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button onClick={() => setStatus(review.id, "approved")}
                      disabled={review.visible}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/25 hover:bg-green-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <Eye size={13} /> Duyệt
                    </button>
                    <button onClick={() => setStatus(review.id, "hidden")}
                      disabled={!review.visible}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary/40 text-muted-foreground border border-border hover:bg-secondary/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <EyeSlash size={13} /> Ẩn
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
              <Star size={40} className="text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Không tìm thấy đánh giá nào</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="review" className="max-w-lg max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
