import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CloudArrowUp, Plus, Trash, PencilSimple } from "@phosphor-icons/react";
import { products, categories, mockPlanters } from "../../data/mockData";
import { toast } from "sonner";
import type { CareGuide } from "../../types";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "new";
  const existing = isEdit ? products.find((p) => p.id === id) : null;

  const [form, setForm] = useState({
    title: existing?.title ?? "",
    price: existing?.price ?? 0,
    originalPrice: existing?.originalPrice ?? "" as number | "",
    category: existing?.category ?? categories[0].name,
    description: existing?.description ?? "",
    imageUrl: existing?.imageUrl ?? "",
    images: existing?.images ?? [] as string[],
    bio: existing?.bio ?? "",
    inStock: existing?.inStock ?? true,
    planterOptions: [] as string[],
  });

  const [careGuide, setCareGuide] = useState<CareGuide[]>(
    existing?.careGuide ?? []
  );
  const [newCareTitle, setNewCareTitle] = useState("");
  const [newCareContent, setNewCareContent] = useState("");

  // Multi-image
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Care guide handlers
  const addCareGuide = () => {
    if (!newCareTitle.trim()) { toast.error("Vui lòng nhập tiêu đề mục chăm sóc"); return; }
    setCareGuide((prev) => [...prev, { title: newCareTitle.trim(), content: newCareContent.trim() }]);
    setNewCareTitle("");
    setNewCareContent("");
  };
  const removeCareGuide = (idx: number) => setCareGuide((prev) => prev.filter((_, i) => i !== idx));
  const updateCareGuide = (idx: number, field: keyof CareGuide, value: string) =>
    setCareGuide((prev) => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));

  // Image handlers
  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
    setNewImageUrl("");
  };
  const removeImage = (idx: number) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.imageUrl) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }
    toast.success(isEdit ? `Đã cập nhật: ${form.title}` : `Đã thêm sản phẩm: ${form.title}`);
    navigate("/admin/products");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={20} weight="bold" />
        </button>
        <h1 className="text-2xl font-black text-gray-900">
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT: Main Info ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-base">Thông tin cơ bản</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  placeholder="VD: Cẩm Cù Linearis"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá bán (đ) *</label>
                  <input name="price" type="number" value={form.price || ""} onChange={handleChange} required min={0}
                    placeholder="350000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá gốc (đ)</label>
                  <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} min={0}
                    placeholder="450000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all">
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 resize-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thông tin sinh học (Bio)</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  placeholder="Nguồn gốc, họ thực vật, đặc điểm sinh học..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 resize-none transition-all" />
              </div>
            </div>

            {/* ── Care Guide Editor ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                Hướng dẫn chăm sóc
                <span className="text-xs font-normal text-gray-400">({careGuide.length} bước)</span>
              </h2>

              {/* Existing steps */}
              {careGuide.length > 0 && (
                <div className="space-y-3">
                  {careGuide.map((guide, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-6 h-6 bg-[#102C26] rounded-full flex items-center justify-center text-[#F7E7CE] text-xs font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input value={guide.title}
                          onChange={(e) => updateCareGuide(idx, "title", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 bg-white"
                          placeholder="Tiêu đề (VD: Tưới nước)" />
                        <textarea value={guide.content}
                          onChange={(e) => updateCareGuide(idx, "content", e.target.value)}
                          rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 resize-none bg-white"
                          placeholder="Nội dung hướng dẫn..." />
                      </div>
                      <button type="button" onClick={() => removeCareGuide(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-1">
                        <Trash size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new step */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thêm bước mới</p>
                <input value={newCareTitle} onChange={(e) => setNewCareTitle(e.target.value)}
                  placeholder="Tiêu đề (VD: Ánh sáng)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                <textarea value={newCareContent} onChange={(e) => setNewCareContent(e.target.value)} rows={2}
                  placeholder="Nội dung hướng dẫn chăm sóc..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                <button type="button" onClick={addCareGuide}
                  className="flex items-center gap-2 text-sm font-bold text-[#102C26] bg-[#102C26]/10 px-4 py-2 rounded-lg hover:bg-[#102C26]/20 transition-colors">
                  <Plus size={15} weight="bold" /> Thêm bước
                </button>
              </div>
            </div>

            {/* ── Planter Options ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900 text-base">Chậu đi kèm có thể chọn</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mockPlanters.map((planter) => {
                  const selected = form.planterOptions.includes(planter.id);
                  return (
                    <label key={planter.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-[#102C26] bg-[#102C26]/5" : "border-gray-100 hover:border-gray-200"}`}>
                      <input type="checkbox" checked={selected} className="accent-[#102C26]"
                        onChange={(e) => setForm((prev) => ({
                          ...prev,
                          planterOptions: e.target.checked
                            ? [...prev.planterOptions, planter.id]
                            : prev.planterOptions.filter((p) => p !== planter.id)
                        }))} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{planter.name}</p>
                        <p className="text-xs text-gray-400">{planter.price.toLocaleString("vi-VN")}đ</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Image + Settings ── */}
          <div className="space-y-5">
            {/* Primary Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900 text-base">Ảnh đại diện *</h2>
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="preview" className="w-full aspect-square object-cover rounded-xl border border-gray-100" />
              ) : (
                <div className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <CloudArrowUp size={32} />
                  <p className="text-xs text-center">Nhập URL để xem trước</p>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                Thư viện ảnh
                <span className="text-xs font-normal text-gray-400">({form.images.length} ảnh)</span>
              </h2>

              {/* Existing images */}
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={img} alt={`img-${i}`} className="w-full h-full object-cover rounded-lg border border-gray-100" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Trash size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add image url */}
              <div className="flex gap-2">
                <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                  placeholder="URL ảnh..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all" />
                <button type="button" onClick={addImage}
                  className="bg-[#102C26]/10 text-[#102C26] px-3 rounded-lg hover:bg-[#102C26]/20 transition-colors">
                  <Plus size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900 text-base">Trạng thái</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.inStock}
                  onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                  className="w-4 h-4 accent-[#102C26]" />
                <span className="text-sm font-medium text-gray-700">Còn hàng</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <button type="submit"
            className="bg-[#102C26] text-[#F7E7CE] font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#102C26]/90 transition-all shadow-sm flex items-center gap-2">
            <PencilSimple size={16} /> {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="text-gray-500 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-all">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
