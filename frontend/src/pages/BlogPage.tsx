import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Clock, ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { productService } from "../services/productService";
import type { BlogPost, BlogCategory } from "../types";
import forestPattern from "../assets/forest_pattern.jpg";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 6;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productService.getBlogPosts(),
      productService.getBlogCategories(),
    ])
      .then(([posts, categoryOptions]) => {
        setBlogPosts(posts);
        setCategories(categoryOptions);
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = blogPosts.find((p) => p.featured);
  const filtered = blogPosts.filter((p) => {
    const matchCat = selectedCategory === "Tất cả" || p.category === selectedCategory;
    const matchSearch = !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const shouldShowFeatured = !!featured && selectedCategory === "Tất cả" && !searchQuery && !loading;
  const listForGrid = filtered.filter((p) => !(shouldShowFeatured && p.featured));
  const totalPages = Math.max(1, Math.ceil(listForGrid.length / PAGE_SIZE));
  const paginatedPosts = listForGrid.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const categoryOptions = ["Tất cả", ...categories.map((c) => c.name)];

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, loading]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <div
        className="relative w-full h-48 md:h-64 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${forestPattern})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-2">GÓC XANH PAP</h1>
          <p className="text-white/80 text-sm md:text-base">Kiến thức cây cảnh từ A đến Z</p>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-primary text-white shadow-sm" : "bg-white text-foreground/60 border border-gray-200 hover:border-primary/30"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mb-8 text-center">
            <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
          </div>
        )}

        {/* Featured Post */}
        {shouldShowFeatured && (
          <Link to={`/blog/${featured.id}`} className="group block mb-10">
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">BÀI VIẾT NỔI BẬT</span>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 group-hover:text-secondary transition-colors">{featured.title}</h2>
                <p className="text-white/70 text-sm line-clamp-2 mb-3 max-w-2xl">{featured.excerpt}</p>
                <div className="flex items-center gap-3 text-white/60 text-xs">
                  <span>{featured.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group bg-white rounded-2xl overflow-hidden border border-secondary hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {post.category && <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{post.category}</span>}
                  <span className="text-xs text-foreground/50 flex items-center gap-1 ml-auto"><Clock size={11} /> {post.readTime}</span>
                </div>
                <h3 className="font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                {post.excerpt && <p className="text-sm text-foreground/60 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-foreground/50">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                    Đọc ngay <ArrowRight size={14} weight="bold" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-9 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${currentPage === page ? "bg-primary text-white border-primary" : "bg-white text-foreground/70 border-gray-200 hover:border-primary/40"}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}

        {!loading && listForGrid.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-secondary">
            <p className="text-foreground/50 text-lg font-medium mb-2">Không tìm thấy bài viết nào</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("Tất cả"); }} className="text-primary font-semibold hover:underline text-sm">
              Xem tất cả bài viết
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
