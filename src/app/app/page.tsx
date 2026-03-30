"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PlanViewer from "@/components/PlanViewer";
import PlanChat from "@/components/PlanChat";

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

    let lastError = "";

    try {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Fullmake] Attempt ${attempt} — ${API_URL}`);

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 150000);

          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: description.trim() }),
            signal: controller.signal,
          });

          clearTimeout(timeout);
          const data = await response.json();
          console.log("[Fullmake] Response:", { success: data.success, duration_ms: data.duration_ms });

          if (!response.ok || !data.success) {
            lastError = data.error || `Server returned ${response.status}`;
            console.warn(`[Fullmake] Attempt ${attempt} failed:`, lastError);
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 2000));
              continue;
            }
            setError(lastError);
            return;
          }

          // Success
          setPlan(data.plan);
          setStats({
            duration_ms: data.duration_ms ?? 0,
            input_tokens: data.input_tokens ?? 0,
            output_tokens: data.output_tokens ?? 0,
          });
          return;

        } catch (err: any) {
          lastError = err.name === "AbortError"
            ? "Request timed out (150s). Try again."
            : `Cannot connect to backend (${err.message || "network error"})`;
          console.error(`[Fullmake] Attempt ${attempt} error:`, lastError);
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
        }
      }
      setError(lastError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-stone-900 text-stone-900 dark:text-stone-100">
      <header className="border-b border-gray-100 dark:border-stone-800 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo width={120} animate={false} />
        </Link>
        <span className="text-xs text-brand-tertiary dark:text-stone-500 font-mono">planner</span>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Input section — hidden when plan is generated */}
        {!plan && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1">Describe your project</h2>
            <p className="text-sm text-brand-secondary dark:text-stone-400 mb-4">
              Tell us what you want to build. The more detail, the better the plan.
            </p>

            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Automatic cat feeder with WiFi control and scheduled feeding times..."
                rows={3}
                disabled={loading}
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 outline-none resize-none disabled:opacity-50 placeholder:text-brand-tertiary"
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
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mb-4" />
            <p className="text-sm text-brand-secondary dark:text-stone-400">Generating your project plan...</p>
            <p className="text-xs text-brand-tertiary dark:text-stone-500 mt-1">This usually takes 60–90 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">Check browser console (F12) for details</p>
          </div>
        )}

        {plan && (
          <div>
            <PlanViewer
              plan={plan}
              onUpgradeClick={(upgrade) => {
                setDescription(description.trim() + " + " + upgrade);
                setPlan(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Chat for plan refinement */}
            <PlanChat
              plan={plan}
              onPlanUpdate={(updatedPlan) => setPlan(updatedPlan)}
            />

            {/* New plan button */}
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-stone-800 text-center">
              <button
                onClick={() => {
                  setPlan(null);
                  setDescription("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-sm text-brand-secondary dark:text-stone-400 hover:text-brand-accent dark:hover:text-amber-400 transition-colors"
              >
                ← New plan
              </button>
            </div>
          </div>
        )}

        {!plan && !loading && (
          <div className="mt-4">
            <p className="text-xs text-brand-tertiary dark:text-stone-500 uppercase tracking-wide font-semibold mb-3">Try these examples</p>
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
                  className="block w-full text-left text-sm text-stone-700 dark:text-stone-300 hover:text-brand-accent bg-white dark:bg-stone-800 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 border border-gray-100 dark:border-stone-700 hover:border-amber-200/50 rounded-lg px-4 py-2.5 transition-colors"
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
