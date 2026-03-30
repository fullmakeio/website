"use client";

import { useState, useRef, useEffect } from "react";

// ============================================
// PlanChat — Chat interface for plan refinement
// Sits below PlanViewer. User sends modification
// requests, Claude returns updated plan.
// ============================================

// Chat message type — tracks both display text and role
interface ChatMessage {
  role: "user" | "assistant";
  content: string;       // What the user sees (user message or changes_summary)
  timestamp: number;     // For unique keys
}

// Props from parent (page.tsx)
interface PlanChatProps {
  plan: any;                         // Current plan JSON
  onPlanUpdate: (plan: any) => void; // Callback when plan is refined
}

// Base API URL — same env variable as generate-plan
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PlanChat({ plan, onPlanUpdate }: PlanChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Build history array for the API (only user messages + assistant summaries)
  // This is what gets sent to the backend for conversation context
  const buildHistory = (): { role: string; content: string }[] => {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message to chat
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 150000); // 150s timeout

      const response = await fetch(`${API_BASE}/api/refine-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_plan: plan,
          message: text,
          history: buildHistory(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (!response.ok || !data.success) {
        const errMsg = data.detail || data.error || `Server error ${response.status}`;
        setError(errMsg);
        return;
      }

      // Add assistant response to chat
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.changes_summary || "Plan updated.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update the plan in parent — PlanViewer re-renders automatically
      onPlanUpdate(data.plan);

    } catch (err: any) {
      const errMsg =
        err.name === "AbortError"
          ? "Request timed out (150s). Try again."
          : `Connection error: ${err.message || "network error"}`;
      setError(errMsg);
    } finally {
      setLoading(false);
      // Re-focus input after send
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-8 border-t border-gray-100 dark:border-stone-800 pt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-accent"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Refine your plan
        </h3>
      </div>

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="mb-4 space-y-3 max-h-[400px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.timestamp}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-accent text-white rounded-br-sm"
                    : "bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg rounded-bl-sm px-3.5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3.5 py-2.5 mb-3">
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Replace ESP32 with Arduino Uno, add an LCD display, remove the buzzer..."
          rows={1}
          disabled={loading}
          className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 outline-none resize-none disabled:opacity-50 placeholder:text-brand-tertiary"
          style={{ minHeight: "42px", maxHeight: "120px" }}
          onInput={(e) => {
            // Auto-resize textarea
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "42px";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors shrink-0"
          title="Send (Enter)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>

      {/* Helper text */}
      {messages.length === 0 && (
        <p className="text-xs text-brand-tertiary dark:text-stone-500 mt-2.5">
          Ask to modify components, change platform, adjust wiring, or ask questions about the plan. Press Enter to send.
        </p>
      )}
    </div>
  );
}
