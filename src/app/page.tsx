import Link from "next/link";
import Logo from "@/components/Logo";

// Landing page — fullmake.eu root
// Matches existing parkirana stranica design + adds CTA to planner

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Ambient glow behind logo */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[400px] h-[300px] pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse, rgba(217,119,6,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="text-center px-6 animate-fade-up">
        <div className="mb-8">
          <Logo width={340} />
        </div>

        <p className="text-lg text-brand-secondary tracking-wide mb-3">
          Describe it. Make it.
        </p>

        <p className="text-sm text-brand-secondary max-w-[380px] mx-auto leading-relaxed mb-8">
          Turn your project ideas into build-ready code, models, and designs.
        </p>

        {/* CTA — links to planner */}
        <Link
          href="/app"
          className="inline-block text-brand-accent font-medium text-sm border-b border-brand-accent pb-0.5 hover:opacity-70 transition-opacity mb-6"
        >
          Try the Planner →
        </Link>

        <p className="text-xs text-brand-tertiary font-light">
          Coming <span className="text-brand-accent font-medium">2026</span>
        </p>
      </div>
    </div>
  );
}
