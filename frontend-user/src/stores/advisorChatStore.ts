import { create } from "zustand"
import type { AdvisorChatEntry } from "@/types"
import { ADVISOR_WELCOME_MESSAGE } from "@/features/advisor/constants"

function createWelcomeMessage(): AdvisorChatEntry {
  return {
    id: "welcome",
    role: "assistant",
    content: ADVISOR_WELCOME_MESSAGE,
  }
}

interface AdvisorChatState {
  isOpen: boolean
  messages: AdvisorChatEntry[]
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  resetChat: () => void
  appendMessage: (message: AdvisorChatEntry) => void
  updateLastAssistantMessage: (
    content: string,
    recommendations?: AdvisorChatEntry["recommendations"],
  ) => void
  removeLastMessage: () => void
}

export const useAdvisorChatStore = create<AdvisorChatState>((set) => ({
  isOpen: false,
  messages: [createWelcomeMessage()],
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  resetChat: () => set({ messages: [createWelcomeMessage()] }),
  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastAssistantMessage: (content, recommendations) =>
    set((state) => {
      const messages = [...state.messages]
      const lastIndex = messages.length - 1
      if (lastIndex < 0 || messages[lastIndex]?.role !== "assistant") return state
      messages[lastIndex] = {
        ...messages[lastIndex],
        content,
        recommendations,
      }
      return { messages }
    }),
  removeLastMessage: () =>
    set((state) => ({
      messages: state.messages.length > 1 ? state.messages.slice(0, -1) : state.messages,
    })),
}))