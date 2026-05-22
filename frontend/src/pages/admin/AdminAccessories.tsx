import { useState, useEffect, useMemo } from "react";
import { Plus, PencilSimple, Trash, Check, X, CloudArrowUp, Wrench } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useImageUpload } from "../../hooks/useImageUpload";
import { adminApi } from "../../services/apiService";
import type { Planter } from "../../types";

const EMPTY: Omit<Planter, "id"> = {
  name: "",
  material: "",
  accessoryBrand: "",
  usageTags: [],
  price: 0,
  imageUrl: "",
  sizes: [],
  inStock: true,
  type: "accessory",
};

export default function AdminAccessories() {
  const [accessories, setAccessories] = useState<Planter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Planter | null>(null);
  const [draft, setDraft] = useState<Omit<Planter, "id">>(EMPTY);
  const [usageInput, setUsageInput] = useState("");

  const groupOptions = useMemo(
    () => Array.from(new Set(accessories.map((item) => item.material).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi")),
    [accessories]
  );

  const brandOptions = useMemo(
    () => Array.from(new Set(accessories.map((item) => item.accessoryBrand || "").filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi")),
    [accessories]
  );

  const { triggerUpload, uploading, InputElement } = useImageUpload({ multiple: false });

  const fetchAccessories = async () => {
    try {
      const data = await adminApi.listPlanters("accessory");
      setAccessories(data as Planter[]);
    } catch {
      toast.error("Lỗi khi tải dữ liệu phụ kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  const handleImageSuccess = (urls: string[]) => setDraft((p) => ({ ...p, imageUrl: urls[0] }));

  const openAdd = () => {
    setEditing(null);
    setDraft({ ...EMPTY, type: "accessory" });
    setUsageInput("");
    setModalOpen(true);
  };

  const openEdit = (item: Planter) => {
    setEditing(item);
    setDraft({ ...item, type: "accessory", sizes: [], usageTags: item.usageTags || [] });
    setUsageInput("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.price || !draft.material.trim() || !draft.accessoryBrand?.trim()) {
      toast.error("Vui lòng điền tên, nhóm, thương hiệu và giá");
      return;
    }
    const payload = { ...draft, type: "accessory" as const, sizes: [] };
    try {
      if (editing) {
        await adminApi.updatePlanter(editing.id, payload);
        toast.success(`Đã cập nhật: ${draft.name}`);
      } else {
        await adminApi.createPlanter(payload);
        toast.success(`Đã thêm: ${draft.name}`);
      }
      setModalOpen(false);
      fetchAccessories();
    } catch {
      toast.error("Lưu dữ liệu thất bại");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa phụ kiện "${name}"?`)) return;
    try {
      await adminApi.deletePlanter(id);
      toast.success(`Đã xóa: ${name}`);
      fetchAccessories();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const addUsageTag = () => {
    const tag = usageInput.trim();
    if (!tag) return;
    if (draft.usageTags?.includes(tag)) {
      setUsageInput("");
      return;
    }
    setDraft((p) => ({ ...p, usageTags: [...(p.usageTags || []), tag] }));
    setUsageInput("");
  };

  const removeUsageTag = (index: number) => {
    setDraft((p) => ({ ...p, usageTags: (p.usageTags || []).filter((_, i) => i !== index) }));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 mb-2 border border-amber-500/20">
            <Wrench size={14} weight="bold" className="text-amber-500" />
            <span className="text-[11px] font-black tracking-wide text-amber-500 uppercase">Khu vực phụ kiện</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Phụ kiện</h1>
          <p className="text-muted-foreground text-sm">
            {accessories.length} phụ kiện · {accessories.filter((p) => p.inStock).length} còn hàng
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus size={17} weight="bold" /> Thêm phụ kiện
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên phụ kiện</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Nhóm</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Giá</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tình trạng</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accessories.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-secondary/10 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">#{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">{item.material}</span>
                        {!!item.accessoryBrand && (
                          <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full">{item.accessoryBrand}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-primary">{item.price.toLocaleString("vi-VN")}đ</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          item.inStock ? "bg-green-500/10 text-green-400 border border-green-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"
                        }`}
                      >
                        {item.inStock ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
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

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-card rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-foreground text-lg">{editing ? "Sửa phụ kiện" : "Thêm phụ kiện mới"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Tên phụ kiện *</label>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="VD: Đất trồng sen đá"
                    className="w-full bg-background text-foreground placeholder-muted-foreground/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Nhóm phụ kiện *</label>
                  <select
                    value={draft.material}
                    onChange={(e) => setDraft((p) => ({ ...p, material: e.target.value }))}
                    className="w-full border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  >
                    <option value="" className="bg-card">Chọn nhóm phụ kiện đã có</option>
                    {groupOptions.map((group) => (
                      <option key={group} value={group} className="bg-card">{group}</option>
                    ))}
                    {!!draft.material && !groupOptions.includes(draft.material) && (
                      <option value={draft.material} className="bg-card">{draft.material}</option>
                    )}
                  </select>
                  <input
                    value={draft.material}
                    onChange={(e) => setDraft((p) => ({ ...p, material: e.target.value }))}
                    placeholder="Hoặc nhập nhóm phụ kiện mới"
                    className="w-full mt-2 bg-background text-foreground placeholder-muted-foreground/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Thương hiệu *</label>
                  <select
                    value={draft.accessoryBrand || ""}
                    onChange={(e) => setDraft((p) => ({ ...p, accessoryBrand: e.target.value }))}
                    className="w-full border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  >
                    <option value="" className="bg-card">Chọn thương hiệu đã có</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand} className="bg-card">{brand}</option>
                    ))}
                    {!!draft.accessoryBrand && !brandOptions.includes(draft.accessoryBrand) && (
                      <option value={draft.accessoryBrand} className="bg-card">{draft.accessoryBrand}</option>
                    )}
                  </select>
                  <input
                    value={draft.accessoryBrand || ""}
                    onChange={(e) => setDraft((p) => ({ ...p, accessoryBrand: e.target.value }))}
                    placeholder="Hoặc nhập thương hiệu mới"
                    className="w-full mt-2 bg-background text-foreground placeholder-muted-foreground/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Giá (đ) *</label>
                  <input
                    type="number"
                    value={draft.price || ""}
                    onChange={(e) => setDraft((p) => ({ ...p, price: Number(e.target.value) }))}
                    placeholder="45000"
                    className="w-full bg-background text-foreground placeholder-muted-foreground/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Công dụng</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={usageInput}
                    onChange={(e) => setUsageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUsageTag()}
                    placeholder="VD: Kích rễ, Bổ sung dinh dưỡng"
                    className="flex-1 bg-background text-foreground placeholder-muted-foreground/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={addUsageTag}
                    className="bg-secondary text-foreground px-3 rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(draft.usageTags || []).map((tag, i) => (
                    <span key={`${tag}-${i}`} className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/25">
                      {tag}
                      <button onClick={() => removeUsageTag(i)} className="hover:text-red-400 transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Ảnh phụ kiện *</label>
                <div
                  onClick={triggerUpload}
                  className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                    draft.imageUrl ? "border-transparent" : "border-border hover:border-primary"
                  }`}
                >
                  {draft.imageUrl ? (
                    <>
                      <img src={draft.imageUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2">
                        <CloudArrowUp size={24} /> Thay đổi
                      </div>
                    </>
                  ) : uploading ? (
                    <span className="animate-spin border-2 border-primary border-t-transparent w-6 h-6 rounded-full" />
                  ) : (
                    <div className="text-muted-foreground text-center">
                      <CloudArrowUp size={24} className="mx-auto mb-1" />
                      <span className="text-sm">Tải ảnh lên</span>
                    </div>
                  )}
                </div>
                <InputElement onSuccess={handleImageSuccess} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.inStock}
                  onChange={(e) => setDraft((p) => ({ ...p, inStock: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600"
                />
                <span className="text-sm font-medium text-foreground">Còn hàng</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} /> {editing ? "Lưu" : "Thêm"}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
