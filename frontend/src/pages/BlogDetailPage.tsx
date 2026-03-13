import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, ArrowRight } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { productService } from "../services/productService";
import type { BlogPost, Product } from "../types";

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      productService.getBlogPosts(),
      productService.getProducts({ page: 1, pageSize: 4 }),
    ]).then(([posts, prods]) => {
      const found = posts.find((p) => String(p.id) === id) ?? null;
      setPost(found);
      setRelated(prods.products.slice(0, 4));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F5F1] flex items-center justify-center">
        <span className="w-10 h-10 border-2 border-[#102C26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F0F5F1] font-sans flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-xl font-bold text-gray-500">Không tìm thấy bài viết</p>
          <Link to="/blog" className="text-primary font-semibold hover:underline">← Quay lại Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground/50 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary transition-colors">Góc xanh PAP</Link>
          <span>/</span>
          <span className="text-foreground/80 truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Article */}
        <article className="bg-white rounded-3xl shadow-sm border border-secondary overflow-hidden mb-8">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="p-6 md:p-10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.category && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
              )}
              <span className="text-xs text-foreground/50 flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
              <span className="text-xs text-foreground/50">{post.date}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight mb-4">{post.title}</h1>
            {post.excerpt && <p className="text-base text-foreground/70 leading-relaxed mb-6 border-l-4 border-primary pl-4 italic">{post.excerpt}</p>}

            {/* Content */}
            <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
              {post.content
                ? post.content.split("\n").map((line, i) => <p key={i} className="mb-3">{line}</p>)
                : <p className="text-foreground/50">Nội dung đang được cập nhật...</p>}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-secondary">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/blog" className="flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
            <ArrowLeft size={16} weight="bold" /> Tất cả bài viết
          </Link>
        </div>

        {/* Verified plants promo */}
        <div className="bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-wider">TỪ PAP STORE</p>
            <h2 className="text-xl font-black mb-2">Mua cây chất lượng từ PAP</h2>
            <p className="text-sm opacity-80">Cây cảnh PAP được trồng và chăm sóc bởi các chuyên gia, giao hàng toàn quốc với đóng gói chuyên biệt.</p>
          </div>
          <Link to="/shop" className="flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all whitespace-nowrap shrink-0">
            Khám phá cửa hàng <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-foreground mb-5">Cây phù hợp với bài viết</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-2xl overflow-hidden border border-secondary hover:shadow-md transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{product.title}</p>
                    <p className="text-primary font-bold text-sm mt-1">{product.price.toLocaleString("vi-VN")}đ</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
