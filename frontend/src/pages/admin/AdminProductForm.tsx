import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CloudArrowUp, Plus, Trash, PencilSimple, Image as ImageIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useImageUpload } from "../../hooks/useImageUpload";
import { adminApi, api } from "../../services/apiService";
import type { CareGuide, Category, Planter } from "../../types";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "new";
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [plantersList, setPlantersList] = useState<Planter[]>([]);

  const [form, setForm] = useState({
    title: "",
    price: 0,
    originalPrice: "" as number | "",
    discount: "",
    category: "",
    description: "",
    imageUrl: "",
    images: [] as string[],
    bio: "",
    inStock: true,
    planterOptions: [] as string[],
  });

  const [careGuide, setCareGuide] = useState<CareGuide[]>([]);
  const [newCareTitle, setNewCareTitle] = useState("");
  const [newCareContent, setNewCareContent] = useState("");

  useEffect(() => {
    Promise.all([
      adminApi.listCategories(),
      adminApi.listPlanters(),
      isEdit ? api.get(`/products/${id}`).then(r => r.data) : Promise.resolve(null)
    ]).then(([cats, planters, product]) => {
      setCategories(cats);
      setPlantersList(planters);
      
      if (product) {
        setForm({
          title: product.title ?? "",
          price: product.price ?? 0,
          originalPrice: product.originalPrice ?? "",
          discount: product.discount ?? "",
          category: product.category ?? (cats.length > 0 ? cats[0].name : ""),
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          images: product.images ?? [],
          bio: product.bio ?? "",
          inStock: product.inStock ?? true,
          planterOptions: product.planterOptions ?? [],
        });
        setCareGuide(product.careGuide ?? []);
      } else {
        setForm(prev => ({ ...prev, category: cats.length > 0 ? cats[0].name : "" }));
      }
    }).catch(() => {
      toast.error("Không thể tải thông tin sản phẩm");
    }).finally(() => {
      setLoading(false);
    });
  }, [id, isEdit]);

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

  // useImageUpload hooks
  const { 
    triggerUpload: triggerMainUpload, 
    uploading: mainUploading, 
    InputElement: MainUploadInput 
  } = useImageUpload({ multiple: false });

  const { 
    triggerUpload: triggerGalleryUpload, 
    uploading: galleryUploading, 
    InputElement: GalleryUploadInput 
  } = useImageUpload({ multiple: true });

  const handleMainUploadSuccess = (urls: string[]) => {
    setForm((prev) => ({ ...prev, imageUrl: urls[0] }));
  };

  const handleGalleryUploadSuccess = (urls: string[]) => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (idx: number) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.imageUrl) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }
    
    try {
      const selectedCategory = categories.find(c => c.name === form.category);
      const categoryIdFilter = selectedCategory ? selectedCategory.id : (categories[0]?.id || 1);

      const payload = {
        title: form.title,
        price: form.price,
        originalPrice: form.originalPrice,
        discount: form.discount,
        description: form.description,
        bio: form.bio,
        inStock: form.inStock,
        categoryId: categoryIdFilter,
        planterOptions: form.planterOptions,
        imageUrl: form.imageUrl,
        images: form.images.filter(Boolean),
        careGuide: careGuide.filter((g) => g.title && g.content),
      };

      if (isEdit) {
        await adminApi.updateProduct(id!, payload);
        toast.success(`Đã cập nhật: ${form.title}`);
      } else {
        await adminApi.createProduct(payload);
        toast.success(`Đã thêm sản phẩm: ${form.title}`);
      }
      navigate("/admin/products");
    } catch {
      toast.error("Lưu sản phẩm thất bại. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-10 h-10 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                {plantersList.map((planter) => {
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h2 className="font-bold text-gray-900 text-base">Ảnh đại diện *</h2>
              
              <div 
                onClick={triggerMainUpload}
                className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group
                  ${form.imageUrl ? "border-transparent" : "border-gray-300 hover:border-[#102C26]/50 bg-gray-50 hover:bg-[#102C26]/5"}`}
              >
                {form.imageUrl ? (
                  <>
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                      <CloudArrowUp size={32} />
                      <span className="text-sm font-semibold">Tải ảnh khác</span>
                    </div>
                  </>
                ) : mainUploading ? (
                  <>
                    <span className="animate-spin border-2 border-[#102C26] border-t-transparent rounded-full w-8 h-8 mb-2" />
                    <p className="text-sm font-semibold text-[#102C26]">Đang tải lên...</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-2">
                      <CloudArrowUp size={24} weight="bold" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Click để chọn ảnh đại diện</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP (Tối đa 5MB)</p>
                  </>
                )}
              </div>
              <MainUploadInput onSuccess={handleMainUploadSuccess} accept="image/jpeg, image/png, image/webp" />
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

              {/* Upload image button */}
              <button 
                type="button" 
                onClick={triggerGalleryUpload}
                disabled={galleryUploading}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:border-[#102C26]/50 hover:text-[#102C26] hover:bg-[#102C26]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {galleryUploading ? (
                  <><span className="animate-spin border-2 border-gray-400 border-t-transparent rounded-full w-4 h-4" /> Đang tải...</>
                ) : (
                  <><ImageIcon size={18} /> Chọn nhiều ảnh tải lên</>
                )}
              </button>
              <GalleryUploadInput onSuccess={handleGalleryUploadSuccess} accept="image/jpeg, image/png, image/webp" />
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
