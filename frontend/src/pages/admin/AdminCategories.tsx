import { useState, useEffect } from "react";
import { Plus, PencilSimple, Trash, Tag, X, CloudArrowUp } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Category } from "../../types";
import { useImageUpload } from "../../hooks/useImageUpload";
import { adminApi } from "../../services/apiService";

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [draft, setDraft] = useState({ name: "", image: "", subcategories: [] as string[] });

  const fetchCats = async () => {
    try {
      const data = await adminApi.listCategories();
      setCats(data as Category[]);
    } catch {
      toast.error("Lỗi khi tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);
  const [newSub, setNewSub] = useState("");

  const { triggerUpload, uploading, InputElement } = useImageUpload({ multiple: false });

  const handleImageSuccess = (urls: string[]) => setDraft((prev) => ({ ...prev, image: urls[0] }));

  const openAdd = () => {
    setEditing(null);
    setDraft({ name: "", image: "", subcategories: [] });
    setNewSub("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setDraft({ name: cat.name, image: cat.image, subcategories: [...(cat.subcategories ?? [])] });
    setNewSub("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim()) { toast.error("Tên danh mục không được để trống"); return; }
    try {
      if (editing) {
        await adminApi.updateCategory(editing.id, draft);
        toast.success(`Đã cập nhật: ${draft.name}`);
      } else {
        await adminApi.createCategory(draft);
        toast.success(`Đã thêm: ${draft.name}`);
      }
      setModalOpen(false);
      fetchCats();
    } catch {
      toast.error("Lưu danh mục thất bại");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa danh mục "${name}"?`)) {
      try {
        await adminApi.deleteCategory(id);
        toast.success(`Đã xóa: ${name}`);
        fetchCats();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const addSub = () => {
    if (!newSub.trim()) return;
    setDraft((prev) => ({ ...prev, subcategories: [...prev.subcategories, newSub.trim()] }));
    setNewSub("");
  };

  const removeSub = (idx: number) => {
    setDraft((prev) => ({ ...prev, subcategories: prev.subcategories.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Danh mục</h1>
          <p className="text-gray-500 text-sm">{cats.length} danh mục · {cats.reduce((s, c) => s + (c.subcategories?.length ?? 0), 0)} danh mục con</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#102C26] text-[#F7E7CE] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#102C26]/90 transition-all shadow-sm">
          <Plus size={17} weight="bold" /> Thêm danh mục
        </button>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-[#102C26] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cats.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="h-32 relative overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-white font-black text-lg drop-shadow">{cat.name}</h3>
            </div>
            <div className="p-4">
              {cat.subcategories && cat.subcategories.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {cat.subcategories.map((sub) => (
                    <span key={sub} className="inline-flex items-center gap-1 text-xs font-semibold bg-[#102C26]/10 text-[#102C26] px-2.5 py-1 rounded-full">
                      <Tag size={10} /> {sub}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-3 italic">Chưa có danh mục con</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">ID: #{cat.id}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#102C26] hover:bg-[#102C26]/10 transition-all">
                    <PencilSimple size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">{editing ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên danh mục *</label>
                <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Cây trong nhà"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh đại diện</label>
                <div onClick={triggerUpload} className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${draft.image ? "border-transparent" : "border-gray-300 hover:border-[#102C26]"}`}>
                  {draft.image ? (
                    <>
                      <img src={draft.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"><CloudArrowUp size={24}/> Thay đổi</div>
                    </>
                  ) : uploading ? (
                    <span className="animate-spin border-2 border-[#102C26] border-t-transparent w-6 h-6 rounded-full"/>
                  ) : (
                    <div className="text-gray-400 text-center"><CloudArrowUp size={24} className="mx-auto mb-1"/><span className="text-sm">Tải ảnh lên</span></div>
                  )}
                </div>
                <InputElement onSuccess={handleImageSuccess} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục con</label>
                <div className="flex gap-2 mb-2">
                  <input value={newSub} onChange={(e) => setNewSub(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSub()}
                    placeholder="Nhập tên + Enter"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20" />
                  <button onClick={addSub}
                    className="bg-[#102C26]/10 text-[#102C26] font-bold px-3 py-2 rounded-xl text-sm hover:bg-[#102C26]/20 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {draft.subcategories.map((sub, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-[#102C26]/10 text-[#102C26] text-xs font-semibold px-2.5 py-1 rounded-full">
                      {sub}
                      <button onClick={() => removeSub(i)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave}
                className="flex-1 bg-[#102C26] text-[#F7E7CE] font-bold py-3 rounded-xl text-sm hover:bg-[#102C26]/90 transition-all">
                {editing ? "Lưu thay đổi" : "Thêm danh mục"}
              </button>
              <button onClick={() => setModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
