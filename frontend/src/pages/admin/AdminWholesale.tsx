import { useEffect, useMemo, useState } from "react";
import { Buildings, FunnelSimple, MagnifyingGlass, Phone, EnvelopeSimple, ClockCounterClockwise, FloppyDisk } from "@phosphor-icons/react";
import { toast } from "sonner";
import { adminApi } from "../../services/apiService";
import type { WholesaleInquiry, WholesaleInquiryStatus } from "../../types";

const statusOptions: Array<{ value: WholesaleInquiryStatus; label: string; color: string }> = [
  { value: "new", label: "Mới", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  { value: "contacted", label: "Đã liên hệ", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "qualified", label: "Tiềm năng", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "quoted", label: "Đã báo giá", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "won", label: "Chốt thành công", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "lost", label: "Không thành công", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  { value: "archived", label: "Lưu trữ", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
];

function getStatusMeta(status: WholesaleInquiryStatus) {
  return statusOptions.find((item) => item.value === status) || statusOptions[0];
}

export default function AdminWholesale() {
  const [items, setItems] = useState<WholesaleInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [nextStatus, setNextStatus] = useState<WholesaleInquiryStatus>("new");

  useEffect(() => {
    adminApi.listWholesaleInquiries()
      .then((data) => {
        const inquiries = data as WholesaleInquiry[];
        setItems(inquiries);
        if (inquiries[0]) {
          setSelectedId(inquiries[0].id);
        }
      })
      .catch(() => toast.error("Không thể tải yêu cầu bán sỉ"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.trim().toLowerCase();
      const matchSearch = !keyword ||
        item.company.toLowerCase().includes(keyword) ||
        item.contact.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const selected = useMemo(
    () => filtered.find((item) => item.id === selectedId) || items.find((item) => item.id === selectedId) || null,
    [filtered, items, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setAssignedTo(selected.assignedTo || "");
    setAdminNote(selected.adminNote || "");
    setNextStatus(selected.status);
  }, [selected]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateWholesaleInquiry(selected.id, {
        status: nextStatus,
        assignedTo,
        adminNote,
      });
      const nextItem = updated as WholesaleInquiry;
      setItems((prev) => prev.map((item) => item.id === nextItem.id ? nextItem : item));
      toast.success("Đã cập nhật yêu cầu bán sỉ");
    } catch (error: unknown) {
      const message = typeof error === "object" && error && "response" in error
        ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message || "")
        : "";
      toast.error(message || "Không thể cập nhật yêu cầu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Yêu cầu bán sỉ</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} yêu cầu đang hiển thị</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-4 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo công ty, liên hệ, email, số điện thoại..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FunnelSimple size={16} className="text-muted-foreground/60 shrink-0 mt-2" />
          {[{ value: "all", label: "Tất cả" }, ...statusOptions.map(({ value, label }) => ({ value, label }))].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] gap-5">
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Công ty</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Liên hệ</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Quy mô</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tạo lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">Chưa có yêu cầu nào</td>
                    </tr>
                  ) : filtered.map((item) => {
                    const statusMeta = getStatusMeta(item.status);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cursor-pointer hover:bg-secondary/10 transition-colors ${selected?.id === item.id ? "bg-primary/10" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                              <Buildings size={18} weight="fill" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{item.company}</p>
                              <p className="text-muted-foreground text-[11px] truncate">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="font-medium text-foreground">{item.contact}</p>
                          <p className="text-muted-foreground text-xs">{item.phone}</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground">
                          <p>{item.quantity || "Chưa ghi rõ"}</p>
                          <p className="text-xs">{item.type || "Không gian chưa chọn"}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusMeta.color}`}>{statusMeta.label}</span>
                        </td>
                        <td className="px-5 py-4 text-right text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4 self-start">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Chọn một yêu cầu để xem chi tiết.</p>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black text-foreground">{selected.company}</h2>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusMeta(selected.status).color}`}>
                    {getStatusMeta(selected.status).label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Lead #{selected.id} • {new Date(selected.createdAt).toLocaleString("vi-VN")}</p>
              </div>

              <div className="rounded-2xl bg-secondary/20 p-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Phone size={16} className="text-primary" />
                  <span className="font-medium">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <EnvelopeSimple size={16} className="text-primary" />
                  <span className="font-medium break-all">{selected.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ClockCounterClockwise size={16} className="text-primary" />
                  <span>{selected.type || "Không gian chưa chọn"} • {selected.quantity || "Chưa nêu số lượng"}</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Địa điểm:</span> {selected.location || "Chưa rõ"}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Ngân sách:</span> {selected.budget || "Chưa rõ"}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Timeline:</span> {selected.timeline || "Chưa rõ"}
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-foreground">Nhu cầu khách hàng</p>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selected.note || "Khách chưa để lại ghi chú."}</p>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Trạng thái</label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as WholesaleInquiryStatus)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Người phụ trách</label>
                  <input
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="VD: Thanh Tùng Admin"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Ghi chú nội bộ</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={5}
                    placeholder="Ghi chú trao đổi, ngân sách, tiến độ follow-up..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FloppyDisk size={18} weight="fill" />}
                  Lưu cập nhật
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
