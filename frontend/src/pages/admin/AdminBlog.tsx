import { useState, useEffect } from "react";
import { Plus, PencilSimple, Trash, Eye, MagnifyingGlass, X, CloudArrowUp } from "@phosphor-icons/react";
import { Link } from "react-router";
import { toast } from "sonner";
import { adminApi } from "../../services/apiService";
import { useImageUpload } from "../../hooks/useImageUpload";
import { productService } from "../../services/productService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogCategory } from "../../types";

interface BlogPost {
  id: string;
  title: string;
  image: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  date: string;
}

export default function AdminBlog() {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<BlogCategory[]>([]);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "", 
    readTime: "5 phút", tags: "", image: "", featured: false
  });

  const { triggerUpload, uploading, InputElement } = useImageUpload({ multiple: false });

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.listBlog();
      setPosts(data);
    } catch {
      toast.error("Lỗi khi tải danh sách bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    productService.getBlogCategories().then(setCategoryOptions).catch(() => undefined);
  }, []);

  const filtered = posts.filter((p) =>
    !search.trim() ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Xóa bài viết "${title}"?`)) {
      try {
        await adminApi.deleteBlogPost(id);
        toast.success("Đã xóa bài viết");
        fetchPosts();
      } catch {
        toast.error("Lỗi khi xóa bài viết");
      }
    }
  };

  const openFormModal = (post?: BlogPost) => {
    if (post) {
      setEditingId(post.id);
      setForm({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "",
        readTime: post.readTime || "5 phút",
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
        image: post.image || "",
        featured: !!post.featured,
      });
    } else {
      setEditingId(null);
      setForm({
        title: "", excerpt: "", content: "", category: categoryOptions[0]?.name || "Tin tức", 
        readTime: "5 phút", tags: "", image: "", featured: false
      });
    }
    setEditorMode("write");
    setIsModalOpen(true);
  };

  const handleImageUploadSuccess = (urls: string[]) => {
    setForm(prev => ({ ...prev, image: urls[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image.trim() || !form.content.trim() || !form.category.trim()) {
      toast.error("Vui lòng điền các thông tin bắt buộc (*)");
      return;
    }
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        image: form.image.trim(),
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      if (editingId) {
        await adminApi.updateBlogPost(editingId, payload);
        toast.success("Đã cập nhật bài viết");
      } else {
        await adminApi.createBlogPost(payload);
        toast.success("Đã tạo bài viết");
      }
      setIsModalOpen(false);
      await fetchPosts();
      productService.getBlogCategories().then(setCategoryOptions).catch(() => undefined);
    } catch {
      toast.error("Lỗi lưu bài viết");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog</h1>
          <p className="text-gray-500 text-sm">{filtered.length} bài viết</p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="inline-flex items-center gap-2 bg-[#102C26] text-[#F7E7CE] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#102C26]/90 transition-all shadow-sm"
        >
          <Plus size={17} weight="bold" /> Viết bài mới
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><span className="animate-spin inline-block w-8 h-8 border-4 border-[#102C26] border-t-transparent rounded-full" /></div>
      ) : (
        <>
          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {post.featured && (
                    <span className="absolute top-2 left-2 bg-[#102C26] text-[#F7E7CE] text-[10px] font-black px-2 py-1 rounded-full">NỔI BẬT</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && <span className="text-[10px] font-bold text-[#102C26] bg-[#102C26]/10 px-2 py-0.5 rounded-full">{post.category}</span>}
                    <span className="text-[10px] text-gray-400 ml-auto">{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{post.date}</span>
                    <div className="flex items-center gap-1">
                      <Link to={`/blog/${post.id}`} target="_blank"
                        className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-[#102C26] transition-colors" title="Xem bài viết">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => openFormModal(post)} className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-[#102C26] transition-colors" title="Sửa">
                        <PencilSimple size={14} />
                      </button>
                      <button onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors" title="Xóa">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-400 font-medium">Không tìm thấy bài viết nào</p>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl p-6 md:p-8 relative min-h-[92vh] max-h-[95vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} weight="bold" />
            </button>
            <h2 className="text-3xl font-black text-gray-900 mb-6">{editingId ? "Sửa bài viết" : "Thêm bài viết mới"}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề *</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trích dẫn (Excerpt)</label>
                  <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all resize-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Nội dung (Markdown) *</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                      <button type="button" onClick={() => setEditorMode("write")} className={`px-3 py-1.5 ${editorMode === "write" ? "bg-[#102C26] text-[#F7E7CE]" : "bg-white text-gray-600"}`}>Viết</button>
                      <button type="button" onClick={() => setEditorMode("preview")} className={`px-3 py-1.5 ${editorMode === "preview" ? "bg-[#102C26] text-[#F7E7CE]" : "bg-white text-gray-600"}`}>Xem trước</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
                    <div className="xl:col-span-3">
                      {editorMode === "write" ? (
                        <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={18} className="w-full min-h-[520px] border border-gray-200 rounded-xl px-4 py-3 text-[15px] leading-7 outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all font-mono" required />
                      ) : (
                        <div className="w-full min-h-[520px] border border-gray-200 rounded-xl px-4 py-4 text-sm bg-gray-50 prose prose-sm max-w-none">
                          {form.content.trim() ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                          ) : (
                            <p className="text-gray-400">Chưa có nội dung để xem trước.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="xl:col-span-2 rounded-2xl border border-[#D2E7D7] bg-gradient-to-b from-[#F4FAF6] to-[#ECF7F1] p-4 md:p-5 shadow-sm">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#102C26] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#F7E7CE] mb-3">
                        Mẹo Markdown
                      </div>
                      <h4 className="text-base font-black text-[#102C26]">Hướng dẫn viết nội dung</h4>
                      <p className="text-xs text-gray-600 mt-1 mb-4 leading-relaxed">
                        Dùng Markdown để định dạng nhanh. Viết ở tab <span className="font-semibold">Viết</span>, kiểm tra lại ở tab <span className="font-semibold">Xem trước</span> trước khi đăng.
                      </p>

                      <div className="space-y-3 text-xs">
                        <div className="rounded-xl border border-[#D9E6DE] bg-white p-3">
                          <p className="font-semibold text-[#102C26] mb-1">Tiêu đề</p>
                          <p className="font-mono text-gray-700"># Tiêu đề lớn</p>
                          <p className="font-mono text-gray-700">## Tiêu đề vừa</p>
                        </div>
                        <div className="rounded-xl border border-[#D9E6DE] bg-white p-3">
                          <p className="font-semibold text-[#102C26] mb-1">Nhấn mạnh nội dung</p>
                          <p className="font-mono text-gray-700">**in đậm** hoặc *in nghiêng*</p>
                        </div>
                        <div className="rounded-xl border border-[#D9E6DE] bg-white p-3">
                          <p className="font-semibold text-[#102C26] mb-1">Danh sách và trích dẫn</p>
                          <p className="font-mono text-gray-700">- Mục 1</p>
                          <p className="font-mono text-gray-700">1. Bước 1</p>
                          <p className="font-mono text-gray-700">&gt; Câu trích dẫn</p>
                        </div>
                        <div className="rounded-xl border border-[#D9E6DE] bg-white p-3">
                          <p className="font-semibold text-[#102C26] mb-1">Link, ảnh, mã</p>
                          <p className="font-mono text-gray-700">[Tên link](https://...)</p>
                          <p className="font-mono text-gray-700">![Mô tả ảnh](https://...)</p>
                          <p className="font-mono text-gray-700">`code` hoặc ```code```</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-[#CFE2D5] bg-[#F8FCF9] px-3 py-2 text-[11px] text-gray-600 leading-relaxed">
                        Gợi ý: Viết câu ngắn, chia đoạn rõ ràng, dùng tiêu đề phụ để bài dễ đọc hơn trên cả điện thoại và desktop.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="xl:col-span-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh Thumb *</label>
                    <div
                      onClick={() => !uploading && triggerUpload()}
                      className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-pointer hover:border-[#102C26]/40 transition flex items-center justify-center overflow-hidden"
                    >
                      {form.image ? (
                        <img src={form.image} alt="thumb" className="w-full h-full object-cover" />
                      ) : uploading ? (
                        <div className="text-[#102C26] text-sm font-semibold">Đang tải...</div>
                      ) : (
                        <div className="text-gray-400 text-center px-4"><CloudArrowUp size={24} className="mx-auto mb-1"/><span className="text-xs">Tải lên hoặc chọn ảnh</span></div>
                      )}
                    </div>
                    <InputElement onSuccess={handleImageUploadSuccess} />
                    {uploading && <p className="text-xs text-[#102C26] mt-2 font-medium">Đang tải ảnh lên...</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chuyên mục</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#102C26]/20 bg-white">
                      {categoryOptions.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                      {!categoryOptions.find((c) => c.name === form.category) && form.category && (
                        <option value={form.category}>{form.category}</option>
                      )}
                    </select>
                    <input
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      placeholder="Hoặc nhập chuyên mục mới"
                      className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#102C26]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (cách nhau dấu phẩy)</label>
                    <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#102C26]/20" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="accent-[#102C26] w-4 h-4" />
                      <span className="text-sm font-semibold text-gray-700">Bài viết nổi bật</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-12 border-t border-gray-100 pt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">Hủy</button>
                <button type="submit" disabled={uploading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#F7E7CE] bg-[#102C26] hover:bg-[#102C26]/90 transition-colors disabled:opacity-50">
                  {editingId ? "Lưu thay đổi" : "Đăng bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
