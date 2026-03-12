import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, Clock, Tag, Share, FacebookLogo, Link as LinkIcon } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { blogPostsFull, products } from "../data/mockData";
import { toast } from "sonner";

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPostsFull.find((p) => p.id === id);
  const related = blogPostsFull.filter((p) => p.id !== id).slice(0, 3);
  const recommended = products.slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold mb-4">Bài viết không tồn tại</p>
            <Link to="/blog" className="text-primary font-semibold hover:underline">← Quay lại Blog</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết!");
  };

  // Render simple markdown-like content
  const renderContent = (content: string) => {
    return content.split("\n\n").map((para, i) => {
      if (para.startsWith("**") && para.endsWith("**") && para.split("**").length === 3) {
        return <h3 key={i} className="text-xl font-bold text-foreground mt-6 mb-2">{para.replace(/\*\*/g, "")}</h3>;
      }
      return (
        <p key={i} className="text-foreground/70 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.category && <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>}
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
              <Clock size={12} /> {post.readTime}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{post.title}</h1>
          <p className="text-white/70 text-sm mt-2">{post.date}</p>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Article Content */}
          <article className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-10">
              <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline mb-6">
                <ArrowLeft size={16} weight="bold" /> Quay lại Blog
              </button>

              {post.excerpt && <p className="text-lg text-foreground/80 italic border-l-4 border-primary pl-4 mb-8 leading-relaxed">{post.excerpt}</p>}

              <div className="prose max-w-none">
                {post.content ? renderContent(post.content) : <p className="text-foreground/60">Nội dung bài viết đang được cập nhật...</p>}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-secondary flex flex-wrap gap-2 items-center">
                  <Tag size={16} className="text-foreground/40" />
                  {post.tags.map((tag) => (
                    <span key={tag} className="bg-secondary/50 text-foreground/60 px-3 py-1 rounded-full text-sm">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground/60">Chia sẻ:</span>
                <button onClick={() => {}} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <FacebookLogo size={16} weight="fill" /> Facebook
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-foreground rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                  <LinkIcon size={16} /> Sao chép link
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Related Posts */}
            <div className="bg-white rounded-2xl shadow-sm border border-secondary p-5">
              <h3 className="font-bold text-foreground mb-4">Bài viết liên quan</h3>
              <div className="space-y-4">
                {related.map((p) => (
                  <Link key={p.id} to={`/blog/${p.id}`} className="flex gap-3 group">
                    <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{p.title}</p>
                      <p className="text-xs text-foreground/50 mt-1">{p.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recommended Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-secondary p-5">
              <h3 className="font-bold text-foreground mb-4">Cây phù hợp với bài viết</h3>
              <div className="space-y-3">
                {recommended.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="flex gap-3 group">
                    <img src={product.imageUrl} alt={product.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{product.title}</p>
                      <p className="text-primary text-sm font-bold">{product.price.toLocaleString("vi-VN")}đ</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/shop" className="block text-center text-sm text-primary font-bold mt-4 hover:underline">Xem tất cả →</Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
