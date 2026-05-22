import { useState, useEffect } from "react";
import { MagnifyingGlass, Eye } from "@phosphor-icons/react";
import { adminApi } from "../../services/apiService";
import { toast } from "sonner";

interface Customer {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    adminApi.listCustomers()
      .then((data) => setCustomers(data as Customer[]))
      .catch(() => toast.error("Không thể tải danh sách khách hàng"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Khách hàng</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} khách hàng</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Table */}
        <div className="flex-1 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn hàng</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng chi</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Ngày đăng ký</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">Không có khách hàng nào</td></tr>
                  ) : filtered.map((c) => (
                    <tr key={c.id}
                      className={`hover:bg-secondary/10 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-primary/10" : ""}`}
                      onClick={() => setSelected(c)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/25 flex items-center justify-center text-xs font-black text-primary shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{c.name}</p>
                            <p className="text-muted-foreground text-[11px]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-foreground">{c.orderCount}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-primary text-xs">{(c.totalSpent || 0).toLocaleString("vi-VN")}đ</span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString("vi-VN")}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all">
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Detail Sidebar */}
        {selected && (
          <div className="w-full lg:w-72 shrink-0 bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4 self-start">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/25 flex items-center justify-center text-2xl font-black text-primary mx-auto mb-3">
                {selected.name.charAt(0)}
              </div>
              <p className="font-black text-foreground">{selected.name}</p>
              <p className="text-muted-foreground text-sm">{selected.email}</p>
            </div>

            <div className="border-t border-border pt-4 space-y-2.5 text-sm">
              {[
                { label: "Ngày đăng ký", value: new Date(selected.created_at).toLocaleDateString("vi-VN") },
                { label: "Tổng đơn hàng", value: `${selected.orderCount} đơn` },
                { label: "Tổng chi tiêu", value: `${(selected.totalSpent || 0).toLocaleString("vi-VN")}đ` },
                { label: "Vai trò", value: selected.role === "admin" ? "Admin" : "Khách hàng" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${selected.orderCount >= 5 ? "bg-amber-500/10 text-amber-500 border-amber-500/25" : selected.orderCount >= 3 ? "bg-blue-500/10 text-blue-400 border-blue-500/25" : "bg-secondary/20 text-muted-foreground border-border"}`}>
                {selected.orderCount >= 5 ? "⭐ Khách VIP" : selected.orderCount >= 3 ? "Khách thân thiết" : "Khách mới"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
