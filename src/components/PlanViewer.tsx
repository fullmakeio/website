"use client";

import { useState } from "react";
import WiringDiagram from "./WiringDiagram";

// TypeScript types matching our Planner V2.5 JSON output
interface Library {
  name: string;
  purpose: string;
  install: string;
}

interface Component {
  name: string;
  quantity: number;
  price_eur: number;
  notes: string;
}

interface WiringConnection {
  from: string;
  to: string;
  notes: string;
}

interface BuildStep {
  step: number;
  title: string;
  description: string;
  code_snippet: string | null;
}

interface FullCode {
  filename: string;
  language: string;
  code: string;
  upload_instructions: string;
  dependencies: string;
}

interface Plan {
  project_title: string;
  in_scope: boolean;
  scope_note: string | null;
  platform: { name: string; reason: string };
  difficulty: string;
  estimated_time: string;
  libraries: Library[];
  components: Component[];
  total_budget_eur: number;
  tools_needed: string[];
  wiring: WiringConnection[];
  wiring_diagram?: {
    board: { type: string; label: string };
    components: {
      id: string;
      label: string;
      description: string;
      side: "left" | "right";
      pins: { name: string; type: "power" | "ground" | "signal" | "pwm" | "i2c" | "spi" | "analog" | "uart" }[];
    }[];
    connections: {
      from_component: string;
      from_pin: string;
      to_pin: string;
      wire_type: string;
      note: string | null;
    }[];
    power_warning: string | null;
  };
  power_notes: string;
  build_steps: BuildStep[];
  full_code: FullCode;
  warnings: string[];
  next_upgrades: string[];
}

const TABS = ["overview", "components", "wiring", "steps", "code"] as const;

// Difficulty badge with color coding
function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${colors[level] || "bg-gray-100 text-gray-700 dark:bg-stone-700 dark:text-stone-300"}`}
    >
      {level}
    </span>
  );
}

export default function PlanViewer({ plan }: { plan: Plan }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("overview");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Calculate actual budget from components
  const calculatedBudget = plan.components.reduce(
    (sum, c) => sum + c.price_eur * c.quantity,
    0
  );

  // Copy code to clipboard
  const copyCode = async () => {
    await navigator.clipboard.writeText(plan.full_code.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div>
      {/* Title + meta */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight mb-3">
          {plan.project_title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-secondary dark:text-stone-400">
          <DifficultyBadge level={plan.difficulty} />
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            {plan.estimated_time}
          </span>
          <span>•</span>
          <span>{calculatedBudget.toFixed(2)}€</span>
        </div>
      </div>

      {/* Platform badge */}
      <div className="bg-brand-accent-light dark:bg-amber-900/20 border border-amber-200/40 dark:border-amber-700/30 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
        <span className="font-mono text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-200/30 dark:bg-amber-800/30 px-2 py-0.5 rounded shrink-0">
          {plan.platform.name}
        </span>
        <span className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          {plan.platform.reason}
        </span>
      </div>

      {/* Out of scope warning */}
      {!plan.in_scope && plan.scope_note && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 mb-6">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
            Outside core scope
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-300">{plan.scope_note}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-100 dark:border-stone-700 mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm capitalize whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? "font-semibold text-brand-accent border-brand-accent"
                : "text-brand-secondary dark:text-stone-400 border-transparent hover:text-brand-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-stone-700 rounded-lg overflow-hidden">
            {[
              { label: "Components", value: plan.components.length },
              { label: "Wiring", value: `${(plan.wiring_diagram?.connections?.length ?? plan.wiring.length)} conn.` },
              { label: "Code", value: `${plan.full_code.code.split("\n").length} lines` },
            ].map((s, i) => (
              <div key={i} className="bg-brand-bg dark:bg-stone-800 p-4 text-center">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-brand-secondary dark:text-stone-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Libraries */}
          <div className="bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-brand-secondary dark:text-stone-400 uppercase tracking-wide mb-3">
              Libraries
            </h3>
            {plan.libraries.map((lib, i) => (
              <div
                key={i}
                className={`flex justify-between items-baseline py-1.5 ${i ? "border-t border-gray-50 dark:border-stone-700" : ""}`}
              >
                <span className="font-mono text-sm font-medium">{lib.name}</span>
                <span className="text-xs text-brand-tertiary dark:text-stone-500 max-w-[55%] text-right">
                  {lib.purpose}
                </span>
              </div>
            ))}
          </div>

          {/* Power notes */}
          <div className="bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-brand-secondary dark:text-stone-400 uppercase tracking-wide mb-2">
              Power
            </h3>
            <p className="text-sm text-brand-secondary dark:text-stone-400 leading-relaxed">
              {plan.power_notes}
            </p>
          </div>

          {/* Warnings */}
          {plan.warnings.length > 0 && (
            <div className="bg-red-50/50 dark:bg-red-950/50 border border-red-100 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">
                Warnings
              </h3>
              {plan.warnings.map((w, i) => (
                <p key={i} className="text-xs text-red-800 dark:text-red-300 leading-relaxed pl-3 relative mb-1">
                  <span className="absolute left-0">•</span>
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ COMPONENTS TAB ═══ */}
      {activeTab === "components" && (
        <div className="bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto] px-4 py-2.5 border-b border-gray-50 dark:border-stone-700 text-[11px] text-brand-tertiary dark:text-stone-500 font-semibold uppercase tracking-wider">
            <span>Component</span>
            <span className="text-right">Qty</span>
            <span className="text-right min-w-[60px]">Price</span>
          </div>

          {/* Rows */}
          {plan.components.map((c, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_auto_auto] px-4 py-3 items-start ${i ? "border-t border-gray-50 dark:border-stone-700" : ""}`}
            >
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-brand-tertiary dark:text-stone-500 mt-0.5">{c.notes}</div>
              </div>
              <span className="text-sm text-brand-secondary dark:text-stone-400 text-right pl-4">
                ×{c.quantity}
              </span>
              <span className="text-sm font-medium text-right min-w-[60px]">
                {(c.price_eur * c.quantity).toFixed(2)}€
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="grid grid-cols-[1fr_auto] px-4 py-3.5 border-t-2 border-gray-100 dark:border-stone-700 bg-amber-50/50 dark:bg-amber-900/20">
            <span className="text-sm font-bold">Total budget</span>
            <span className="text-lg font-bold text-brand-accent">
              {calculatedBudget.toFixed(2)}€
            </span>
          </div>
        </div>
      )}

      {/* ═══ WIRING TAB ═══ */}
      {activeTab === "wiring" && (
        <div>
          {/* SVG Diagram — shown when wiring_diagram data exists */}
          {plan.wiring_diagram && (
            <div className="mb-6">
              <WiringDiagram data={plan.wiring_diagram} />
            </div>
          )}

          {/* Text wiring list — always shown */}
          <div className="bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg overflow-hidden">
            {plan.wiring_diagram && (
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-stone-700">
                <h3 className="text-xs font-semibold text-brand-secondary dark:text-stone-400 uppercase tracking-wide">
                  Connection details
                </h3>
              </div>
            )}
            {plan.wiring.map((w, i) => (
              <div
                key={i}
                className={`px-4 py-3 ${i ? "border-t border-gray-50 dark:border-stone-700" : ""}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-medium text-brand-accent bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                    {w.from}
                  </span>
                  <svg width="20" height="10" viewBox="0 0 20 10" className="shrink-0 text-brand-accent">
                    <path d="M0 5h16M13 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-mono text-xs font-medium bg-gray-50 dark:bg-stone-700 px-2 py-1 rounded text-stone-900 dark:text-stone-100">
                    {w.to}
                  </span>
                </div>
                {w.notes && (
                  <p className="text-xs text-brand-tertiary dark:text-stone-500 mt-1.5 leading-relaxed">
                    {w.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STEPS TAB ═══ */}
      {activeTab === "steps" && (
        <div className="relative pl-7">
          {/* Vertical line */}
          <div
            className="absolute left-[11px] top-3 bottom-3 w-px"
            style={{
              background: "linear-gradient(to bottom, #D97706, rgba(28,25,23,0.08))",
            }}
          />

          {plan.build_steps.map((s, i) => (
            <div
              key={i}
              className="relative py-3 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === i ? null : i)}
            >
              {/* Step number circle */}
              <div className="absolute -left-7 top-[14px] w-[22px] h-[22px] rounded-full bg-brand-accent flex items-center justify-center text-[11px] font-bold text-white">
                {s.step}
              </div>

              <div className="text-sm font-semibold">{s.title}</div>

              {expandedStep === i && (
                <div className="mt-2">
                  <p className="text-sm text-brand-secondary dark:text-stone-400 leading-relaxed">
                    {s.description}
                  </p>

                  {s.code_snippet && (
                    <pre className="mt-2 bg-brand-code text-green-400 text-xs rounded-lg p-3 overflow-x-auto font-mono code-block">
                      {s.code_snippet}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ CODE TAB ═══ */}
      {activeTab === "code" && (
        <div>
          {/* Code block */}
          <div className="bg-brand-code rounded-lg overflow-hidden">
            {/* Header with filename + copy button */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <span className="font-mono text-sm text-amber-400">
                {plan.full_code.filename}
              </span>
              <button
                onClick={copyCode}
                className="bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
              >
                {codeCopied ? "Copied!" : "Copy code"}
              </button>
            </div>

            {/* Code content */}
            <pre className="p-4 text-xs text-gray-300 leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto font-mono code-block">
              {plan.full_code.code}
            </pre>
          </div>

          {/* Upload instructions */}
          <div className="mt-4 bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-brand-secondary dark:text-stone-400 uppercase tracking-wide mb-2">
              Upload instructions
            </h3>
            <p className="text-sm text-brand-secondary dark:text-stone-400 leading-relaxed">
              {plan.full_code.upload_instructions}
            </p>
          </div>

          {/* Dependencies */}
          {plan.full_code.dependencies && (
            <div className="mt-3 bg-white dark:bg-stone-800 border border-gray-100 dark:border-stone-700 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-brand-secondary dark:text-stone-400 uppercase tracking-wide mb-2">
                Dependencies
              </h3>
              <p className="text-sm font-mono text-brand-secondary dark:text-stone-400">
                {plan.full_code.dependencies}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
