"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Olá! Posso explicar como o VoltMetric funciona ou responder perguntas sobre o seu consumo de energia (ex: \"quanto gastei essa semana?\"). O que você quer saber?",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingReply, isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStreamingReply("");
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok || !res.body) {
        setError("Não foi possível enviar sua mensagem agora.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullReply += decoder.decode(value, { stream: true });
        setStreamingReply(fullReply);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fullReply || "Não consegui gerar uma resposta para isso.",
        },
      ]);
    } catch {
      setError("Erro de conexão com o assistente.");
    } finally {
      setStreamingReply(null);
      setLoading(false);
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Assistente VoltMetric
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {streamingReply !== null && (
              <div className="flex justify-start">
                {streamingReply ? (
                  <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
                    {streamingReply}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Pensando...
                  </div>
                )}
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensagem"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
        className="fixed bottom-4 right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
