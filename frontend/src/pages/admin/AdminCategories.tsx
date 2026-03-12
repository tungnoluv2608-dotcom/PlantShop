import { useState } from "react";
import { Plus, PencilSimple, Trash, Tag, X } from "@phosphor-icons/react";
import { categories } from "../../data/mockData";
import { toast } from "sonner";
import type { Category } from "../../types";

interface EditableCategory extends Category {
  deleted?: boolean;
}

export default function AdminCategories() {
  const [cats, setCats] = useState<EditableCategory[]>(
    categories.map((c) => ({ ...c }))
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditableCategory | null>(null);
  const [draft, setDraft] = useState({ name: "", image: "", subcategories: [] as string[] });
  const [newSub, setNewSub] = useState("");

  const openAdd = () => {
    setEditing(null);
    setDraft({ name: "", image: "", subcategories: [] });
    setNewSub("");
    setModalOpen(true);
  };

  const openEdit = (cat: EditableCategory) => {
    setEditing(cat);
    setDraft({ name: cat.name, image: cat.image, subcategories: [...(cat.subcategories ?? [])] });
    setNewSub("");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!draft.name.trim()) { toast.error("Tên danh mục không được để trống"); return; }
    if (editing) {
      setCats((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...draft } : c));
      toast.success(`Đã cập nhật: ${draft.name}`);
    } else {
      const newCat: EditableCategory = {
        id: String(Date.now()),
        name: draft.name,
        image: draft.image || "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=500&auto=format&fit=crop",
        subcategories: draft.subcategories,
      };
      setCats((prev) => [...prev, newCat]);
      toast.success(`Đã thêm: ${draft.name}`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Xóa danh mục "${name}"?`)) {
      setCats((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Đã xóa: ${name}`);
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL ảnh đại diện</label>
                <input value={draft.image} onChange={(e) => setDraft((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                {draft.image && (
                  <img src={draft.image} alt="preview" className="w-full h-24 object-cover rounded-xl mt-2 border border-gray-100" />
                )}
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
