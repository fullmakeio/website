"use client";

// ============================================
// FULLMAKE — Landing Page (Next.js)
// 4 scroll panels: Hero, Features, How it works, Waitlist
// Crossfade scroll engine with nav dots
// Dark mode via CSS variables (prefers-color-scheme)
// 
// Chat #14 changes:
// - How it Works panel: animated typing + output cards + SVG wiring draw
// - Krem background fix: #F5F1EB (was #FAFAF9)
// - Dark mode: #1E1B18 (was #1C1917)
// - CTA button text: "Get early access" (was "Notify me")
// ============================================

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [activePanel, setActivePanel] = useState(0);
  const panelsRef = useRef<(HTMLElement | null)[]>([]);
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);

  const PANEL_COUNT = 4;
  const ZONE_HEIGHT_VH = 120;

  // =============================================
  // SCROLL CROSSFADE ENGINE
  // Panels are position:fixed, stacked on top of each other.
  // Scroll position maps to panel transitions.
  // Each "zone" = one transition between panels.
  // Within a zone: outgoing fades 1→0, incoming fades 0→1.
  //
  // Chat #14: adds .active class to visible panel to trigger
  // CSS animations (typing, card stagger, SVG draw).
  // =============================================
  useEffect(() => {
    function updatePanels() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const zoneHeight = (vh * ZONE_HEIGHT_VH) / 100;
      const totalHeight = zoneHeight * (PANEL_COUNT - 1);

      const progress = Math.min(scrollY / totalHeight, 1);
      const rawIndex = progress * (PANEL_COUNT - 1);
      const currentIndex = Math.floor(rawIndex);
      const blend = rawIndex - currentIndex;

      let newActiveIndex = currentIndex;

      panelsRef.current.forEach((panel, i) => {
        if (!panel) return;

        let opacity = 0;
        let translateY = 20;

        if (i === currentIndex && i < PANEL_COUNT - 1) {
          opacity = 1 - blend;
          translateY = -20 * blend;
        } else if (i === currentIndex + 1) {
          opacity = blend;
          translateY = 20 * (1 - blend);
          if (blend > 0.5) newActiveIndex = i;
        } else if (i === currentIndex && i === PANEL_COUNT - 1) {
          opacity = 1;
          translateY = 0;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        panel.style.opacity = String(opacity);
        panel.style.zIndex = i === newActiveIndex || i === currentIndex ? "2" : "1";
        panel.style.pointerEvents = opacity > 0.5 ? "auto" : "none";

        // Chat #14: Toggle .active class for animation triggers
        // Panel is "active" when it's the dominant visible panel
        if (i === newActiveIndex && opacity > 0.4) {
          panel.classList.add("active");
        } else if (opacity < 0.1) {
          // Reset animations when panel is fully hidden
          // so they replay on next visit
          panel.classList.remove("active");
        }

        const inner = panel.querySelector(".panel-inner") as HTMLElement;
        if (inner) {
          inner.style.transform = `translateY(${translateY}px)`;
        }
      });

      setActivePanel(newActiveIndex);

      if (footerRef.current) {
        const lastOpacity = parseFloat(panelsRef.current[PANEL_COUNT - 1]?.style.opacity || "0");
        footerRef.current.style.opacity = lastOpacity > 0.8 ? "1" : "0";
      }
    }

    window.addEventListener("scroll", updatePanels, { passive: true });
    updatePanels();

    function handleKeydown(e: KeyboardEvent) {
      const vh = window.innerHeight;
      const zoneHeight = (vh * ZONE_HEIGHT_VH) / 100;
      const current = Math.round(window.scrollY / zoneHeight);

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (current < PANEL_COUNT - 1) goToPanel(current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (current > 0) goToPanel(current - 1);
      }
    }

    document.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("scroll", updatePanels);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  function goToPanel(index: number) {
    const vh = window.innerHeight;
    const zoneHeight = (vh * ZONE_HEIGHT_VH) / 100;
    window.scrollTo({ top: index * zoneHeight, behavior: "smooth" });
  }

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
        /* =============================================
           CSS VARIABLES — Light / Dark mode
           Chat #14: Fixed krem #F5F1EB (was #FAFAF9)
           Chat #14: Fixed dark #1E1B18 (was #1C1917)
           ============================================= */
        :root {
          --bg: #F5F1EB;
          --bg-surface: #FFFFFF;
          --text-primary: #1C1917;
          --text-secondary: #78716C;
          --text-tertiary: #A8A29E;
          --accent: #D97706;
          --accent-hover: #B45309;
          --accent-light: rgba(217, 119, 6, 0.1);
          --accent-glow: rgba(217, 119, 6, 0.08);
          --border: rgba(28, 25, 23, 0.08);
          --border-strong: rgba(28, 25, 23, 0.14);
          --slash-top: rgba(217, 119, 6, 1);
          --slash-bottom: rgba(217, 119, 6, 0.08);
          --success: #16A34A;
          --error: #DC2626;
          --code-bg: #292524;
          --code-text: #D6D3D1;
          --code-keyword: #F59E0B;
          --code-comment: #78716C;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #1E1B18;
            --bg-surface: #2A2622;
            --text-primary: #F5F1EB;
            --text-secondary: #A8A29E;
            --text-tertiary: #78716C;
            --accent: #F59E0B;
            --accent-hover: #D97706;
            --accent-light: rgba(245, 158, 11, 0.12);
            --accent-glow: rgba(245, 158, 11, 0.06);
            --border: rgba(245, 241, 235, 0.08);
            --border-strong: rgba(245, 241, 235, 0.14);
            --slash-top: rgba(245, 158, 11, 1);
            --slash-bottom: rgba(245, 158, 11, 0.08);
            --code-bg: #171411;
            --code-text: #D6D3D1;
          }
        }

        /* Reset — scoped to landing page */
        .landing-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background-color: var(--bg);
          color: var(--text-primary);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .scroll-spacer {
          height: 500vh;
          position: relative;
        }

        .panel {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          opacity: 0;
          pointer-events: none;
          background: var(--bg);
          z-index: 1;
        }

        .panel-inner {
          max-width: 720px;
          width: 100%;
          transform: translateY(20px);
          transition: transform 0.1s linear;
        }

        /* Nav dots */
        .nav-dots {
          position: fixed;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 100;
        }

        .nav-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-tertiary);
          border: none;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
          padding: 0;
        }

        .nav-dot:hover {
          background: var(--text-secondary);
          transform: scale(1.3);
        }

        .nav-dot.active {
          background: var(--accent);
          transform: scale(1.3);
        }

        @media (max-width: 640px) {
          .nav-dots { right: 0.6rem; gap: 0.6rem; }
          .nav-dot { width: 6px; height: 6px; }
        }

        /* =============================================
           HERO PANEL
           ============================================= */
        .hero-panel { text-align: center; z-index: 2; }

        .hero-panel::before {
          content: '';
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-panel .panel-inner {
          position: relative;
          z-index: 1;
        }

        .logo-landing {
          display: inline-block;
          width: min(340px, 75vw);
          height: auto;
          margin-bottom: 2rem;
        }

        .logo-text { fill: var(--text-primary); }

        .logo-slash {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: slash-draw 0.8s ease-out 0.4s forwards;
        }

        .hero-tagline {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          font-weight: 400;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
          margin-bottom: 0.75rem;
        }

        .hero-description {
          font-size: clamp(0.9rem, 2.2vw, 1rem);
          color: var(--text-secondary);
          max-width: 420px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .hero-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-primary {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #FFFFFF;
          background: var(--accent);
          border: none;
          border-radius: 8px;
          padding: 0.8rem 2rem;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary:hover { background: var(--accent-hover); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .hero-secondary {
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }

        .hero-secondary button {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 1px solid var(--accent);
          padding: 0 0 1px 0;
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: opacity 0.2s;
        }

        .hero-secondary button:hover { opacity: 0.7; }

        .scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.4;
        }

        .scroll-hint svg {
          width: 20px;
          height: 20px;
          stroke: var(--text-tertiary);
          animation: bounce 2s ease-in-out infinite;
        }

        /* =============================================
           SHARED SECTION STYLES
           ============================================= */
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 3rem;
          max-width: 480px;
        }

        /* =============================================
           FEATURES GRID (Panel 2)
           ============================================= */
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .feature-card {
          background: var(--bg);
          padding: 2rem 1.5rem;
        }

        .feature-icon {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--accent);
          background: var(--accent-light);
          display: inline-block;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 540px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        /* =============================================
           HOW IT WORKS — ANIMATED (Panel 3)
           Chat #14: Complete redesign with animations
           
           Layout: Two-column
           Left: Animated terminal (typing + generating)
           Right: Staggered output cards
           
           Animations trigger when .panel.active is set
           by the crossfade engine (opacity > 0.4).
           ============================================= */
        .hiw-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (max-width: 700px) {
          .hiw-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        /* --- Left column: Animated terminal --- */
        .hiw-terminal {
          background: var(--code-bg);
          border-radius: 10px;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          line-height: 1.7;
        }

        .hiw-terminal-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: rgba(0,0,0,0.25);
        }

        .hiw-terminal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .hiw-terminal-dot:nth-child(1) { background: #EF4444; }
        .hiw-terminal-dot:nth-child(2) { background: #EAB308; }
        .hiw-terminal-dot:nth-child(3) { background: #22C55E; }

        .hiw-terminal-body {
          padding: 14px 16px 18px;
          min-height: 200px;
        }

        .hiw-terminal-prompt {
          color: var(--code-comment);
        }

        /* Typing animation: characters reveal one by one */
        .hiw-typing {
          color: var(--code-text);
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid var(--accent);
          width: 0;
          display: inline-block;
          vertical-align: bottom;
        }

        /* Only animate when panel is active */
        .panel.active .hiw-typing {
          animation: typing 2.5s steps(38) 0.8s forwards,
                     blink-caret 0.6s step-end 6 0.8s;
        }

        /* Generating status line */
        .hiw-generating {
          color: var(--accent);
          margin-top: 12px;
          opacity: 0;
        }

        .panel.active .hiw-generating {
          animation: fadeIn 0.3s ease 3.5s forwards;
        }

        /* Spinner dots */
        .hiw-spinner {
          display: inline-block;
        }

        .panel.active .hiw-spinner {
          animation: ellipsis 1.5s steps(4) 3.5s infinite;
        }

        /* Generated output preview — mini wiring SVG */
        .hiw-output-preview {
          margin-top: 12px;
          opacity: 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 12px;
        }

        .panel.active .hiw-output-preview {
          animation: fadeIn 0.4s ease 5s forwards;
        }

        .hiw-output-label {
          color: var(--code-comment);
          font-size: 0.7rem;
          margin-bottom: 8px;
        }

        /* Mini wiring SVG — lines draw in when visible */
        .hiw-wire {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          fill: none;
        }

        .panel.active .hiw-wire {
          animation: wire-draw 0.8s ease forwards;
        }

        .panel.active .hiw-wire:nth-child(1) { animation-delay: 5.2s; }
        .panel.active .hiw-wire:nth-child(2) { animation-delay: 5.5s; }
        .panel.active .hiw-wire:nth-child(3) { animation-delay: 5.8s; }
        .panel.active .hiw-wire:nth-child(4) { animation-delay: 6.1s; }

        .hiw-chip {
          opacity: 0;
        }

        .panel.active .hiw-chip {
          animation: fadeIn 0.3s ease forwards;
        }

        .panel.active .hiw-chip:nth-of-type(1) { animation-delay: 5s; }
        .panel.active .hiw-chip:nth-of-type(2) { animation-delay: 5.1s; }
        .panel.active .hiw-chip:nth-of-type(3) { animation-delay: 5.15s; }
        .panel.active .hiw-chip:nth-of-type(4) { animation-delay: 5.2s; }

        /* --- Right column: Output cards --- */
        .hiw-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hiw-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          opacity: 0;
          transform: translateY(12px);
        }

        /* Staggered card entrance — each card slides up with delay */
        .panel.active .hiw-card {
          animation: cardIn 0.45s ease forwards;
        }

        .panel.active .hiw-card:nth-child(1) { animation-delay: 3.8s; }
        .panel.active .hiw-card:nth-child(2) { animation-delay: 4.1s; }
        .panel.active .hiw-card:nth-child(3) { animation-delay: 4.4s; }
        .panel.active .hiw-card:nth-child(4) { animation-delay: 4.7s; }
        .panel.active .hiw-card:nth-child(5) { animation-delay: 5.0s; }

        .hiw-card-icon {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
          background: var(--accent-light);
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .hiw-card-text h4 {
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .hiw-card-text p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .hiw-coming {
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--text-tertiary);
          background: var(--border);
          padding: 2px 7px;
          border-radius: 4px;
          margin-left: 6px;
          vertical-align: middle;
        }

        /* Checkmark that appears at the end */
        .hiw-done {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--accent);
          opacity: 0;
        }

        .panel.active .hiw-done {
          animation: fadeIn 0.4s ease 5.5s forwards;
        }

        .hiw-done svg {
          width: 18px;
          height: 18px;
        }

        .hiw-done-check {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
        }

        .panel.active .hiw-done-check {
          animation: wire-draw 0.4s ease 5.7s forwards;
        }

        /* =============================================
           ANIMATIONS
           ============================================= */
        @keyframes slash-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink-caret {
          50% { border-color: transparent; }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes cardIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wire-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes ellipsis {
          0%  { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }

        /* Ellipsis workaround — CSS content animation
           doesn't work on all browsers, use opacity trick */
        .hiw-dot1, .hiw-dot2, .hiw-dot3 {
          opacity: 0;
        }

        .panel.active .hiw-dot1 {
          animation: blink-dot 1.5s ease-in-out 3.5s infinite;
        }
        .panel.active .hiw-dot2 {
          animation: blink-dot 1.5s ease-in-out 3.8s infinite;
        }
        .panel.active .hiw-dot3 {
          animation: blink-dot 1.5s ease-in-out 4.1s infinite;
        }

        @keyframes blink-dot {
          0%, 100% { opacity: 0; }
          30%, 70% { opacity: 1; }
        }

        /* =============================================
           WAITLIST SECTION (Panel 4)
           ============================================= */
        .waitlist-box {
          background: var(--bg-surface);
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
        }

        .waitlist-box h2 {
          font-size: clamp(1.3rem, 3.5vw, 1.6rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .waitlist-box > p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        .form-row {
          display: flex;
          gap: 0.5rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-row input[type="email"] {
          flex: 1;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }

        .form-row input[type="email"]:focus { border-color: var(--accent); }
        .form-row input[type="email"]::placeholder { color: var(--text-tertiary); }

        .form-message {
          font-size: 0.85rem;
          margin-top: 1rem;
          min-height: 1.4em;
        }

        .form-message.success { color: var(--success); }
        .form-message.error { color: var(--error); }

        .form-note {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          margin-top: 1rem;
        }

        .waitlist-alt {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .waitlist-alt a {
          color: var(--accent);
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid var(--accent);
          padding-bottom: 1px;
          transition: opacity 0.2s;
        }

        .waitlist-alt a:hover { opacity: 0.7; }

        .launch-signal {
          font-size: 0.8rem;
          color: var(--accent);
          margin-bottom: 1.5rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        @media (max-width: 440px) {
          .form-row { flex-direction: column; }
          .btn-primary { width: 100%; }
          .waitlist-box { padding: 2rem 1.25rem; }
        }

        /* Footer */
        .footer-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          text-align: center;
          padding: 1rem;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .footer-bar p {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }
      `}</style>

      <div className="landing-root">
        <div className="scroll-spacer" />

        {/* Nav dots */}
        <nav className="nav-dots" aria-label="Page navigation">
          {["Hero", "Features", "How it works", "Waitlist"].map((label, i) => (
            <button
              key={i}
              ref={(el) => { dotsRef.current[i] = el; }}
              className={`nav-dot ${activePanel === i ? "active" : ""}`}
              onClick={() => goToPanel(i)}
              aria-label={label}
            />
          ))}
        </nav>

        {/* ======= 1. HERO ======= */}
        <section
          className="panel hero-panel"
          ref={(el) => { panelsRef.current[0] = el; }}
        >
          <div className="panel-inner">
            <svg
              className="logo-landing"
              viewBox="0 0 440 56"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Fullmake logo"
            >
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--slash-top)" />
                  <stop offset="100%" stopColor="var(--slash-bottom)" />
                </linearGradient>
              </defs>
              <text
                x="0" y="42"
                fontFamily="'DM Sans', system-ui, sans-serif"
                fontSize="44" fontWeight="700"
                className="logo-text"
                letterSpacing="-2"
              >
                full
              </text>
              <line
                className="logo-slash"
                x1="140" y1="2" x2="128" y2="52"
                stroke="url(#sg)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <text
                x="148" y="42"
                fontFamily="'DM Sans', system-ui, sans-serif"
                fontSize="44" fontWeight="300"
                className="logo-text"
                letterSpacing="-2"
              >
                make
              </text>
            </svg>

            <p className="hero-tagline">Describe it. Make it.</p>
            <p className="hero-description">
              Turn your project ideas into build-ready code, models, and designs.
            </p>

            <div className="hero-cta">
              <Link href="/app" className="btn-primary">
                Try the Planner
              </Link>
              <p className="hero-secondary">
                or{" "}
                <button onClick={() => goToPanel(3)}>
                  get notified when we launch
                </button>
              </p>
            </div>
          </div>

          <div className="scroll-hint">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </section>

        {/* ======= 2. FEATURES ======= */}
        <section
          className="panel"
          ref={(el) => { panelsRef.current[1] = el; }}
        >
          <div className="panel-inner">
            <p className="section-label">What you get</p>
            <h2 className="section-title">Everything your project needs</h2>
            <p className="section-subtitle">
              Describe what you want to build. Fullmake generates everything you
              need to start making.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <span className="feature-icon">plan</span>
                <h3>Project planner</h3>
                <p>
                  Get a hardware recommendation, component list, budget estimate,
                  and step-by-step build guide.
                </p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">.ino</span>
                <h3>Generated code</h3>
                <p>
                  Arduino, ESP32, or Raspberry Pi code — commented, tested, and
                  ready to upload.
                </p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">.stl</span>
                <h3>3D models</h3>
                <p>
                  Parametric enclosures, mounts, and parts generated as OpenSCAD
                  files for 3D printing.
                </p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">.svg</span>
                <h3>Laser designs</h3>
                <p>
                  Vector files for laser cutting and engraving — panels, labels,
                  decorative pieces.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======= 3. HOW IT WORKS — ANIMATED ======= 
            Chat #14: Redesigned with two-column layout.
            Left: Animated terminal simulating describe → generate flow.
            Right: Output cards that stagger in as "results".
            
            Animation sequence (all CSS, triggered by .active class):
            0.0s  — Panel fades in via crossfade engine
            0.8s  — Typing animation starts in terminal
            3.5s  — "Generating..." status appears with animated dots
            3.8s  — Output cards start staggering in (one every 0.3s)
            5.0s  — Mini wiring SVG draws in the terminal
            5.5s  — "Ready to build" checkmark appears
            ============================================= */}
        <section
          className="panel"
          ref={(el) => { panelsRef.current[2] = el; }}
        >
          <div className="panel-inner">
            <p className="section-label">How it works</p>
            <h2 className="section-title">Describe → Generate → Build</h2>

            <div className="hiw-layout">
              {/* Left: Animated terminal */}
              <div>
                <div className="hiw-terminal">
                  <div className="hiw-terminal-bar">
                    <span className="hiw-terminal-dot" />
                    <span className="hiw-terminal-dot" />
                    <span className="hiw-terminal-dot" />
                  </div>
                  <div className="hiw-terminal-body">
                    <div className="hiw-terminal-prompt">{">"} Describe your project:</div>
                    <div style={{ marginTop: "4px" }}>
                      <span className="hiw-typing">
                        WiFi cat feeder with scheduled times
                      </span>
                    </div>
                    <div className="hiw-generating">
                      <span className="hiw-spinner">Generating</span>
                      <span className="hiw-dot1">.</span>
                      <span className="hiw-dot2">.</span>
                      <span className="hiw-dot3">.</span>
                    </div>

                    {/* Mini wiring diagram — SVG lines draw in */}
                    <div className="hiw-output-preview">
                      <div className="hiw-output-label">wiring_diagram.svg</div>
                      <svg viewBox="0 0 220 90" width="100%" xmlns="http://www.w3.org/2000/svg">
                        {/* ESP32 chip */}
                        <rect className="hiw-chip" x="10" y="15" width="60" height="60" rx="4"
                          fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                        <text className="hiw-chip" x="24" y="50"
                          fill="var(--accent)" fontSize="9" fontFamily="JetBrains Mono, monospace">
                          ESP32
                        </text>

                        {/* Servo */}
                        <rect className="hiw-chip" x="150" y="8" width="55" height="30" rx="4"
                          fill="none" stroke="var(--code-text)" strokeWidth="1" opacity="0.6" />
                        <text className="hiw-chip" x="158" y="27"
                          fill="var(--code-text)" fontSize="7" fontFamily="JetBrains Mono, monospace" opacity="0.7">
                          Servo
                        </text>

                        {/* RTC */}
                        <rect className="hiw-chip" x="150" y="52" width="55" height="30" rx="4"
                          fill="none" stroke="var(--code-text)" strokeWidth="1" opacity="0.6" />
                        <text className="hiw-chip" x="155" y="71"
                          fill="var(--code-text)" fontSize="7" fontFamily="JetBrains Mono, monospace" opacity="0.7">
                          DS3231
                        </text>

                        {/* Wires — draw in one by one */}
                        <line className="hiw-wire" x1="70" y1="30" x2="150" y2="20"
                          stroke="#EF4444" strokeWidth="1.5" />
                        <line className="hiw-wire" x1="70" y1="40" x2="150" y2="28"
                          stroke="#3B82F6" strokeWidth="1.5" />
                        <line className="hiw-wire" x1="70" y1="55" x2="150" y2="60"
                          stroke="#22C55E" strokeWidth="1.5" />
                        <line className="hiw-wire" x1="70" y1="65" x2="150" y2="72"
                          stroke="#A855F7" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Output cards (staggered entrance) */}
              <div>
                <div className="hiw-cards">
                  <div className="hiw-card">
                    <span className="hiw-card-icon">plan</span>
                    <div className="hiw-card-text">
                      <h4>Project plan</h4>
                      <p>Components, budget, platform recommendation</p>
                    </div>
                  </div>
                  <div className="hiw-card">
                    <span className="hiw-card-icon">.ino</span>
                    <div className="hiw-card-text">
                      <h4>Full source code</h4>
                      <p>Commented, tested, ready to upload</p>
                    </div>
                  </div>
                  <div className="hiw-card">
                    <span className="hiw-card-icon">svg</span>
                    <div className="hiw-card-text">
                      <h4>Wiring diagram</h4>
                      <p>Interactive pin-by-pin connections</p>
                    </div>
                  </div>
                  <div className="hiw-card">
                    <span className="hiw-card-icon">.stl</span>
                    <div className="hiw-card-text">
                      <h4>3D enclosure <span className="hiw-coming">coming soon</span></h4>
                      <p>Parametric models for 3D printing</p>
                    </div>
                  </div>
                  <div className="hiw-card">
                    <span className="hiw-card-icon">.svg</span>
                    <div className="hiw-card-text">
                      <h4>Laser designs <span className="hiw-coming">coming soon</span></h4>
                      <p>Cut and engrave files for your project</p>
                    </div>
                  </div>
                </div>

                {/* Final checkmark */}
                <div className="hiw-done">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="1.5" />
                    <path className="hiw-done-check" d="M8 12.5l2.5 2.5 5-5"
                      stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Ready to build
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======= 4. WAITLIST ======= */}
        <section
          className="panel"
          ref={(el) => { panelsRef.current[3] = el; }}
        >
          <div className="panel-inner">
            <div className="waitlist-box">
              <p className="launch-signal">Launching soon · Limited early access</p>
              <h2>Be the first to build</h2>
              <p>
                We&apos;re building Fullmake right now. Leave your email — we&apos;ll
                let you know when it&apos;s ready to try.
              </p>

              <div className="form-row">
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={formState === "success"}
                />
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={formState === "sending" || formState === "success"}
                >
                  {formState === "sending"
                    ? "Sending..."
                    : formState === "success"
                      ? "Done"
                      : "Get early access"}
                </button>
              </div>

              {formMessage && (
                <p className={`form-message ${formState === "error" ? "error" : "success"}`}>
                  {formMessage}
                </p>
              )}

              <p className="form-note">No spam. Only launch updates.</p>

              <div className="waitlist-alt">
                <Link href="/app">Or try the Planner now →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="footer-bar" ref={footerRef}>
          <p>&copy; 2026 Fullmake</p>
        </div>
      </div>
    </>
  );
}
