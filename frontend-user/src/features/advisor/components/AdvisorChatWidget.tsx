import { useEffect, useRef, useState } from "react"
import { Loader2, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAdvisorChatStore } from "@/stores/advisorChatStore"
import { ADVISOR_QUICK_SUGGESTIONS } from "@/features/advisor/constants"
import { useAdvisorChat } from "@/features/advisor/api"
import { ChatProductCard } from "@/features/advisor/components/ChatProductCard"
import type { AdvisorChatEntry } from "@/types"

function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AdvisorChatWidget() {
  const isOpen = useAdvisorChatStore((s) => s.isOpen)
  const messages = useAdvisorChatStore((s) => s.messages)
  const openChat = useAdvisorChatStore((s) => s.openChat)
  const closeChat = useAdvisorChatStore((s) => s.closeChat)
  const toggleChat = useAdvisorChatStore((s) => s.toggleChat)
  const resetChat = useAdvisorChatStore((s) => s.resetChat)
  const appendMessage = useAdvisorChatStore((s) => s.appendMessage)
  const updateLastAssistantMessage = useAdvisorChatStore((s) => s.updateLastAssistantMessage)
  const removeLastMessage = useAdvisorChatStore((s) => s.removeLastMessage)

  const chat = useAdvisorChat()
  const [draft, setDraft] = useState("")
  const messagesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const showQuickSuggestions =
    messages.length === 1 && messages[0]?.id === "welcome" && !chat.isPending

  useEffect(() => {
    if (!isOpen) return
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
  }, [isOpen, messages, chat.isPending])

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  const sendMessage = (text: string) => {
    const content = text.trim()
    if (!content || chat.isPending) return

    const userMessage: AdvisorChatEntry = {
      id: createMessageId(),
      role: "user",
      content,
    }
    const pendingAssistant: AdvisorChatEntry = {
      id: createMessageId(),
      role: "assistant",
      content: "",
    }

    const payload = [
      ...messages.filter((entry) => entry.id !== "welcome"),
      { role: "user" as const, content },
    ].map((entry) => ({
      role: entry.role,
      content: entry.content,
    }))

    appendMessage(userMessage)
    appendMessage(pendingAssistant)
    setDraft("")

    chat.mutate(payload, {
      onSuccess: (data) => {
        updateLastAssistantMessage(data.message, data.recommendations)
      },
      onError: (error) => {
        removeLastMessage()
        toast.error(getApiErrorMessage(error, "Không thể gửi tin nhắn. Vui lòng thử lại."))
      },
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    sendMessage(draft)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendMessage(draft)
    }
  }

  return (
    <>
      {!isOpen && (
        <Button
          type="button"
          size="lg"
          className="fixed bottom-5 right-5 z-[60] h-14 gap-2 rounded-full px-5 shadow-lg"
          onClick={openChat}
          aria-label="Mở trợ lý tư vấn cây"
        >
          <MessageCircle className="size-5" />
          <span className="hidden sm:inline">Tư vấn AI</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[60] flex h-[min(78vh,560px)] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <header className="flex shrink-0 items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <span className="grid size-8 place-items-center rounded-full bg-primary-foreground/15">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Trợ lý PlantShop</p>
              <p className="truncate text-xs opacity-80">Tư vấn chọn cây & chăm sóc</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              onClick={resetChat}
              disabled={chat.isPending}
              aria-label="Bắt đầu lại"
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              onClick={closeChat}
              aria-label="Đóng chat"
            >
              <X className="size-4" />
            </Button>
          </header>

          <div
            ref={messagesRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
          >
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isUser = message.role === "user"
                const isTyping =
                  !isUser && chat.isPending && index === messages.length - 1 && !message.content

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[92%] space-y-2 rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        isUser
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-muted text-foreground",
                      )}
                    >
                      {isTyping ? (
                        <div className="flex items-center gap-2 py-1 text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Đang suy nghĩ...</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}

                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {message.recommendations.map((rec) => (
                            <ChatProductCard key={rec.product.id} rec={rec} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {showQuickSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ADVISOR_QUICK_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto rounded-full px-3 py-1.5 text-xs"
                      onClick={() => sendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

            </div>
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Nhập câu hỏi của bạn..."
                className="min-h-[44px] resize-none"
                disabled={chat.isPending}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0"
                disabled={!draft.trim() || chat.isPending}
                aria-label="Gửi tin nhắn"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/20 md:hidden"
          onClick={toggleChat}
          aria-label="Đóng chat"
        />
      )}
    </>
  )
}