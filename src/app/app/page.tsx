"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PlanViewer from "@/components/PlanViewer";

// API base URL — uses Next.js rewrite in dev (localhost:8000)
// In production, change to deployed backend URL
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/generate-plan`;

export default function PlannerPage() {
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    duration_ms: number;
    input_tokens: number;
    output_tokens: number;
  } | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setPlan(null);
    setStats(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to generate plan. Try again.");
        return;
      }

      setPlan(data.plan);
      setStats({
        duration_ms: data.duration_ms,
        input_tokens: data.input_tokens,
        output_tokens: data.output_tokens,
      });
    } catch (err) {
      setError(
        "Cannot connect to backend. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo width={120} animate={false} />
        </Link>
        <span className="text-xs text-brand-tertiary font-mono">planner</span>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Input section — always visible */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-1">Describe your project</h2>
          <p className="text-sm text-brand-secondary mb-4">
            Tell us what you want to build. The more detail, the better the
            plan.
          </p>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Automatic cat feeder with WiFi control and scheduled feeding times..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 outline-none resize-none disabled:opacity-50 placeholder:text-brand-tertiary"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="mt-3 w-full bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-lg transition-colors"
            >
              {loading ? "Generating plan..." : "Generate plan"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12 animate-fade-up">
            <div className="inline-block w-8 h-8 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mb-4" />
            <p className="text-sm text-brand-secondary">
              Generating your project plan...
            </p>
            <p className="text-xs text-brand-tertiary mt-1">
              This usually takes 60–90 seconds
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Plan viewer */}
        {plan && (
          <div className="animate-fade-up">
            <PlanViewer
              plan={plan}
              onUpgradeClick={(upgrade) => {
                // Combine original description with the upgrade
                setDescription(description.trim() + " + " + upgrade);
                setPlan(null);
                // Scroll to top so user sees the updated input
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Generation stats — small footer */}
            {stats && (
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-4 text-[11px] text-brand-tertiary font-mono">
                <span>Generated in {(stats.duration_ms / 1000).toFixed(1)}s</span>
                <span>•</span>
                <span>{stats.input_tokens + stats.output_tokens} tokens</span>
              </div>
            )}
          </div>
        )}

        {/* Example projects — shown when no plan */}
        {!plan && !loading && (
          <div className="mt-4">
            <p className="text-xs text-brand-tertiary uppercase tracking-wide font-semibold mb-3">
              Try these examples
            </p>
            <div className="space-y-2">
              {[
                "Automatic cat feeder with WiFi control and scheduled feeding times",
                "LED matrix clock with DS3231 RTC module",
                "Temperature sensor with SD card data logging",
                "Smart plant watering system with soil moisture sensor and WiFi notifications",
                "Raspberry Pi time-lapse camera controller with interval settings",
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(example)}
                  className="block w-full text-left text-sm text-brand-secondary hover:text-brand-accent bg-white hover:bg-amber-50/50 border border-gray-100 hover:border-amber-200/50 rounded-lg px-4 py-2.5 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
