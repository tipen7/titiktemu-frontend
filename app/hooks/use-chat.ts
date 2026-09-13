import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { sendChatMessage } from "@/app/lib/api";
import type { ChatMessage, ChatRole } from "@/app/types/chat";

export function useChat(role: ChatRole) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [highlightGridIds, setHighlightGridIds] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (message: string) => {
      // History sent to the backend excludes the just-added user turn --
      // the backend appends `message` itself (see gemini-chat.ts's prompt
      // construction), so including it here would duplicate it.
      const history = messages;
      return sendChatMessage(message, role, history);
    },
    onMutate: (message: string) => {
      setMessages((prev) => [...prev, { role: "user", text: message }]);
    },
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", text: response.answer }]);
      setHighlightGridIds(response.highlight_grid_ids);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Maaf, terjadi kesalahan. Silakan coba lagi." },
      ]);
    },
  });

  return {
    messages,
    highlightGridIds,
    sendMessage: mutation.mutate,
    isSending: mutation.isPending,
  };
}
