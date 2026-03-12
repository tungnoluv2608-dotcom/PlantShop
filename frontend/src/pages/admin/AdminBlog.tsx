import { useState } from "react";
import { Plus, PencilSimple, Trash, Eye, MagnifyingGlass } from "@phosphor-icons/react";
import { Link } from "react-router";
import { blogPostsFull } from "../../data/mockData";
import { toast } from "sonner";

export default function AdminBlog() {
  const [search, setSearch] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const filtered = blogPostsFull.filter((p) => {
    if (deletedIds.has(p.id)) return false;
    return !search.trim() || p.title.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Xóa bài viết "${title}"?`)) {
      setDeletedIds((prev) => new Set([...prev, id]));
      toast.success("Đã xóa bài viết");
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
          onClick={() => toast.info("Tính năng soạn bài viết sẽ được ra mắt sớm!")}
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
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-[#102C26] transition-colors" title="Sửa">
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
    </div>
  );
}
