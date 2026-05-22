import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowSquareOut,
  ChatCircleDots,
  ClockCounterClockwise,
  HouseLine,
  PaperPlaneTilt,
  Sparkle,
  Minus,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { productService } from "../../services/productService";
import type {
  PlantAdvisorHistoryEntry,
  PlantAdvisorPreferences,
  PlantAdvisorResponse,
} from "../../services/productService";
import { useAuthStore } from "../../stores/authStore";

type AdvisorStep = "budget" | "light" | "pets" | "priority" | "custom-prompt" | "loading" | "done";

interface AdvisorChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const advisorDefaultPreferences: PlantAdvisorPreferences = {
  budget: 350000,
  lightLevel: "medium",
  hasPets: false,
  priority: "easy-care",
  customPrompt: "",
};

const advisorBudgetSuggestions = [200000, 350000, 500000, 800000];

const advisorLightOptions: Array<{
  value: PlantAdvisorPreferences["lightLevel"];
  label: string;
}> = [
  { value: "low", label: "Ít sáng" },
  { value: "medium", label: "Ánh sáng vừa" },
  { value: "bright", label: "Sáng mạnh" },
];

const advisorPriorityOptions: Array<{
  value: PlantAdvisorPreferences["priority"];
  label: string;
}> = [
  { value: "easy-care", label: "Dễ chăm" },
  { value: "decor", label: "Decor đẹp" },
];

function createAdvisorMessage(role: AdvisorChatMessage["role"], text: string): AdvisorChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function formatAdvisorBudget(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getLightLabel(value: PlantAdvisorPreferences["lightLevel"]) {
  return advisorLightOptions.find((option) => option.value === value)?.label || "Ánh sáng vừa";
}

function getPetsLabel(value: boolean) {
  return value ? "Có nuôi thú cưng" : "Không nuôi thú cưng";
}

function getPriorityLabel(value: PlantAdvisorPreferences["priority"]) {
  return advisorPriorityOptions.find((option) => option.value === value)?.label || "Dễ chăm";
}

function createInitialAdvisorMessages() {
  return [
    createAdvisorMessage("assistant", "Tôi sẽ hỏi nhanh 4 câu để chọn cây phù hợp nhất cho bạn."),
    createAdvisorMessage("assistant", "Trước hết, bạn muốn ngân sách khoảng bao nhiêu?"),
  ];
}

function buildAdvisorSummaryMessage(result: PlantAdvisorResponse) {
  const names = result.recommendations
    .map((entry, index) => `${index + 1}. ${entry.product.title}`)
    .join("\n");

  return `${result.summary}\n\nTôi đã chọn sẵn các gợi ý sau:\n${names}`;
}

function buildHistoryTranscript(entry: PlantAdvisorHistoryEntry) {
  return [
    createAdvisorMessage("assistant", "Đây là phiên tư vấn bạn đã lưu trước đó."),
    createAdvisorMessage("user", `Ngân sách khoảng ${formatAdvisorBudget(entry.budget)}`),
    createAdvisorMessage("user", `Ánh sáng: ${getLightLabel(entry.lightLevel)}`),
    createAdvisorMessage("user", `Thú cưng: ${getPetsLabel(entry.hasPets)}`),
    createAdvisorMessage("user", `Ưu tiên: ${getPriorityLabel(entry.priority)}`),
    ...(entry.customPrompt
      ? [createAdvisorMessage("user", `Yêu cầu thêm: ${entry.customPrompt}`)]
      : []),
    createAdvisorMessage(
      "assistant",
      buildAdvisorSummaryMessage({
        summary: entry.summary,
        recommendations: entry.recommendations,
      })
    ),
  ];
}

function getPriceRangeIndexByValue(price: number) {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (price < 200000) return 1;
  if (price <= 400000) return 2;
  return 3;
}

export function PlantAdvisorChatbox() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [advisorForm, setAdvisorForm] = useState<PlantAdvisorPreferences>(advisorDefaultPreferences);
  const [advisorResult, setAdvisorResult] = useState<PlantAdvisorResponse | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorHistory, setAdvisorHistory] = useState<PlantAdvisorHistoryEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [advisorStep, setAdvisorStep] = useState<AdvisorStep>("budget");
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorChatMessage[]>(createInitialAdvisorMessages);
  const [budgetDraft, setBudgetDraft] = useState(String(advisorDefaultPreferences.budget));
  const [customPromptDraft, setCustomPromptDraft] = useState(advisorDefaultPreferences.customPrompt || "");
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const hiddenOnRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/payment");

  useEffect(() => {
    const node = messageListRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [advisorMessages, isAdvisorLoading, advisorResult, showHistory, isOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAdvisorHistory([]);
      setIsHistoryLoading(false);
      return;
    }

    let active = true;
    setIsHistoryLoading(true);
    productService.getAdvisorHistory()
      .then((history) => {
        if (active) {
          setAdvisorHistory(history);
        }
      })
      .catch(() => {
        if (active) {
          setAdvisorHistory([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const appendAdvisorMessages = (...messages: AdvisorChatMessage[]) => {
    setAdvisorMessages((prev) => [...prev, ...messages]);
  };

  const resetAdvisorChat = () => {
    setAdvisorForm(advisorDefaultPreferences);
    setBudgetDraft(String(advisorDefaultPreferences.budget));
    setCustomPromptDraft(advisorDefaultPreferences.customPrompt || "");
    setAdvisorResult(null);
    setAdvisorStep("budget");
    setAdvisorMessages(createInitialAdvisorMessages());
    setShowHistory(false);
  };

  const runAdvisor = async (preferences: PlantAdvisorPreferences) => {
    try {
      setIsAdvisorLoading(true);
      setAdvisorStep("loading");

      const result = await productService.getAdvisorRecommendations(preferences);
      setAdvisorResult(result);
      setAdvisorStep("done");
      appendAdvisorMessages(createAdvisorMessage("assistant", buildAdvisorSummaryMessage(result)));

      if (isAuthenticated) {
        productService.getAdvisorHistory()
          .then(setAdvisorHistory)
          .catch(() => undefined);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "AI chưa thể đưa ra gợi ý lúc này";
      toast.error(message);
      setAdvisorStep("priority");
      appendAdvisorMessages(createAdvisorMessage("assistant", "Tôi chưa lấy được kết quả. Bạn thử lại ngay nhé."));
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const handleBudgetSubmit = (budgetValue?: number) => {
    const nextBudget = budgetValue ?? Number(budgetDraft);
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) {
      toast.error("Vui lòng nhập ngân sách hợp lệ");
      return;
    }

    setAdvisorForm((prev) => ({ ...prev, budget: nextBudget }));
    setBudgetDraft(String(nextBudget));
    setAdvisorStep("light");
    appendAdvisorMessages(
      createAdvisorMessage("user", `Ngân sách khoảng ${formatAdvisorBudget(nextBudget)}`),
      createAdvisorMessage("assistant", "Bạn đặt cây ở môi trường ánh sáng nào?")
    );
  };

  const handleLightSelect = (lightLevel: PlantAdvisorPreferences["lightLevel"]) => {
    setAdvisorForm((prev) => ({ ...prev, lightLevel }));
    appendAdvisorMessages(
      createAdvisorMessage("user", `Ánh sáng: ${getLightLabel(lightLevel)}`),
      createAdvisorMessage("assistant", "Nhà bạn có nuôi thú cưng không?")
    );
    setAdvisorStep("pets");
  };

  const handlePetsSelect = (hasPets: boolean) => {
    setAdvisorForm((prev) => ({ ...prev, hasPets }));
    appendAdvisorMessages(
      createAdvisorMessage("user", `Thú cưng: ${getPetsLabel(hasPets)}`),
      createAdvisorMessage("assistant", "Bạn muốn ưu tiên cây dễ chăm hay decor đẹp hơn?")
    );
    setAdvisorStep("priority");
  };

  const handlePrioritySelect = async (priority: PlantAdvisorPreferences["priority"]) => {
    setAdvisorForm((prev) => ({ ...prev, priority }));
    appendAdvisorMessages(
      createAdvisorMessage("user", `Ưu tiên: ${getPriorityLabel(priority)}`),
      createAdvisorMessage("assistant", "Bạn có muốn thêm yêu cầu riêng cho AI trước khi tôi chốt gợi ý không?")
    );
    setAdvisorStep("custom-prompt");
  };

  const handleCustomPromptSubmit = async (promptOverride?: string) => {
    const customPrompt = (promptOverride ?? customPromptDraft).trim();
    const nextPreferences = {
      ...advisorForm,
      customPrompt,
    };
    setAdvisorForm(nextPreferences);

    if (customPrompt) {
      appendAdvisorMessages(createAdvisorMessage("user", `Yêu cầu thêm: ${customPrompt}`));
    } else {
      appendAdvisorMessages(createAdvisorMessage("user", "Không có yêu cầu thêm."));
    }

    await runAdvisor(nextPreferences);
  };

  const handleCustomPromptKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (isAdvisorLoading) return;
    void handleCustomPromptSubmit();
  };

  const handleRestoreAdvisorHistory = (entry: PlantAdvisorHistoryEntry) => {
    setAdvisorForm({
      budget: entry.budget,
      lightLevel: entry.lightLevel,
      hasPets: entry.hasPets,
      priority: entry.priority,
      customPrompt: entry.customPrompt || "",
    });
    setBudgetDraft(String(entry.budget));
    setCustomPromptDraft(entry.customPrompt || "");
    setAdvisorResult({
      summary: entry.summary,
      recommendations: entry.recommendations,
    });
    setAdvisorStep("done");
    setAdvisorMessages(buildHistoryTranscript(entry));
    setShowHistory(false);
    setIsOpen(true);
  };

  const handleOpenProduct = (productId: string | number) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
  };

  const handleOpenShop = (category?: string, price?: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const priceRange = getPriceRangeIndexByValue(Number(price));
    if (priceRange > 0) params.set("priceRange", String(priceRange));
    const query = params.toString();
    navigate(query ? `/shop?${query}` : "/shop");
    setIsOpen(false);
  };

  if (hiddenOnRoute) return null;

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-5 right-5 z-50 h-[min(720px,calc(100vh-40px))] w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(252,255,251,0.98),rgba(242,249,243,0.98))] shadow-[0_30px_100px_rgba(23,51,35,0.22)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-emerald-200/80 bg-[linear-gradient(135deg,rgba(29,78,54,0.96),rgba(52,105,70,0.95))] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14">
                <Sparkle size={20} weight="fill" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em]">Plant Advisor</p>
                <p className="text-xs text-white/80">Chatbox tư vấn chọn cây theo nhu cầu</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAdvisorChat}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/18"
              >
                Mới
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition-colors hover:bg-white/18"
                aria-label="Thu gọn chatbox"
              >
                <Minus size={16} />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(100%-76px)] flex-col">
            <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                {isAuthenticated ? "Lịch sử được lưu" : "Dùng nhanh không cần đăng nhập"}
              </p>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800 transition-colors hover:bg-emerald-50"
                >
                  <ClockCounterClockwise size={14} />
                  {showHistory ? "Ẩn lịch sử" : "Xem lịch sử"}
                </button>
              )}
            </div>

            {showHistory && (
              <div className="border-b border-emerald-100 bg-white/75 px-4 py-3">
                {advisorHistory.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-emerald-200 px-4 py-3 text-sm text-emerald-900/70">
                    {isHistoryLoading ? "Đang tải lịch sử..." : "Bạn chưa có phiên tư vấn nào được lưu."}
                  </p>
                ) : (
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {advisorHistory.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleRestoreAdvisorHistory(entry)}
                        className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-left transition-colors hover:bg-emerald-100/70"
                      >
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-800">
                          {new Date(entry.createdAt).toLocaleString("vi-VN")}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {formatAdvisorBudget(entry.budget)} • {getLightLabel(entry.lightLevel)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {advisorMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "assistant"
                      ? "bg-emerald-50 text-emerald-950"
                      : "ml-auto bg-emerald-700 text-white"
                  }`}
                >
                  {message.text.split("\n").map((line, index) => (
                    <p key={`${message.id}-${index}`}>{line}</p>
                  ))}
                </div>
              ))}

              {isAdvisorLoading && (
                <div className="max-w-[88%] rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkle size={15} className="animate-pulse" weight="fill" />
                    Đang phân tích dữ liệu sản phẩm...
                  </div>
                </div>
              )}

              {advisorResult && (
                <div className="space-y-3 pt-2">
                  {advisorResult.recommendations.map(({ product, reason, fitTags }) => (
                    <div key={product.id} className="rounded-[24px] border border-emerald-200 bg-white p-3 shadow-sm">
                      <div className="flex gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(255,253,247,1),rgba(237,244,231,0.8))]">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full bg-emerald-50" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-black text-foreground">{product.title}</p>
                          <p className="mt-1 text-sm font-bold text-emerald-700">
                            {Number(product.price).toLocaleString("vi-VN")}đ
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {fitTags.map((tag) => (
                              <span
                                key={`${product.id}-${tag}`}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">{reason}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProduct(product.id)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800"
                        >
                          <ArrowSquareOut size={14} />
                          Xem chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenShop(product.category, product.price)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-50"
                        >
                          <HouseLine size={14} />
                          Mở shop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-emerald-100 bg-white/88 px-4 py-4">
              {advisorStep === "budget" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3">
                      <input
                        type="number"
                        min={50000}
                        step={50000}
                        value={budgetDraft}
                        onChange={(event) => setBudgetDraft(event.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                        placeholder="Ví dụ: 350000"
                      />
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">VNĐ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBudgetSubmit()}
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-black text-white transition-colors hover:bg-emerald-800"
                    >
                      <PaperPlaneTilt size={16} weight="fill" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {advisorBudgetSuggestions.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleBudgetSubmit(amount)}
                        className="rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-800 transition-colors hover:bg-emerald-50"
                      >
                        {formatAdvisorBudget(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {advisorStep === "light" && (
                <div className="grid gap-2">
                  {advisorLightOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleLightSelect(option.value)}
                      className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-left text-sm font-bold text-foreground transition-colors hover:bg-emerald-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {advisorStep === "pets" && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Không nuôi thú cưng", value: false },
                    { label: "Có nuôi thú cưng", value: true },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handlePetsSelect(option.value)}
                      className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-emerald-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {advisorStep === "priority" && (
                <div className="grid gap-2">
                  {advisorPriorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handlePrioritySelect(option.value)}
                      className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-left text-sm font-bold text-foreground transition-colors hover:bg-emerald-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {advisorStep === "custom-prompt" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-white p-3">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                      Yêu cầu thêm cho AI
                    </label>
                    <textarea
                      value={customPromptDraft}
                      onChange={(event) => setCustomPromptDraft(event.target.value)}
                      onKeyDown={handleCustomPromptKeyDown}
                      placeholder="Ví dụ: cây để bàn, ít rụng lá, tone tối giản"
                      rows={3}
                      maxLength={280}
                      className="mt-2 w-full resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">Enter để gửi, Shift+Enter để xuống dòng.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCustomPromptSubmit();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                    >
                      <PaperPlaneTilt size={16} weight="fill" />
                      Gửi tư vấn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPromptDraft("");
                        void handleCustomPromptSubmit("");
                      }}
                      className="rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-50"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </div>
              )}

              {(advisorStep === "loading" || advisorStep === "done") && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {advisorStep === "loading"
                      ? "AI đang phân tích dữ liệu catalog và câu trả lời của bạn."
                      : "Bạn có thể mở shop, xem chi tiết sản phẩm hoặc bắt đầu một phiên tư vấn mới."}
                  </p>
                  {advisorStep === "done" && (
                    <button
                      type="button"
                      onClick={resetAdvisorChat}
                      className="shrink-0 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-emerald-800 transition-colors hover:bg-emerald-50"
                    >
                      Phiên mới
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,247,239,0.96))] px-5 py-4 text-left shadow-[0_20px_60px_rgba(23,51,35,0.20)] transition-transform hover:-translate-y-1"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-950/20">
            <ChatCircleDots size={22} weight="fill" />
          </span>
          <span>
            <span className="block text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AI Tư Vấn</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">Mở chatbox chọn cây</span>
          </span>
        </button>
      )}
    </>
  );
}
