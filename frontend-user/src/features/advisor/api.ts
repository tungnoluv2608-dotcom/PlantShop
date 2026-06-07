import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { AdvisorChatMessage, AdvisorChatResponse } from "@/types"

async function sendAdvisorChat(messages: AdvisorChatMessage[]): Promise<AdvisorChatResponse> {
  const { data } = await apiClient.post<AdvisorChatResponse>("/products/advisor/chat", { messages })
  return data
}

export function useAdvisorChat() {
  return useMutation({ mutationFn: sendAdvisorChat })
}