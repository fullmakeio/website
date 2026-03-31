"use client";

// ============================================
// FULLMAKE — Landing Page (Next.js)
// Converted from landing-v3.html
// 4 scroll panels: Hero, Features, How it works, Waitlist
// Crossfade scroll engine with nav dots
// Dark mode via CSS variables (prefers-color-scheme)
// ============================================

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Metadata is handled in layout.tsx for App Router.
// If you need page-specific metadata, export a metadata object
// from a separate metadata.ts file or use generateMetadata().

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
          // Outgoing panel — fade from 1 to 0
          opacity = 1 - blend;
          translateY = -20 * blend;
        } else if (i === currentIndex + 1) {
          // Incoming panel — fade from 0 to 1
          opacity = blend;
          translateY = 20 * (1 - blend);
          if (blend > 0.5) newActiveIndex = i;
        } else if (i === currentIndex && i === PANEL_COUNT - 1) {
          // Last panel, fully visible
          opacity = 1;
          translateY = 0;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        panel.style.opacity = String(opacity);
        panel.style.zIndex = i === newActiveIndex || i === currentIndex ? "2" : "1";
        panel.style.pointerEvents = opacity > 0.5 ? "auto" : "none";

        const inner = panel.querySelector(".panel-inner") as HTMLElement;
        if (inner) {
          inner.style.transform = `translateY(${translateY}px)`;
        }
      });

      setActivePanel(newActiveIndex);

      // Footer visibility on last panel
      if (footerRef.current) {
        const lastOpacity = parseFloat(panelsRef.current[PANEL_COUNT - 1]?.style.opacity || "0");
        footerRef.current.style.opacity = lastOpacity > 0.8 ? "1" : "0";
      }
    }

    window.addEventListener("scroll", updatePanels, { passive: true });
    updatePanels(); // Initial state

    // Keyboard navigation
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

  // Navigate to a specific panel by scrolling to its zone
  function goToPanel(index: number) {
    const vh = window.innerHeight;
    const zoneHeight = (vh * ZONE_HEIGHT_VH) / 100;
    window.scrollTo({ top: index * zoneHeight, behavior: "smooth" });
  }

  // =============================================
  // WAITLIST FORM SUBMISSION
  // Calls the real backend API endpoint
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
      {/* =============================================
          EMBEDDED STYLES
          CSS variables handle light/dark mode automatically.
          Custom styles for scroll engine, panels, and components.
          ============================================= */}
      <style>{`
        :root {
          --bg: #FAFAF9;
          --bg-surface: #FFFFFF;
          --text-primary: #1C1917;
          --text-secondary: #78716C;
          --text-tertiary: #A8A29E;
          --accent: #D97706;
          --accent-hover: #B45309;
          --accent-light: #FEF3C7;
          --accent-glow: rgba(217, 119, 6, 0.08);
          --border: rgba(28, 25, 23, 0.08);
          --border-strong: rgba(28, 25, 23, 0.12);
          --slash-top: rgba(217, 119, 6, 1);
          --slash-bottom: rgba(217, 119, 6, 0.08);
          --success: #16A34A;
          --error: #DC2626;
          --code-bg: #292524;
          --code-text: #FAFAF9;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #1C1917;
            --bg-surface: #292524;
            --text-primary: #FAFAF9;
            --text-secondary: #A8A29E;
            --text-tertiary: #78716C;
            --accent: #F59E0B;
            --accent-hover: #D97706;
            --accent-light: rgba(245, 158, 11, 0.1);
            --accent-glow: rgba(245, 158, 11, 0.06);
            --border: rgba(250, 250, 249, 0.08);
            --border-strong: rgba(250, 250, 249, 0.12);
            --slash-top: rgba(245, 158, 11, 1);
            --slash-bottom: rgba(245, 158, 11, 0.08);
            --code-bg: #1C1917;
            --code-text: #F59E0B;
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

        /* Scroll spacer — creates scrollable height for crossfade engine */
        .scroll-spacer {
          height: 500vh;
          position: relative;
        }

        /* Fixed panels — stacked, opacity controlled by scroll engine */
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

        /* Nav dots — fixed right side */
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

        /* Hero panel */
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

        /* Hero dual CTA */
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

        /* Shared section styles */
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

        /* Features grid */
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

        /* How it works — steps */
        .steps {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          position: relative;
          padding-left: 2rem;
        }

        .steps::before {
          content: '';
          position: absolute;
          left: 0.45rem;
          top: 0.6rem;
          bottom: 0.6rem;
          width: 1px;
          background: linear-gradient(to bottom, var(--accent), var(--border));
        }

        .step { position: relative; }

        .step-number {
          position: absolute;
          left: -2rem;
          top: 0;
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-number::after {
          content: '';
          width: 0.35rem;
          height: 0.35rem;
          border-radius: 50%;
          background: var(--bg);
        }

        .step h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .step p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .step-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          background: var(--code-bg);
          color: var(--code-text);
          padding: 0.9rem 1.1rem;
          border-radius: 8px;
          margin-top: 0.75rem;
          overflow-x: auto;
          line-height: 1.6;
        }

        /* Waitlist section */
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

        /* Animations */
        @keyframes slash-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>

      <div className="landing-root">
        {/* Scroll spacer — provides scroll distance for 4 panels */}
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
            {/* Logo: full/make wordmark */}
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

            {/* Dual CTA: primary button + secondary text link */}
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

        {/* ======= 3. HOW IT WORKS ======= */}
        <section
          className="panel"
          ref={(el) => { panelsRef.current[2] = el; }}
        >
          <div className="panel-inner">
            <p className="section-label">How it works</p>
            <h2 className="section-title">Three steps to your next build</h2>

            <div className="steps">
              <div className="step">
                <div className="step-number" />
                <h3>Describe your project</h3>
                <p>Tell Fullmake what you want to build, in plain language.</p>
                <div className="step-code">
                  &gt; &quot;Automatic cat feeder with WiFi
                  <br />
                  &nbsp;&nbsp;control and scheduled feeding times&quot;
                </div>
              </div>
              <div className="step">
                <div className="step-number" />
                <h3>Get your build package</h3>
                <p>
                  Receive a complete project plan with components, code, models,
                  and wiring diagrams — all tailored to your description.
                </p>
              </div>
              <div className="step">
                <div className="step-number" />
                <h3>Build it</h3>
                <p>
                  Download your files, order the parts, and start making.
                  Everything is ready to use — no blank-page problem.
                </p>
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
                      : "Notify me"}
                </button>
              </div>

              {formMessage && (
                <p className={`form-message ${formState === "error" ? "error" : "success"}`}>
                  {formMessage}
                </p>
              )}

              <p className="form-note">No spam. Only launch updates.</p>

              {/* Secondary CTA — try the planner now */}
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
