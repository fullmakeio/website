"use client";

// ============================================
// FULLMAKE — Landing Page (Next.js)
// Split layout: Left (brand + waitlist) / Right (interactive preview)
// Single viewport, no scrolling needed.
// Krem light mode (#F5F1EB) + warm dark mode (#1E1B18)
// ============================================

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Overview", "Components", "Wiring", "Code"];

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
           COLOR SYSTEM
           Light: warm krem (#F5F1EB)
           Dark: warm brown-black (#1E1B18)
           ============================================= */
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

        /* =============================================
           BASE
           ============================================= */
        .landing-root {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          -webkit-font-smoothing: antialiased;
        }

        /* =============================================
           MAIN LAYOUT — split left/right
           ============================================= */
        .landing-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 4rem;
          max-width: 1120px;
          margin: 0 auto;
          width: 100%;
        }

        .landing-left {
          flex: 1;
          max-width: 420px;
        }

        .landing-right {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =============================================
           LOGO — full/make wordmark with animated slash
           ============================================= */
        .logo-landing {
          display: inline-block;
          width: min(280px, 70vw);
          height: auto;
          margin-bottom: 1.25rem;
        }

        .logo-text { fill: var(--text-primary); }

        .logo-slash {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: slash-draw 0.8s ease-out 0.3s forwards;
        }

        @keyframes slash-draw {
          to { stroke-dashoffset: 0; }
        }

        /* =============================================
           LEFT SIDE — tagline, description, form
           ============================================= */
        .hero-tagline {
          font-size: clamp(1.05rem, 2.5vw, 1.25rem);
          font-weight: 400;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
          margin-bottom: 0.5rem;
        }

        .hero-description {
          font-size: clamp(0.85rem, 2vw, 0.95rem);
          color: var(--text-tertiary);
          line-height: 1.6;
          margin-bottom: 1.75rem;
          max-width: 360px;
        }

        /* Waitlist form */
        .form-row {
          display: flex;
          gap: 0.4rem;
          max-width: 360px;
          margin-bottom: 0.35rem;
        }

        .form-row input[type="email"] {
          flex: 1;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.875rem;
          padding: 0.65rem 0.85rem;
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          background: var(--bg-surface);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }

        .form-row input[type="email"]:focus {
          border-color: var(--accent);
        }

        .form-row input[type="email"]::placeholder {
          color: var(--text-tertiary);
        }

        .btn-notify {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #FFFFFF;
          background: var(--accent);
          border: none;
          border-radius: 8px;
          padding: 0.65rem 1.25rem;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .btn-notify:hover { background: var(--accent-hover); }
        .btn-notify:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-message {
          font-size: 0.8rem;
          min-height: 1.2em;
          margin-bottom: 0.25rem;
        }

        .form-message.success { color: var(--success); }
        .form-message.error { color: var(--error); }

        .form-note {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 1.5rem;
        }

        /* Try planner link */
        .try-planner {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .try-planner:hover { opacity: 0.7; }

        /* =============================================
           RIGHT SIDE — Interactive preview card
           ============================================= */
        .preview-card {
          background: var(--bg-surface);
          border-radius: 12px;
          border: 1px solid var(--border);
          box-shadow: var(--card-shadow);
          width: 100%;
          overflow: hidden;
        }

        /* Card header */
        .preview-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
        }

        .preview-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .preview-badges {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .badge-platform {
          background: var(--accent-light);
          color: var(--accent);
        }

        .badge-difficulty {
          background: rgba(22, 163, 74, 0.1);
          color: #16A34A;
        }

        /* Tabs */
        .preview-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }

        .preview-tab {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--text-tertiary);
          padding: 9px 14px;
          border: none;
          background: none;
          cursor: pointer;
          position: relative;
          white-space: nowrap;
          transition: color 0.15s;
        }

        .preview-tab:hover {
          color: var(--text-secondary);
        }

        .preview-tab.active {
          color: var(--accent);
          font-weight: 500;
        }

        .preview-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 12px;
          right: 12px;
          height: 2px;
          background: var(--accent);
          border-radius: 1px;
        }

        /* Tab content area */
        .preview-content {
          padding: 16px 18px;
          min-height: 200px;
        }

        /* Overview tab items */
        .overview-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
        }

        .overview-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .overview-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }

        .overview-value {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .coming-badge {
          font-size: 0.6rem;
          font-weight: 500;
          color: var(--coming-text);
          background: var(--coming-bg);
          padding: 1px 6px;
          border-radius: 3px;
          letter-spacing: 0.02em;
        }

        /* Components tab */
        .comp-item {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 5px 0;
          font-size: 0.78rem;
        }

        .comp-name {
          color: var(--text-primary);
          font-weight: 400;
        }

        .comp-qty {
          color: var(--text-tertiary);
          font-size: 0.7rem;
        }

        .comp-price {
          color: var(--text-secondary);
          font-size: 0.72rem;
          text-align: right;
          min-width: 40px;
        }

        /* Wiring tab */
        .wire-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          font-size: 0.75rem;
        }

        .wire-line {
          width: 16px;
          height: 2px;
          border-radius: 1px;
          flex-shrink: 0;
        }

        .wire-from {
          color: var(--text-secondary);
          flex: 1;
        }

        .wire-arrow {
          color: var(--text-tertiary);
          font-size: 0.65rem;
        }

        .wire-to {
          color: var(--text-primary);
          font-weight: 500;
        }

        /* Code tab */
        .code-block {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          line-height: 1.7;
          background: var(--code-bg);
          color: var(--code-text);
          padding: 14px 16px;
          border-radius: 8px;
          overflow-x: auto;
          white-space: pre;
        }

        .code-keyword { color: var(--code-keyword); }
        .code-string { color: var(--code-string); }
        .code-comment { color: var(--code-comment); font-style: italic; }

        /* Card footer — budget and time */
        .preview-footer {
          padding: 12px 18px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
        }

        .preview-stat-label {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          margin-bottom: 1px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .preview-stat-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* =============================================
           FOOTER
           ============================================= */
        .landing-footer {
          text-align: center;
          padding: 1rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* =============================================
           RESPONSIVE — mobile stacks vertically
           ============================================= */
        @media (max-width: 768px) {
          .landing-main {
            flex-direction: column;
            gap: 2rem;
            padding: 2rem 1.25rem;
            justify-content: flex-start;
            padding-top: 3rem;
          }

          .landing-left {
            max-width: 100%;
            text-align: center;
          }

          .landing-left .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .form-row {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .form-note {
            text-align: center;
          }

          .try-planner-wrap {
            text-align: center;
          }

          .landing-right {
            max-width: 380px;
            width: 100%;
          }
        }

        @media (max-width: 440px) {
          .form-row {
            flex-direction: column;
          }

          .btn-notify {
            width: 100%;
          }

          .preview-content {
            padding: 14px 14px;
          }
        }
      `}</style>

      <div className="landing-root">
        <main className="landing-main">

          {/* ======= LEFT SIDE — Brand + Waitlist ======= */}
          <div className="landing-left">

            {/* Logo with animated gradient slash */}
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
              Turn your project ideas into build-ready code, wiring diagrams,
              and 3D models. Tell us what to build — we handle the rest.
            </p>

            {/* Waitlist form */}
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
                className="btn-notify"
                onClick={handleSubmit}
                disabled={formState === "sending" || formState === "success"}
              >
                {formState === "sending"
                  ? "Sending..."
                  : formState === "success"
                    ? "Done ✓"
                    : "Notify me"}
              </button>
            </div>

            {formMessage && (
              <p className={`form-message ${formState === "error" ? "error" : "success"}`}>
                {formMessage}
              </p>
            )}

            <p className="form-note">No spam. Only launch updates.</p>

            <div className="try-planner-wrap">
              <Link href="/app" className="try-planner">
                Try the Planner →
              </Link>
            </div>
          </div>

          {/* ======= RIGHT SIDE — Interactive Preview Card ======= */}
          <div className="landing-right">
            <div className="preview-card">

              {/* Header */}
              <div className="preview-header">
                <div className="preview-title">WiFi cat feeder with scheduling</div>
                <div className="preview-badges">
                  <span className="badge badge-platform">ESP32</span>
                  <span className="badge badge-difficulty">intermediate</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="preview-tabs">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    className={`preview-tab ${activeTab === i ? "active" : ""}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="preview-content">
                {activeTab === 0 && (
                  <div>
                    <div className="overview-item">
                      <div className="overview-dot" style={{ background: "#D97706" }} />
                      <span className="overview-label">8 components</span>
                      <span className="overview-value">~€24</span>
                    </div>
                    <div className="overview-item">
                      <div className="overview-dot" style={{ background: "#16A34A" }} />
                      <span className="overview-label">Arduino code</span>
                      <span className="overview-value">145 lines</span>
                    </div>
                    <div className="overview-item">
                      <div className="overview-dot" style={{ background: "#3B82F6" }} />
                      <span className="overview-label">Wiring diagram</span>
                      <span className="overview-value">12 connections</span>
                    </div>
                    <div className="overview-item">
                      <div className="overview-dot" style={{ background: "#8B5CF6" }} />
                      <span className="overview-label">3D enclosure</span>
                      <span className="coming-badge">coming soon</span>
                    </div>
                    <div className="overview-item">
                      <div className="overview-dot" style={{ background: "#EC4899" }} />
                      <span className="overview-label">Laser-cut panels</span>
                      <span className="coming-badge">coming soon</span>
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div>
                    <div className="comp-item">
                      <span className="comp-name">ESP32 DevKit V1</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€5.50</span>
                    </div>
                    <div className="comp-item">
                      <span className="comp-name">SG90 Micro Servo 9g</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€2.50</span>
                    </div>
                    <div className="comp-item">
                      <span className="comp-name">IR Obstacle Sensor</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€1.50</span>
                    </div>
                    <div className="comp-item">
                      <span className="comp-name">Status LEDs (pack)</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€1.00</span>
                    </div>
                    <div className="comp-item">
                      <span className="comp-name">220Ω Resistors (pack)</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€1.00</span>
                    </div>
                    <div className="comp-item">
                      <span className="comp-name">Breadboard</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€3.00</span>
                    </div>
                    <div className="comp-item">
                      <span className="comp-name">Jumper wires (pack)</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€2.00</span>
                    </div>
                    <div className="comp-item" style={{ borderTop: "1px solid var(--border)", marginTop: "6px", paddingTop: "8px" }}>
                      <span className="comp-name" style={{ fontWeight: 600 }}>USB Micro cable</span>
                      <span className="comp-qty">×1</span>
                      <span className="comp-price">€2.00</span>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div>
                    <div className="wire-item">
                      <div className="wire-line" style={{ background: "#EF4444" }} />
                      <span className="wire-from">Servo VCC</span>
                      <span className="wire-arrow">→</span>
                      <span className="wire-to">5V (ext.)</span>
                    </div>
                    <div className="wire-item">
                      <div className="wire-line" style={{ background: "#6B7280" }} />
                      <span className="wire-from">Servo GND</span>
                      <span className="wire-arrow">→</span>
                      <span className="wire-to">GND</span>
                    </div>
                    <div className="wire-item">
                      <div className="wire-line" style={{ background: "#F59E0B" }} />
                      <span className="wire-from">Servo Signal</span>
                      <span className="wire-arrow">→</span>
                      <span className="wire-to">GPIO13</span>
                    </div>
                    <div className="wire-item">
                      <div className="wire-line" style={{ background: "#3B82F6" }} />
                      <span className="wire-from">IR Sensor OUT</span>
                      <span className="wire-arrow">→</span>
                      <span className="wire-to">GPIO14</span>
                    </div>
                    <div className="wire-item">
                      <div className="wire-line" style={{ background: "#3B82F6" }} />
                      <span className="wire-from">LED WiFi</span>
                      <span className="wire-arrow">→</span>
                      <span className="wire-to">GPIO2</span>
                    </div>
                    <div className="wire-item">
                      <div className="wire-line" style={{ background: "#3B82F6" }} />
                      <span className="wire-from">LED Feed</span>
                      <span className="wire-arrow">→</span>
                      <span className="wire-to">GPIO4</span>
                    </div>
                    <div className="wire-item" style={{ paddingTop: "8px" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                        + 6 more connections...
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="code-block">
                    <span className="code-comment">// WiFi Cat Feeder — ESP32</span>{"\n"}
                    <span className="code-keyword">#include</span>{" <WiFi.h>"}{"\n"}
                    <span className="code-keyword">#include</span>{" <WebServer.h>"}{"\n"}
                    <span className="code-keyword">#include</span>{" <ESP32Servo.h>"}{"\n"}
                    {"\n"}
                    <span className="code-keyword">const char</span>{"* ssid = "}<span className="code-string">{'"YOUR_SSID"'}</span>{";"}{"\n"}
                    <span className="code-keyword">Servo</span>{" feederServo;"}{"\n"}
                    {"\n"}
                    <span className="code-keyword">void</span>{" setup() {"}{"\n"}
                    {"  Serial.begin(115200);"}{"\n"}
                    {"  feederServo.attach(13);"}{"\n"}
                    {"  WiFi.begin(ssid, pass);"}{"\n"}
                    {"  "}<span className="code-comment">// ... 135 more lines</span>{"\n"}
                    {"}"}
                  </div>
                )}
              </div>

              {/* Footer — budget + time */}
              <div className="preview-footer">
                <div>
                  <div className="preview-stat-label">Est. budget</div>
                  <div className="preview-stat-value">€24.50</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="preview-stat-label">Build time</div>
                  <div className="preview-stat-value">2–3 hours</div>
                </div>
              </div>
            </div>
          </div>

        </main>

        <footer className="landing-footer">
          © 2026 Fullmake
        </footer>
      </div>
    </>
  );
}
