import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, MagnifyingGlass, PencilSimple, Trash, Eye } from "@phosphor-icons/react";
import { adminApi } from "../../services/apiService";
import { toast } from "sonner";
import type { Product } from "../../types";
import type { Category } from "../../types";

const ITEMS_PER_PAGE = 8;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([adminApi.listProducts(), adminApi.listCategories()])
      .then(([prods, cats]) => {
        setProducts(prods as Product[]);
        setCategories(cats as Category[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string | number, name: string) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      toast.success(`Đã xóa: ${name}`);
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Sản phẩm</h1>
          <p className="text-gray-500 text-sm">{filtered.length} sản phẩm</p>
        </div>
        <Link to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#102C26] text-[#F7E7CE] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#102C26]/90 transition-all shadow-sm">
          <Plus size={17} weight="bold" /> Thêm sản phẩm
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên sản phẩm..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 focus:border-[#102C26]/40 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 focus:border-[#102C26]/40">
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-8 h-8 border-2 border-[#102C26] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Danh mục</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Giá gốc</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-medium">Không có sản phẩm</td></tr>
                  ) : paged.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={product.imageUrl} alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[180px]">{product.title}</p>
                            <p className="text-gray-400 text-xs">ID: #{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="bg-[#102C26]/10 text-[#102C26] text-xs font-semibold px-2.5 py-1 rounded-full">{product.category}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-[#102C26]">{product.price.toLocaleString("vi-VN")}đ</span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                        {product.originalPrice
                          ? <span className="text-gray-400 line-through text-xs">{product.originalPrice.toLocaleString("vi-VN")}đ</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {product.discount
                          ? <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">Sale {product.discount}</span>
                          : <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Đang bán</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <a href={`/product/${product.id}`} target="_blank"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Xem">
                            <Eye size={15} />
                          </a>
                          <Link to={`/admin/products/${product.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#102C26] hover:bg-[#102C26]/10 transition-all" title="Sửa">
                            <PencilSimple size={15} />
                          </Link>
                          <button onClick={() => handleDelete(product.id, product.title)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Xóa">
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">Trang {page} / {totalPages} · {filtered.length} sản phẩm</p>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? "bg-[#102C26] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
