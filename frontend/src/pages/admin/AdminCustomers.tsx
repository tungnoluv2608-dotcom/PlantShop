import { useState } from "react";
import { MagnifyingGlass, Eye } from "@phosphor-icons/react";

// Mock customer data
const mockCustomers = [
  { id: "c1", name: "Nguyễn Văn Minh", email: "minh@email.com", phone: "0901 234 567", orders: 3, totalSpent: 1550000, joined: "2026-01-15", location: "TP.HCM" },
  { id: "c2", name: "Trần Thị Lan", email: "lan.tran@gmail.com", phone: "0912 345 678", orders: 1, totalSpent: 480000, joined: "2026-02-01", location: "Hà Nội" },
  { id: "c3", name: "Lê Hoàng Nam", email: "nam.le@company.vn", phone: "0923 456 789", orders: 5, totalSpent: 3200000, joined: "2025-12-10", location: "Đà Nẵng" },
  { id: "c4", name: "Phạm Thu Hương", email: "huong.pham@yahoo.com", phone: "0934 567 890", orders: 2, totalSpent: 890000, joined: "2026-01-28", location: "TP.HCM" },
  { id: "c5", name: "Võ Minh Đức", email: "duc.vo@outlook.com", phone: "0945 678 901", orders: 7, totalSpent: 5100000, joined: "2025-11-05", location: "Cần Thơ" },
  { id: "c6", name: "Đặng Thị Mai", email: "mai.dang@gmail.com", phone: "0956 789 012", orders: 1, totalSpent: 350000, joined: "2026-03-01", location: "Bình Dương" },
  { id: "c7", name: "Hoàng Văn Tú", email: "tu.hoang@email.com", phone: "0967 890 123", orders: 4, totalSpent: 2200000, joined: "2025-10-20", location: "TP.HCM" },
  { id: "c8", name: "Bùi Thị Thảo", email: "thao.bui@gmail.com", phone: "0978 901 234", orders: 2, totalSpent: 720000, joined: "2026-02-14", location: "Hải Phòng" },
];

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof mockCustomers[0] | null>(null);

  const filtered = mockCustomers.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Khách hàng</h1>
          <p className="text-gray-500 text-sm">{filtered.length} khách hàng</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Table */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Khu vực</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng chi</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id}
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-[#102C26]/5" : ""}`}
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#102C26]/10 flex items-center justify-center text-xs font-black text-[#102C26] shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                          <p className="text-gray-400 text-[11px]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-gray-600 text-xs">{c.location}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-gray-900">{c.orders}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-[#102C26] text-xs">{c.totalSpent.toLocaleString("vi-VN")}đ</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#102C26] hover:bg-[#102C26]/10 transition-all">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Sidebar */}
        {selected && (
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 self-start">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#102C26]/10 flex items-center justify-center text-2xl font-black text-[#102C26] mx-auto mb-3">
                {selected.name.charAt(0)}
              </div>
              <p className="font-black text-gray-900">{selected.name}</p>
              <p className="text-gray-500 text-sm">{selected.email}</p>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
              {[
                { label: "Điện thoại", value: selected.phone },
                { label: "Khu vực", value: selected.location },
                { label: "Ngày đăng ký", value: selected.joined },
                { label: "Tổng đơn hàng", value: `${selected.orders} đơn` },
                { label: "Tổng chi tiêu", value: `${selected.totalSpent.toLocaleString("vi-VN")}đ` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${selected.orders >= 5 ? "bg-amber-100 text-amber-700" : selected.orders >= 3 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {selected.orders >= 5 ? "⭐ Khách VIP" : selected.orders >= 3 ? "Khách thân thiết" : "Khách mới"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
