import { useState, useEffect } from "react";
import { Plus, PencilSimple, Trash, Check, X, CloudArrowUp, Flower } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useImageUpload } from "../../hooks/useImageUpload";
import { adminApi } from "../../services/apiService";
import type { Planter } from "../../types";

const EMPTY: Omit<Planter, "id"> = { name: "", material: "", price: 0, imageUrl: "", sizes: [], inStock: true, type: "planter" };

export default function AdminPlanters() {
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Planter | null>(null);
  const [draft, setDraft] = useState<Omit<Planter, "id">>(EMPTY);
  const [newSize, setNewSize] = useState("");

  const fetchPlanters = async () => {
    try {
      const data = await adminApi.listPlanters("planter");
      setPlanters(data as Planter[]);
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanters();
  }, []);

  const { triggerUpload, uploading, InputElement } = useImageUpload({ multiple: false });

  const handleImageSuccess = (urls: string[]) => setDraft((p) => ({ ...p, imageUrl: urls[0] }));

  const openAdd = () => {
    setEditing(null);
    setDraft({ ...EMPTY, type: "planter" });
    setNewSize("");
    setModalOpen(true);
  };
  const openEdit = (p: Planter) => {
    setEditing(p);
    setDraft({ ...p, type: "planter" });
    setNewSize("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.price) { toast.error("Vui lòng điền tên và giá"); return; }
    try {
      const payload = { ...draft, type: "planter" as const };
      if (editing) {
        await adminApi.updatePlanter(editing.id, payload);
        toast.success(`Đã cập nhật: ${draft.name}`);
      } else {
        await adminApi.createPlanter(payload);
        toast.success(`Đã thêm: ${draft.name}`);
      }
      setModalOpen(false);
      fetchPlanters();
    } catch {
      toast.error("Lưu dữ liệu thất bại");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa "${name}"?`)) {
      try {
        await adminApi.deletePlanter(id);
        toast.success(`Đã xóa: ${name}`);
        fetchPlanters();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    setDraft((p) => ({ ...p, sizes: [...p.sizes, newSize.trim()] }));
    setNewSize("");
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 mb-2">
            <Flower size={14} weight="bold" className="text-sky-700" />
            <span className="text-[11px] font-black tracking-wide text-sky-700 uppercase">Khu vực chậu cây</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Chậu cây</h1>
          <p className="text-gray-500 text-sm">{planters.length} mẫu chậu · {planters.filter(p => p.inStock).length} còn hàng</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-800 transition-all shadow-sm">
          <Plus size={17} weight="bold" /> Thêm mới
        </button>
      </div>

      {/* Planter Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-[#102C26] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Chất liệu</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Kích thước</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tình trạng</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {planters.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">#{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{p.material}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.sizes.map((s) => (
                        <span key={s} className="text-[10px] font-semibold bg-[#102C26]/8 text-[#102C26]/70 px-2 py-0.5 rounded-full border border-[#102C26]/10">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-[#102C26]">{p.price.toLocaleString("vi-VN")}đ</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {p.inStock ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#102C26] hover:bg-[#102C26]/10 transition-all">
                        <PencilSimple size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">
                {editing ? "Sửa chậu cây" : "Thêm chậu cây mới"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên chậu *</label>
                  <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="VD: Chậu Gốm Trắng"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chất liệu</label>
                  <input value={draft.material} onChange={(e) => setDraft((p) => ({ ...p, material: e.target.value }))}
                    placeholder="Gốm, Xi măng..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá (đ) *</label>
                  <input type="number" value={draft.price || ""} onChange={(e) => setDraft((p) => ({ ...p, price: Number(e.target.value) }))}
                    placeholder="85000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh chậu *</label>
                <div onClick={triggerUpload} className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${draft.imageUrl ? "border-transparent" : "border-gray-300 hover:border-[#102C26]"}`}>
                  {draft.imageUrl ? (
                    <>
                      <img src={draft.imageUrl} className="w-full h-full object-cover" />
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kích thước</label>
                <div className="flex gap-2 mb-2">
                  <input value={newSize} onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSize()}
                    placeholder="VD: S (10cm)"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20" />
                  <button onClick={addSize} className="bg-[#102C26]/10 text-[#102C26] px-3 rounded-xl hover:bg-[#102C26]/20 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {draft.sizes.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {s}
                      <button onClick={() => setDraft((p) => ({ ...p, sizes: p.sizes.filter((_, idx) => idx !== i) }))}
                        className="hover:text-red-500 transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={draft.inStock}
                  onChange={(e) => setDraft((p) => ({ ...p, inStock: e.target.checked }))}
                  className="w-4 h-4 accent-[#102C26]" />
                <span className="text-sm font-medium text-gray-700">Còn hàng</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave}
                className="flex-1 bg-[#102C26] text-[#F7E7CE] font-bold py-3 rounded-xl text-sm hover:bg-[#102C26]/90 transition-all flex items-center justify-center gap-2">
                <Check size={16} /> {editing ? "Lưu" : "Thêm"}
              </button>
              <button onClick={() => setModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
