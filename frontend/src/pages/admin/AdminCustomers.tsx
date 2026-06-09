import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MagnifyingGlass, Eye, ShoppingBag, Phone } from "@phosphor-icons/react";
import { adminApi } from "../../services/apiService";
import { toast } from "sonner";
import {
  getCustomerSegmentLabel,
  getSegmentBadgeClass,
  resolveCustomerSegment,
  type CustomerSegment,
} from "../../utils/customerSegments";

interface Customer {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  created_at: string;
  orderCount: number;
  deliveredOrderCount?: number;
  totalSpent: number;
  lastOrderDate?: string | null;
  segment?: CustomerSegment;
}

interface CustomerDetail extends Customer {
  addresses: Array<{
    id: number;
    label: string;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward?: string | null;
    addressLine: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    date: string;
    status: string;
    total: number;
  }>;
  reviews: Array<{ id: number; productTitle: string; rating: number }>;
  wishlistCount: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    adminApi.listCustomers()
      .then((data) => setCustomers(data as Customer[]))
      .catch(() => toast.error("Không thể tải danh sách khách hàng"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    adminApi.getCustomerDetail(selected.id)
      .then((data) => setDetail(data as CustomerDetail))
      .catch(() => {
        setDetail(null);
        toast.error("Không thể tải chi tiết khách hàng");
      })
      .finally(() => setDetailLoading(false));
  }, [selected]);

  const filtered = customers.filter((customer) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      String(customer.id).includes(query) ||
      (customer.phone ?? "").toLowerCase().includes(query)
    );
  });

  const activeCustomer = detail ?? selected;
  const segment = activeCustomer ? resolveCustomerSegment(activeCustomer) : "regular";

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Khách hàng</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} khách hàng</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, mã..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
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
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">SĐT</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn hàng</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng chi</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Đơn gần nhất</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Ngày đăng ký</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground font-medium">Không có khách hàng nào</td></tr>
                  ) : filtered.map((customer) => (
                    <tr key={customer.id}
                      className={`hover:bg-secondary/10 transition-colors cursor-pointer ${selected?.id === customer.id ? "bg-primary/10" : ""}`}
                      onClick={() => setSelected(customer)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/25 flex items-center justify-center text-xs font-black text-primary shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{customer.name}</p>
                            <p className="text-muted-foreground text-[11px]">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-muted-foreground text-xs">{customer.phone || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-foreground">{customer.orderCount}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-primary text-xs">{(customer.totalSpent || 0).toLocaleString("vi-VN")}đ</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-muted-foreground text-xs">
                          {customer.lastOrderDate
                            ? new Date(customer.lastOrderDate).toLocaleDateString("vi-VN")
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-muted-foreground text-xs">{new Date(customer.created_at).toLocaleDateString("vi-VN")}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={(e) => { e.stopPropagation(); setSelected(customer); }}
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

        {selected && (
          <div className="w-full lg:w-80 shrink-0 bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4 self-start">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/25 flex items-center justify-center text-2xl font-black text-primary mx-auto mb-3">
                {selected.name.charAt(0)}
              </div>
              <p className="font-black text-foreground">{selected.name}</p>
              <p className="text-muted-foreground text-sm">{selected.email}</p>
              {selected.phone && (
                <p className="text-muted-foreground text-xs mt-1 inline-flex items-center gap-1 justify-center">
                  <Phone size={12} /> {selected.phone}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2.5 text-sm">
              {[
                { label: "Ngày đăng ký", value: new Date(selected.created_at).toLocaleDateString("vi-VN") },
                { label: "Tổng đơn hàng", value: `${selected.orderCount} đơn` },
                { label: "Đơn đã giao", value: `${selected.deliveredOrderCount ?? 0} đơn` },
                { label: "Tổng chi tiêu", value: `${(selected.totalSpent || 0).toLocaleString("vi-VN")}đ` },
                {
                  label: "Đơn gần nhất",
                  value: selected.lastOrderDate
                    ? new Date(selected.lastOrderDate).toLocaleDateString("vi-VN")
                    : "—",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 flex flex-wrap gap-2">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${getSegmentBadgeClass(segment)}`}>
                {segment === "vip" ? `⭐ ${getCustomerSegmentLabel(segment)}` : getCustomerSegmentLabel(segment)}
              </span>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-4">
                <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detail && (
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Địa chỉ đã lưu</span>
                  <span className="font-semibold">{detail.addresses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đánh giá</span>
                  <span className="font-semibold">{detail.reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yêu thích</span>
                  <span className="font-semibold">{detail.wishlistCount}</span>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-3">
              <Link
                to={`/admin/orders?customerId=${selected.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <ShoppingBag size={16} />
                Xem đơn hàng
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}