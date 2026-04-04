"use client";

// ============================================
// FULLMAKE — Landing Page (Next.js)
// Split layout: Left (brand + waitlist) / Right (interactive preview)
// Hero fills viewport, How it Works below on scroll.
// Krem light mode (#F5F1EB) + warm dark mode (#1E1B18)
// Chat #14: Added animated How it Works scroll section
// ============================================

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Overview", "Components", "Wiring", "Code"];

  // Ref for How it Works section — triggers animations on scroll
  const hiwRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver: adds .active class when How it Works
  // section scrolls into view, triggering CSS animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      },
      { threshold: 0.15 }
    );
    if (hiwRef.current) observer.observe(hiwRef.current);
    return () => observer.disconnect();
  }, []);

  // =============================================
  // WAITLIST FORM SUBMISSION
  // =============================================
  async function handleSubmit() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormState("error");
      setFormMessage("Please enter a valid email address.");
      return;
    }

    setFormState("sending");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing" }),
      });

      if (res.ok) {
        setFormState("success");
        setFormMessage("You're on the list. We'll be in touch.");
        setEmail("");
      } else if (res.status === 409) {
        setFormState("success");
        setFormMessage("You're already on the list!");
      } else {
        setFormState("error");
        setFormMessage("Something went wrong. Please try again.");
      }
    } catch {
      setFormState("error");
      setFormMessage("Could not connect. Please try again later.");
    }
  }

  return (
    <>
      <style>{`
        :root {
          --bg: #F5F1EB;
          --bg-surface: #FFFFFF;
          --bg-surface-hover: #FAF9F7;
          --text-primary: #1C1917;
          --text-secondary: #78716C;
          --text-tertiary: #A8A29E;
          --accent: #D97706;
          --accent-hover: #B45309;
          --accent-light: rgba(217, 119, 6, 0.1);
          --border: rgba(28, 25, 23, 0.08);
          --border-strong: rgba(28, 25, 23, 0.14);
          --slash-top: rgba(217, 119, 6, 1);
          --slash-bottom: rgba(217, 119, 6, 0.08);
          --success: #16A34A;
          --error: #DC2626;
          --code-bg: #292524;
          --code-text: #D6D3D1;
          --code-keyword: #F59E0B;
          --code-string: #6EE7B7;
          --code-comment: #78716C;
          --card-shadow: 0 1px 3px rgba(28, 25, 23, 0.06), 0 8px 24px rgba(28, 25, 23, 0.04);
          --coming-bg: rgba(28, 25, 23, 0.05);
          --coming-text: #A8A29E;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #1E1B18;
            --bg-surface: #2A2622;
            --bg-surface-hover: #33302B;
            --text-primary: #F5F1EB;
            --text-secondary: #A8A29E;
            --text-tertiary: #78716C;
            --accent: #F59E0B;
            --accent-hover: #D97706;
            --accent-light: rgba(245, 158, 11, 0.12);
            --border: rgba(245, 241, 235, 0.08);
            --border-strong: rgba(245, 241, 235, 0.14);
            --slash-top: rgba(245, 158, 11, 1);
            --slash-bottom: rgba(245, 158, 11, 0.08);
            --code-bg: #171411;
            --code-text: #D6D3D1;
            --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15);
            --coming-bg: rgba(245, 241, 235, 0.06);
            --coming-text: #78716C;
          }
        }
        .landing-root {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .landing-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 4rem;
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
        }
        .landing-left { flex: 1; max-width: 420px; }
        .landing-right { flex: 1; max-width: 400px; display: flex; align-items: center; justify-content: center; }
        .logo-landing { display: inline-block; width: min(280px, 70vw); height: auto; margin-bottom: 1.25rem; }
        .logo-text { fill: var(--text-primary); }
        .logo-slash { stroke-dasharray: 60; stroke-dashoffset: 60; animation: slash-draw 0.8s ease-out 0.3s forwards; }
        @keyframes slash-draw { to { stroke-dashoffset: 0; } }
        .hero-tagline { font-size: clamp(1.05rem, 2.5vw, 1.25rem); font-weight: 400; color: var(--text-secondary); letter-spacing: 0.01em; margin-bottom: 0.5rem; }
        .hero-description { font-size: clamp(0.85rem, 2vw, 0.95rem); color: var(--text-tertiary); line-height: 1.6; margin-bottom: 1.75rem; max-width: 360px; }
        .form-row { display: flex; gap: 0.4rem; max-width: 360px; margin-bottom: 0.35rem; }
        .form-row input[type="email"] { flex: 1; font-family: 'DM Sans', system-ui, sans-serif; font-size: 0.875rem; padding: 0.65rem 0.85rem; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); outline: none; transition: border-color 0.2s; }
        .form-row input[type="email"]:focus { border-color: var(--accent); }
        .form-row input[type="email"]::placeholder { color: var(--text-tertiary); }
        .btn-notify { font-family: 'DM Sans', system-ui, sans-serif; font-size: 0.875rem; font-weight: 600; color: #FFFFFF; background: var(--accent); border: none; border-radius: 8px; padding: 0.65rem 1.25rem; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .btn-notify:hover { background: var(--accent-hover); }
        .btn-notify:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-message { font-size: 0.8rem; min-height: 1.2em; margin-bottom: 0.25rem; }
        .form-message.success { color: var(--success); }
        .form-message.error { color: var(--error); }
        .form-note { font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.75rem; }
        .status-signal { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 500; color: var(--accent); letter-spacing: 0.03em; margin-bottom: 1.5rem; opacity: 0.85; }
        .try-planner { font-size: 0.85rem; font-weight: 500; color: var(--accent); text-decoration: none; transition: opacity 0.2s; }
        .try-planner:hover { opacity: 0.7; }
        .link-separator { color: var(--text-tertiary); margin: 0 0.5rem; font-size: 0.85rem; }
        .preview-card { background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--card-shadow); width: 100%; overflow: hidden; }
        .preview-header { padding: 14px 18px; border-bottom: 1px solid var(--border); }
        .preview-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
        .preview-badges { display: flex; gap: 5px; flex-wrap: wrap; }
        .badge { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 500; padding: 2px 7px; border-radius: 4px; }
        .badge-platform { background: var(--accent-light); color: var(--accent); }
        .badge-difficulty { background: rgba(22, 163, 74, 0.1); color: #16A34A; }
        .preview-tabs { display: flex; border-bottom: 1px solid var(--border); }
        .preview-tab { flex: 1; font-family: 'DM Sans', system-ui, sans-serif; font-size: 0.72rem; font-weight: 400; color: var(--text-tertiary); padding: 9px 8px; border: none; background: none; cursor: pointer; position: relative; white-space: nowrap; transition: color 0.15s; text-align: center; }
        .preview-tab:hover { color: var(--text-secondary); }
        .preview-tab.active { color: var(--accent); font-weight: 500; }
        .preview-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%; height: 2px; background: var(--accent); border-radius: 1px; }
        .preview-content { padding: 16px 18px; min-height: 200px; }
        .overview-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
        .overview-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .overview-label { font-size: 0.8rem; font-weight: 500; color: var(--text-primary); flex: 1; }
        .overview-value { font-size: 0.75rem; color: var(--text-tertiary); }
        .coming-badge { font-size: 0.6rem; font-weight: 500; color: var(--coming-text); background: var(--coming-bg); padding: 1px 6px; border-radius: 3px; letter-spacing: 0.02em; }
        .comp-item { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: baseline; padding: 5px 0; font-size: 0.78rem; }
        .comp-name { color: var(--text-primary); font-weight: 400; }
        .comp-qty { color: var(--text-tertiary); font-size: 0.7rem; text-align: center; min-width: 24px; }
        .comp-price { color: var(--text-secondary); font-size: 0.72rem; text-align: right; min-width: 44px; }
        .wire-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 0.75rem; }
        .wire-line { width: 16px; height: 2px; border-radius: 1px; flex-shrink: 0; }
        .wire-from { color: var(--text-secondary); flex: 1; }
        .wire-arrow { color: var(--text-tertiary); font-size: 0.65rem; }
        .wire-to { color: var(--text-primary); font-weight: 500; }
        .code-block { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; line-height: 1.7; background: var(--code-bg); color: var(--code-text); padding: 14px 16px; border-radius: 8px; overflow-x: auto; white-space: pre; }
        .code-keyword { color: var(--code-keyword); }
        .code-string { color: var(--code-string); }
        .code-comment { color: var(--code-comment); font-style: italic; }
        .preview-footer { padding: 12px 18px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
        .preview-stat-label { font-size: 0.65rem; color: var(--text-tertiary); margin-bottom: 1px; text-transform: uppercase; letter-spacing: 0.04em; }
        .preview-stat-value { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
        .landing-footer { text-align: center; padding: 1rem; font-size: 0.75rem; color: var(--text-tertiary); }
        @media (max-width: 768px) {
          .landing-main { flex-direction: column; gap: 2rem; padding: 2rem 1.25rem; justify-content: flex-start; padding-top: 3rem; }
          .landing-left { max-width: 100%; text-align: center; }
          .landing-left .hero-description { margin-left: auto; margin-right: auto; }
          .form-row { max-width: 100%; margin-left: auto; margin-right: auto; }
          .form-note { text-align: center; }
          .try-planner-wrap { text-align: center; }
          .landing-right { max-width: 380px; width: 100%; }
        }
        @media (max-width: 440px) {
          .form-row { flex-direction: column; }
          .btn-notify { width: 100%; }
          .preview-content { padding: 14px 14px; }
        }

        /* =============================================
           HOW IT WORKS — Three-step flow (Chat #14)
           Describe → Generate → Build
           ============================================= */
        .hiw-section { padding: 5rem 2rem 4rem; max-width: 1060px; margin: 0 auto; }
        .hiw-label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 500; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem; }
        .hiw-title { font-size: clamp(1.4rem, 3.5vw, 1.8rem); font-weight: 700; margin-bottom: 2.5rem; }

        /* Three-step flow: Describe → Generate → Build */
        .hiw-steps { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 1.5rem; align-items: start; margin-bottom: 3rem; }
        .hiw-step { position: relative; }
        .hiw-step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
        .hiw-step-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600; color: var(--accent); background: var(--accent-light); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hiw-step-name { font-size: 0.95rem; font-weight: 700; }
        .hiw-arrow { position: absolute; right: -1rem; top: 50%; color: var(--text-tertiary); font-size: 1.2rem; opacity: 0; }
        .hiw-section.active .hiw-arrow { animation: hiw-fadeIn 0.3s ease 0.5s forwards; }

        /* Step 1: Terminal */
        .hiw-terminal { background: var(--code-bg); border-radius: 10px; overflow: hidden; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; line-height: 1.7; }
        .hiw-terminal-bar { display: flex; align-items: center; gap: 5px; padding: 8px 12px; background: rgba(0,0,0,0.25); }
        .hiw-terminal-dot { width: 7px; height: 7px; border-radius: 50%; }
        .hiw-terminal-dot:nth-child(1) { background: #EF4444; }
        .hiw-terminal-dot:nth-child(2) { background: #EAB308; }
        .hiw-terminal-dot:nth-child(3) { background: #22C55E; }
        .hiw-terminal-body { padding: 12px 14px 16px; }
        .hiw-terminal-prompt { color: #78716C; font-size: 0.68rem; }
        .hiw-typing { color: #D6D3D1; overflow: hidden; white-space: nowrap; border-right: 2px solid var(--accent); width: 0; display: inline-block; vertical-align: bottom; font-size: 0.7rem; }
        .hiw-section.active .hiw-typing { animation: hiw-type 2.5s steps(38) 0.6s forwards, hiw-blink 0.6s step-end 6 0.6s; }

        /* Step 2: Wiring diagram — realistic board layout */
        .hiw-wiring-wrap { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; overflow: hidden; }
        .hiw-wiring-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-tertiary); margin-bottom: 8px; }
        .hiw-wire { stroke-dasharray: 120; stroke-dashoffset: 120; fill: none; }
        .hiw-section.active .hiw-wire { animation: hiw-wireDraw 0.6s ease forwards; }
        .hiw-section.active .hiw-wire:nth-child(1) { animation-delay: 3.2s; }
        .hiw-section.active .hiw-wire:nth-child(2) { animation-delay: 3.5s; }
        .hiw-section.active .hiw-wire:nth-child(3) { animation-delay: 3.8s; }
        .hiw-section.active .hiw-wire:nth-child(4) { animation-delay: 4.1s; }
        .hiw-section.active .hiw-wire:nth-child(5) { animation-delay: 4.4s; }
        .hiw-section.active .hiw-wire:nth-child(6) { animation-delay: 4.7s; }
        .hiw-board-label { font-size: 8px; font-family: 'JetBrains Mono', monospace; }
        .hiw-pin-label { font-size: 6px; font-family: 'JetBrains Mono', monospace; }
        .hiw-comp-label { font-size: 7px; font-family: 'JetBrains Mono', monospace; }
        .hiw-wiring-svg { opacity: 0; }
        .hiw-section.active .hiw-wiring-svg { animation: hiw-fadeIn 0.4s ease 2.8s forwards; }

        /* Step 3: Build — checklist */
        .hiw-build-list { display: flex; flex-direction: column; gap: 10px; }
        .hiw-build-item { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: var(--text-secondary); opacity: 0; transform: translateX(8px); }
        .hiw-section.active .hiw-build-item { animation: hiw-slideIn 0.35s ease forwards; }
        .hiw-section.active .hiw-build-item:nth-child(1) { animation-delay: 5s; }
        .hiw-section.active .hiw-build-item:nth-child(2) { animation-delay: 5.3s; }
        .hiw-section.active .hiw-build-item:nth-child(3) { animation-delay: 5.6s; }
        .hiw-section.active .hiw-build-item:nth-child(4) { animation-delay: 5.9s; }
        .hiw-check { width: 20px; height: 20px; border-radius: 50%; background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }

        /* Output cards row — below the 3 steps */
        .hiw-outputs { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .hiw-output { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; opacity: 0; transform: translateY(8px); }
        .hiw-section.active .hiw-output { animation: hiw-cardIn 0.4s ease forwards; }
        .hiw-section.active .hiw-output:nth-child(1) { animation-delay: 6.2s; }
        .hiw-section.active .hiw-output:nth-child(2) { animation-delay: 6.4s; }
        .hiw-section.active .hiw-output:nth-child(3) { animation-delay: 6.6s; }
        .hiw-section.active .hiw-output:nth-child(4) { animation-delay: 6.8s; }
        .hiw-section.active .hiw-output:nth-child(5) { animation-delay: 7.0s; }
        .hiw-output-icon { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 4px 8px; border-radius: 5px; }
        .hiw-output-name { font-size: 0.78rem; font-weight: 500; color: var(--text-primary); }
        .hiw-coming { font-size: 0.6rem; font-weight: 500; color: var(--text-tertiary); background: var(--coming-bg); padding: 1px 6px; border-radius: 3px; margin-left: 2px; }

        @media (max-width: 768px) {
          .hiw-steps { grid-template-columns: 1fr; gap: 2rem; }
          .hiw-arrow { display: none; }
          .hiw-section { padding: 3rem 1.25rem; }
          .hiw-outputs { flex-direction: column; align-items: stretch; }
        }

        /* Animations */
        @keyframes hiw-type { from { width: 0; } to { width: 100%; } }
        @keyframes hiw-blink { 50% { border-color: transparent; } }
        @keyframes hiw-fadeIn { to { opacity: 1; } }
        @keyframes hiw-cardIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes hiw-wireDraw { to { stroke-dashoffset: 0; } }
        @keyframes hiw-slideIn { to { opacity: 1; transform: translateX(0); } }
        @keyframes hiw-blinkDot { 0%, 100% { opacity: 0; } 30%, 70% { opacity: 1; } }
      `}</style>

      <div className="landing-root">
        <main className="landing-main">
          <div className="landing-left">
            <svg className="logo-landing" viewBox="0 0 440 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fullmake logo">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--slash-top)" />
                  <stop offset="100%" stopColor="var(--slash-bottom)" />
                </linearGradient>
              </defs>
              <text x="0" y="42" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="44" fontWeight="700" className="logo-text" letterSpacing="-2">full</text>
              <line className="logo-slash" x1="140" y1="2" x2="128" y2="52" stroke="url(#sg)" strokeWidth="3.5" strokeLinecap="round" />
              <text x="148" y="42" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="44" fontWeight="300" className="logo-text" letterSpacing="-2">make</text>
            </svg>
            <p className="hero-tagline">Describe it. Make it.</p>
            <p className="hero-description">Turn your project ideas into build-ready code, wiring diagrams, and 3D models. Tell us what to build — we handle the rest.</p>
            <div className="form-row">
              <input type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} disabled={formState === "success"} />
              <button className="btn-notify" onClick={handleSubmit} disabled={formState === "sending" || formState === "success"}>
                {formState === "sending" ? "Sending..." : formState === "success" ? "Done ✓" : "Get early Access"}
              </button>
            </div>
            {formMessage && (<p className={`form-message ${formState === "error" ? "error" : "success"}`}>{formMessage}</p>)}
            <p className="form-note">Be among the first to try Fullmake when it launches.</p>
            <p className="status-signal">Launching soon • Limited early access</p>
            <div className="try-planner-wrap">
              <Link href="/app" className="try-planner">Try the Planner →</Link>
              <span className="link-separator">·</span>
              <button className="try-planner" onClick={() => hiwRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>How it works</button>
            </div>
          </div>
          <div className="landing-right">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-title">WiFi cat feeder with scheduling</div>
                <div className="preview-badges">
                  <span className="badge badge-platform">ESP32</span>
                  <span className="badge badge-difficulty">intermediate</span>
                </div>
              </div>
              <div className="preview-tabs">
                {tabs.map((tab, i) => (<button key={tab} className={`preview-tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>{tab}</button>))}
              </div>
              <div className="preview-content">
                {activeTab === 0 && (<div>
                  <div className="overview-item"><div className="overview-dot" style={{ background: "#D97706" }} /><span className="overview-label">8 components</span><span className="overview-value">~€19</span></div>
                  <div className="overview-item"><div className="overview-dot" style={{ background: "#16A34A" }} /><span className="overview-label">Generated code</span><span className="overview-value">145 lines</span></div>
                  <div className="overview-item"><div className="overview-dot" style={{ background: "#3B82F6" }} /><span className="overview-label">Wiring diagram</span><span className="overview-value">12 connections</span></div>
                  <div className="overview-item"><div className="overview-dot" style={{ background: "#8B5CF6" }} /><span className="overview-label">3D enclosure</span><span className="coming-badge">coming soon</span></div>
                  <div className="overview-item"><div className="overview-dot" style={{ background: "#EC4899" }} /><span className="overview-label">Laser-cut faceplate</span><span className="coming-badge">coming soon</span></div>
                </div>)}
                {activeTab === 1 && (<div>
                  <div className="comp-item"><span className="comp-name">ESP32 DevKit V1</span><span className="comp-qty">×1</span><span className="comp-price">€5.50</span></div>
                  <div className="comp-item"><span className="comp-name">SG90 Micro Servo 9g</span><span className="comp-qty">×1</span><span className="comp-price">€2.50</span></div>
                  <div className="comp-item"><span className="comp-name">IR Obstacle Sensor</span><span className="comp-qty">×1</span><span className="comp-price">€1.50</span></div>
                  <div className="comp-item"><span className="comp-name">Status LEDs (pack)</span><span className="comp-qty">×1</span><span className="comp-price">€1.00</span></div>
                  <div className="comp-item"><span className="comp-name">220Ω Resistors (pack)</span><span className="comp-qty">×1</span><span className="comp-price">€1.00</span></div>
                  <div className="comp-item"><span className="comp-name">Breadboard</span><span className="comp-qty">×1</span><span className="comp-price">€3.00</span></div>
                  <div className="comp-item"><span className="comp-name">Jumper wires (pack)</span><span className="comp-qty">×1</span><span className="comp-price">€2.00</span></div>
                  <div className="comp-item"><span className="comp-name">USB Micro cable</span><span className="comp-qty">×1</span><span className="comp-price">€2.00</span></div>
                </div>)}
                {activeTab === 2 && (<div>
                  <div className="wire-item"><div className="wire-line" style={{ background: "#EF4444" }} /><span className="wire-from">Servo VCC</span><span className="wire-arrow">→</span><span className="wire-to">5V (ext.)</span></div>
                  <div className="wire-item"><div className="wire-line" style={{ background: "#6B7280" }} /><span className="wire-from">Servo GND</span><span className="wire-arrow">→</span><span className="wire-to">GND</span></div>
                  <div className="wire-item"><div className="wire-line" style={{ background: "#F59E0B" }} /><span className="wire-from">Servo Signal</span><span className="wire-arrow">→</span><span className="wire-to">GPIO13</span></div>
                  <div className="wire-item"><div className="wire-line" style={{ background: "#3B82F6" }} /><span className="wire-from">IR Sensor OUT</span><span className="wire-arrow">→</span><span className="wire-to">GPIO14</span></div>
                  <div className="wire-item"><div className="wire-line" style={{ background: "#3B82F6" }} /><span className="wire-from">LED WiFi</span><span className="wire-arrow">→</span><span className="wire-to">GPIO2</span></div>
                  <div className="wire-item"><div className="wire-line" style={{ background: "#3B82F6" }} /><span className="wire-from">LED Feed</span><span className="wire-arrow">→</span><span className="wire-to">GPIO4</span></div>
                  <div className="wire-item" style={{ paddingTop: "8px" }}><span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>+ 6 more connections...</span></div>
                </div>)}
                {activeTab === 3 && (<div className="code-block">
                  <span className="code-comment">// WiFi Cat Feeder — ESP32</span>{"\n"}
                  <span className="code-keyword">#include</span>{" <WiFi.h>"}{"\n"}
                  <span className="code-keyword">#include</span>{" <WebServer.h>"}{"\n"}
                  <span className="code-keyword">#include</span>{" <ESP32Servo.h>"}{"\n"}{"\n"}
                  <span className="code-keyword">const char</span>{"* ssid = "}<span className="code-string">{'"YOUR_SSID"'}</span>{";"}{"\n"}
                  <span className="code-keyword">Servo</span>{" feederServo;"}{"\n"}{"\n"}
                  <span className="code-keyword">void</span>{" setup() {"}{"\n"}
                  {"  Serial.begin(115200);"}{"\n"}
                  {"  feederServo.attach(13);"}{"\n"}
                  {"  WiFi.begin(ssid, pass);"}{"\n"}
                  {"  "}<span className="code-comment">// ... 135 more lines</span>{"\n"}
                  {"}"}
                </div>)}
              </div>
              <div className="preview-footer">
                <div><div className="preview-stat-label">Build time</div><div className="preview-stat-value">2–3 hours</div></div>
                <div style={{ textAlign: "right" }}><div className="preview-stat-label">Est. budget</div><div className="preview-stat-value">€18.50</div></div>
              </div>
            </div>
          </div>
        </main>

        {/* ======= HOW IT WORKS — Three-step flow (Chat #14) ======= */}
        <div className="hiw-section" ref={hiwRef}>
          <p className="hiw-label">How it works</p>
          <h2 className="hiw-title">Three steps to your next build</h2>

          {/* Three columns: Describe → Generate → Build */}
          <div className="hiw-steps">

            {/* Step 1: Describe */}
            <div className="hiw-step">
              <div className="hiw-step-header">
                <span className="hiw-step-num">1</span>
                <span className="hiw-step-name">Describe</span>
              </div>
              <div className="hiw-terminal">
                <div className="hiw-terminal-bar"><span className="hiw-terminal-dot" /><span className="hiw-terminal-dot" /><span className="hiw-terminal-dot" /></div>
                <div className="hiw-terminal-body">
                  <div className="hiw-terminal-prompt">{">"} Your project:</div>
                  <div style={{ marginTop: "4px" }}><span className="hiw-typing">WiFi cat feeder with scheduled times</span></div>
                </div>
              </div>
              <span className="hiw-arrow">→</span>
            </div>

            {/* Step 2: Generate — realistic wiring diagram */}
            <div className="hiw-step">
              <div className="hiw-step-header">
                <span className="hiw-step-num">2</span>
                <span className="hiw-step-name">Generate</span>
              </div>
              <div className="hiw-wiring-wrap">
                <div className="hiw-wiring-label">wiring_diagram.svg</div>
                <svg className="hiw-wiring-svg" viewBox="0 0 300 180" width="100%" xmlns="http://www.w3.org/2000/svg">
                  {/* ESP32 Board */}
                  <rect x="100" y="20" width="100" height="140" rx="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                  <text className="hiw-board-label" x="150" y="14" fill="var(--accent)" textAnchor="middle" fontWeight="600">ESP32 DevKit V1</text>
                  {/* Left pins */}
                  <text className="hiw-pin-label" x="96" y="48" fill="var(--text-tertiary)" textAnchor="end">3V3</text>
                  <text className="hiw-pin-label" x="96" y="68" fill="var(--text-tertiary)" textAnchor="end">GND</text>
                  <text className="hiw-pin-label" x="96" y="88" fill="var(--text-tertiary)" textAnchor="end">GPIO13</text>
                  <text className="hiw-pin-label" x="96" y="108" fill="var(--text-tertiary)" textAnchor="end">GPIO14</text>
                  <text className="hiw-pin-label" x="96" y="128" fill="var(--text-tertiary)" textAnchor="end">GPIO2</text>
                  <text className="hiw-pin-label" x="96" y="148" fill="var(--text-tertiary)" textAnchor="end">GPIO4</text>
                  {/* Right pins */}
                  <text className="hiw-pin-label" x="204" y="48" fill="var(--text-tertiary)" textAnchor="start">5V</text>
                  <text className="hiw-pin-label" x="204" y="68" fill="var(--text-tertiary)" textAnchor="start">GND</text>
                  <text className="hiw-pin-label" x="204" y="88" fill="var(--text-tertiary)" textAnchor="start">SDA</text>
                  <text className="hiw-pin-label" x="204" y="108" fill="var(--text-tertiary)" textAnchor="start">SCL</text>
                  {/* Pin dots */}
                  <circle cx="100" cy="45" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="100" cy="65" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="100" cy="85" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="100" cy="105" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="100" cy="125" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="100" cy="145" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="200" cy="45" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="200" cy="65" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="200" cy="85" r="2" fill="var(--accent)" opacity="0.6" />
                  <circle cx="200" cy="105" r="2" fill="var(--accent)" opacity="0.6" />
                  {/* Servo component */}
                  <rect x="10" y="55" width="50" height="45" rx="4" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" />
                  <text className="hiw-comp-label" x="35" y="75" fill="var(--text-secondary)" textAnchor="middle" fontWeight="500">SG90</text>
                  <text className="hiw-comp-label" x="35" y="86" fill="var(--text-tertiary)" textAnchor="middle">Servo</text>
                  {/* DS3231 RTC */}
                  <rect x="240" y="55" width="50" height="45" rx="4" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" />
                  <text className="hiw-comp-label" x="265" y="75" fill="var(--text-secondary)" textAnchor="middle" fontWeight="500">DS3231</text>
                  <text className="hiw-comp-label" x="265" y="86" fill="var(--text-tertiary)" textAnchor="middle">RTC</text>
                  {/* IR Sensor */}
                  <rect x="10" y="115" width="50" height="38" rx="4" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" />
                  <text className="hiw-comp-label" x="35" y="135" fill="var(--text-secondary)" textAnchor="middle" fontWeight="500">IR Sensor</text>
                  {/* Wires — draw in sequentially */}
                  <path className="hiw-wire" d="M60 65 L100 65" stroke="#6B7280" strokeWidth="1.5" />
                  <path className="hiw-wire" d="M60 75 L80 75 L80 85 L100 85" stroke="#F59E0B" strokeWidth="1.5" />
                  <path className="hiw-wire" d="M60 90 L75 90 L75 45 L100 45" stroke="#EF4444" strokeWidth="1.5" />
                  <path className="hiw-wire" d="M60 130 L75 130 L75 105 L100 105" stroke="#3B82F6" strokeWidth="1.5" />
                  <path className="hiw-wire" d="M200 85 L240 75" stroke="#22C55E" strokeWidth="1.5" />
                  <path className="hiw-wire" d="M200 105 L240 90" stroke="#A855F7" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="hiw-arrow">→</span>
            </div>

            {/* Step 3: Build — animated checklist */}
            <div className="hiw-step">
              <div className="hiw-step-header">
                <span className="hiw-step-num">3</span>
                <span className="hiw-step-name">Build</span>
              </div>
              <div className="hiw-build-list">
                <div className="hiw-build-item"><span className="hiw-check">✓</span><span>Upload code to board</span></div>
                <div className="hiw-build-item"><span className="hiw-check">✓</span><span>Wire components</span></div>
                <div className="hiw-build-item"><span className="hiw-check">✓</span><span>Order parts from list</span></div>
                <div className="hiw-build-item"><span className="hiw-check">✓</span><span>Print enclosure & assemble</span></div>
              </div>
            </div>
          </div>

          {/* Output type cards — horizontal row */}
          <div className="hiw-outputs">
            <div className="hiw-output"><span className="hiw-output-icon">plan</span><span className="hiw-output-name">Project plan</span></div>
            <div className="hiw-output"><span className="hiw-output-icon">.ino</span><span className="hiw-output-name">Source code</span></div>
            <div className="hiw-output"><span className="hiw-output-icon">svg</span><span className="hiw-output-name">Wiring diagram</span></div>
            <div className="hiw-output"><span className="hiw-output-icon">.stl</span><span className="hiw-output-name">3D model <span className="hiw-coming">soon</span></span></div>
            <div className="hiw-output"><span className="hiw-output-icon">.svg</span><span className="hiw-output-name">Laser design <span className="hiw-coming">soon</span></span></div>
          </div>
        </div>

        <footer className="landing-footer">© 2026 Fullmake</footer>
      </div>
    </>
  );
}
