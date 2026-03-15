import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  User, ShoppingBag, MapPin, Heart, Key, Package,
  CheckCircle, Truck, Clock, XCircle, WarningCircle,
  ArrowClockwise, Star, Camera
} from "@phosphor-icons/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/ui/ProductCard";
import type { Order, ShippingAddress } from "../types";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import { useWishlistStore } from "../stores/wishlistStore";
import { orderApi } from "../services/apiService";
import { addressService } from "../services/addressService";
import { VIETNAM_PROVINCES, getDistricts } from "../data/vietnamLocations";

const tabs = [
  { id: "profile", label: "Hồ sơ", icon: User },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "address", label: "Địa chỉ", icon: MapPin },
  { id: "wishlist", label: "Yêu thích", icon: Heart },
  { id: "password", label: "Đổi mật khẩu", icon: Key },
];

const statusConfig: Record<Order["status"], { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: <Clock size={14} weight="fill" /> },
  confirmed: { label: "Đã xác nhận",  color: "text-blue-600 bg-blue-50 border-blue-200",     icon: <CheckCircle size={14} weight="fill" /> },
  packing:   { label: "Đang đóng gói", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Package size={14} weight="fill" /> },
  shipping:  { label: "Đang vận chuyển", color: "text-orange-600 bg-orange-50 border-orange-200", icon: <Truck size={14} weight="fill" /> },
  delivered: { label: "Đã giao hàng", color: "text-green-700 bg-green-50 border-green-200",   icon: <CheckCircle size={14} weight="fill" /> },
  cancelled: { label: "Đã hủy",        color: "text-red-600 bg-red-50 border-red-200",         icon: <XCircle size={14} weight="fill" /> },
  returning: { label: "Đang đổi/trả",  color: "text-purple-600 bg-purple-50 border-purple-200", icon: <WarningCircle size={14} weight="fill" /> },
};

const isNumericProductId = (id: string) => /^\d+$/.test(id);

const emptyAddressForm: Omit<ShippingAddress, "id"> = {
  label: "",
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  isDefault: false,
};

function OrderCard({ order, onCancel, onReview }: { order: Order; onCancel: (id: string) => void; onReview: (order: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[order.status];

  return (
    <div className="bg-white rounded-2xl border border-secondary overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-black text-primary text-sm tracking-wider">{order.id}</p>
          <p className="text-xs text-foreground/50">Đặt ngày {order.date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
          <span className="font-black text-foreground">{order.total.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* Items preview */}
      <div className="border-t border-secondary px-5 py-4 flex gap-3 overflow-x-auto">
        {order.items.map((item) => (
          isNumericProductId(item.id) ? (
            <Link
              key={`${order.id}-${item.id}`}
              to={`/product/${item.id}`}
              className="flex items-center gap-3 min-w-0 shrink-0 rounded-xl p-1 -m-1 hover:bg-gray-50 transition-colors"
              title="Xem sản phẩm"
            >
              <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-[140px] hover:text-primary transition-colors">{item.title}</p>
                <p className="text-xs text-foreground/50">x{item.quantity} · {item.price.toLocaleString("vi-VN")}đ</p>
              </div>
            </Link>
          ) : (
            <div key={`${order.id}-${item.title}-${item.quantity}`} className="flex items-center gap-3 min-w-0 shrink-0">
              <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">{item.title}</p>
                <p className="text-xs text-foreground/50">x{item.quantity} · {item.price.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Actions */}
      <div className="border-t border-secondary px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <button onClick={() => setExpanded(!expanded)} className="text-sm text-primary font-semibold hover:underline">
          {expanded ? "Ẩn chi tiết ▲" : "Xem chi tiết ▼"}
        </button>
        <div className="flex gap-2 flex-wrap">
          {order.status === "delivered" && (
            <>
              <button onClick={() => onReview(order)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
                <Star size={15} weight="fill" /> Đánh giá
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <ArrowClockwise size={15} weight="bold" /> Mua lại
              </button>
            </>
          )}
          {order.status === "shipping" && order.trackingNumber && (
            <a href="#" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-orange-300 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors">
              <Truck size={15} weight="fill" /> Theo dõi đơn
            </a>
          )}
          {(order.status === "pending" || order.status === "confirmed") && (
            <button
              onClick={() => onCancel(order.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
              <XCircle size={15} /> Hủy đơn
            </button>
          )}
        </div>
      </div>

      {/* Expanded: Timeline */}
      {expanded && (
        <div className="border-t border-secondary px-5 py-5 bg-gray-50/50">
          <h4 className="text-sm font-bold text-foreground mb-4">Trạng thái đơn hàng</h4>
          <div className="flex flex-col gap-3 relative">
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-200" />
            {order.timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? "bg-primary" : "bg-gray-200"}`}>
                  {step.done ? <CheckCircle size={14} weight="fill" className="text-white" /> : <span className="w-2 h-2 rounded-full bg-gray-400 block" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-foreground/40"}`}>{step.status}</p>
                  {step.date && <p className="text-xs text-foreground/50 mt-0.5">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 text-sm space-y-2 text-foreground/70">
            <div className="flex justify-between"><span>Địa chỉ giao hàng:</span><span className="font-medium text-right max-w-[200px]">{order.shippingAddress}</span></div>
            <div className="flex justify-between"><span>Thanh toán:</span><span className="font-medium">{order.paymentMethod}</span></div>
            {order.trackingNumber && <div className="flex justify-between"><span>Mã vận đơn:</span><span className="font-mono font-bold text-primary">{order.trackingNumber}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(location.pathname === "/profile/orders" ? "orders" : "profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    dob: ""
  });
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<ShippingAddress, "id">>(() => ({
    ...emptyAddressForm,
    fullName: user?.name || "",
  }));
  const wishlistItems = useWishlistStore((s) => s.items);
  const wishlistLoading = useWishlistStore((s) => s.isLoading);
  const syncWishlist = useWishlistStore((s) => s.syncWishlist);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      toast.error("Vui lòng đăng nhập để xem trang cá nhân");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      setOrdersLoading(true);
      orderApi.getMyOrders()
        .then(setOrders)
        .catch(() => toast.error("Không thể tải đơn hàng"))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab !== "address" || !isAuthenticated) return;
    addressService
      .list()
      .then(setAddresses)
      .catch(() => toast.error("Không thể tải sổ địa chỉ"));
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab !== "wishlist" || !isAuthenticated) return;
    syncWishlist().catch(() => toast.error("Không thể tải danh sách yêu thích"));
  }, [activeTab, isAuthenticated, syncWishlist]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderApi.cancel(orderId);
      toast.success("Đã hủy đơn hàng");
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "cancelled" as Order["status"] } : o));
    } catch {
      toast.error("Không thể hủy đơn hàng");
    }
  };

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);

  const handleReviewOrder = (order: Order) => {
    const reviewableItem = order.items.find((item) => isNumericProductId(item.id));
    if (!reviewableItem) {
      toast.error("Không tìm thấy sản phẩm để đánh giá trong đơn hàng này");
      return;
    }
    navigate(`/product/${reviewableItem.id}?tab=reviews`);
  };

  const handleProfileSave = () => {
    updateUser({ name: profileForm.name, email: profileForm.email });
    toast.success("Đã cập nhật hồ sơ thành công!");
  };

  const resetAddressForm = () => {
    setAddressForm({ ...emptyAddressForm, fullName: profileForm.name || user?.name || "" });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleAddressFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => {
      if (name === "province") {
        return { ...prev, province: value, district: "", ward: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddressSave = () => {
    if (!addressForm.label.trim() || !addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.province || !addressForm.district || !addressForm.address.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ bắt buộc");
      return;
    }

    const payload = {
      ...addressForm,
      label: addressForm.label.trim(),
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      address: addressForm.address.trim(),
    };

    const action = editingAddressId
      ? addressService.update(editingAddressId, payload)
      : addressService.create(payload);

    action
      .then(() => addressService.list())
      .then((list) => {
        setAddresses(list);
        toast.success(editingAddressId ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ mới");
        resetAddressForm();
      })
      .catch(() => toast.error("Không thể lưu địa chỉ"));
  };

  const handleEditAddress = (addr: ShippingAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward || "",
      address: addr.address,
      isDefault: addr.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    addressService
      .remove(id)
      .then(() => addressService.list())
      .then((list) => {
        setAddresses(list);
        toast.success("Đã xóa địa chỉ");
      })
      .catch(() => toast.error("Không thể xóa địa chỉ"));
  };

  const handleSetDefaultAddress = (id: string) => {
    addressService
      .setDefault(id)
      .then(() => addressService.list())
      .then((list) => {
        setAddresses(list);
        toast.success("Đã đặt làm địa chỉ mặc định");
      })
      .catch(() => toast.error("Không thể cập nhật địa chỉ mặc định"));
  };

  if (!isAuthenticated) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#F0F5F1] font-sans text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary border-2 border-primary/20">
              {getInitials(profileForm.name || "User")}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow">
              <Camera size={12} weight="fill" className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-xl font-black">{profileForm.name}</p>
            <p className="text-sm text-foreground/60">{profileForm.email}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-60 shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-secondary p-2 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-gray-50"}`}
                >
                  <Icon size={18} weight={activeTab === id ? "fill" : "regular"} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: "Họ và tên", key: "name", placeholder: "Nguyễn Văn A" },
                    { label: "Số điện thoại", key: "phone", placeholder: "0901 234 567" },
                    { label: "Email", key: "email", placeholder: "email@example.com" },
                    { label: "Ngày sinh", key: "dob", placeholder: "", type: "date" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-foreground/70 mb-1.5">{label}</label>
                      <input
                        type={type ?? "text"}
                        value={profileForm[key as keyof typeof profileForm]}
                        onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleProfileSave} className="mt-6 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md">
                  Lưu thay đổi
                </button>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl shadow-sm border border-secondary p-4 flex flex-wrap gap-2">
                  {[
                    { val: "all", label: "Tất cả" },
                    { val: "shipping", label: "Đang giao" },
                    { val: "delivered", label: "Đã giao" },
                    { val: "cancelled", label: "Đã hủy" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setOrderFilter(val)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${orderFilter === val ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/60 hover:bg-gray-100"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {ordersLoading ? (
                  <div className="bg-white rounded-2xl border border-secondary p-12 text-center">
                    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-secondary p-12 text-center">
                    <ShoppingBag size={48} className="text-foreground/20 mx-auto mb-4" />
                    <p className="text-foreground/50 font-medium">Không có đơn hàng nào</p>
                    <Link to="/shop" className="mt-4 inline-block text-primary font-bold hover:underline">Mua sắm ngay →</Link>
                  </div>
                ) : (
                  filteredOrders.map((order) => <OrderCard key={order.id} order={order} onCancel={handleCancelOrder} onReview={handleReviewOrder} />)
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Địa chỉ giao hàng</h2>
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm({ ...emptyAddressForm, fullName: profileForm.name || user?.name || "" });
                      setShowAddressForm((prev) => !prev);
                    }}
                    className="text-sm font-bold text-primary border border-primary px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    {showAddressForm ? "Đóng" : "+ Thêm địa chỉ"}
                  </button>
                </div>

                {showAddressForm && (
                  <div className="mb-6 border border-gray-200 rounded-2xl p-5 bg-gray-50/40">
                    <h3 className="font-bold mb-4">{editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Nhãn địa chỉ *</label>
                        <input name="label" value={addressForm.label} onChange={handleAddressFieldChange} placeholder="Nhà riêng, Văn phòng..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Người nhận *</label>
                        <input name="fullName" value={addressForm.fullName} onChange={handleAddressFieldChange} placeholder="Nguyễn Văn A"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Số điện thoại *</label>
                        <input name="phone" value={addressForm.phone} onChange={handleAddressFieldChange} placeholder="0901 234 567"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Tỉnh / Thành phố *</label>
                        <select name="province" value={addressForm.province} onChange={handleAddressFieldChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all bg-white">
                          <option value="">Chọn tỉnh/thành</option>
                          {VIETNAM_PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Quận / Huyện *</label>
                        <select name="district" value={addressForm.district} onChange={handleAddressFieldChange} disabled={!addressForm.province}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all bg-white disabled:opacity-50">
                          <option value="">Chọn quận/huyện</option>
                          {getDistricts(addressForm.province).map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Phường / Xã</label>
                        <input name="ward" value={addressForm.ward || ""} onChange={handleAddressFieldChange} placeholder="Phường..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-foreground/70 mb-1.5">Số nhà, tên đường *</label>
                        <input name="address" value={addressForm.address} onChange={handleAddressFieldChange} placeholder="123 Nguyễn Huệ"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all" />
                      </div>
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground/70">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                        className="accent-primary"
                      />
                      Đặt làm địa chỉ mặc định
                    </label>

                    <div className="mt-5 flex gap-3">
                      <button onClick={handleAddressSave} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all">
                        {editingAddressId ? "Lưu cập nhật" : "Lưu địa chỉ"}
                      </button>
                      <button onClick={resetAddressForm} className="border border-gray-300 px-5 py-2.5 rounded-xl font-semibold text-foreground/70 hover:bg-gray-100 transition-all">
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gray-300 rounded-2xl bg-gray-50/40">
                    <p className="text-foreground/50">Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ để dùng cho checkout.</p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className={`border rounded-2xl p-5 mb-4 ${addr.isDefault ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            {addr.label}
                            {addr.isDefault && <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">Mặc định</span>}
                          </p>
                          <p className="text-sm text-foreground/80 mt-1">{addr.fullName} · {addr.phone}</p>
                          <p className="text-sm text-foreground/60 mt-1">
                            {addr.address}, {addr.ward ? `${addr.ward}, ` : ""}{addr.district}, {addr.province}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs text-emerald-600 hover:underline font-semibold">
                              Đặt mặc định
                            </button>
                          )}
                          <button onClick={() => handleEditAddress(addr)} className="text-xs text-primary hover:underline font-semibold">Sửa</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-red-500 hover:underline font-semibold">Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6">Sản phẩm yêu thích</h2>
                {wishlistLoading ? (
                  <div className="bg-white rounded-2xl border border-secondary p-12 text-center">
                    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="text-foreground/20 mx-auto mb-4" />
                    <p className="text-foreground/50 mb-4">Bạn chưa thêm cây nào vào danh sách yêu thích</p>
                    <Link to="/shop" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all inline-block">
                      Khám phá cửa hàng
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlistItems.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        imageUrl={product.imageUrl}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white rounded-2xl shadow-sm border border-secondary p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6">Đổi mật khẩu</h2>
                <div className="max-w-md space-y-4">
                  {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((label) => (
                    <div key={label}>
                      <label className="block text-sm font-semibold text-foreground/70 mb-1.5">{label}</label>
                      <input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all" placeholder="••••••••" />
                    </div>
                  ))}
                  <button onClick={() => toast.success("Đã cập nhật mật khẩu!")} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md mt-2">
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
