"use client";

// ============================================
// FULLMAKE — How It Works Page
// Visual flow: Describe → Generate → Build
// Shows concrete examples of each output type
// ============================================

import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #F5F1EB;
          --bg-surface: #FFFFFF;
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
            --border: rgba(245, 241, 235, 0.08);
            --border-strong: rgba(245, 241, 235, 0.14);
            --slash-top: rgba(245, 158, 11, 1);
            --slash-bottom: rgba(245, 158, 11, 0.08);
            --code-bg: #171411;
            --code-text: #D6D3D1;
          }
        }

        .hiw-root {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* Nav bar */
        .hiw-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          max-width: 960px;
          margin: 0 auto;
        }

        .hiw-nav a {
          text-decoration: none;
        }

        .nav-logo {
          width: 120px;
          height: auto;
        }

        .nav-logo .logo-text { fill: var(--text-primary); }

        .nav-back {
          font-size: 0.85rem;
          color: var(--accent);
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .nav-back:hover { opacity: 0.7; }

        /* Hero section */
        .hiw-hero {
          text-align: center;
          padding: 3rem 2rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .hiw-hero h1 {
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          font-weight: 700;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }

        .hiw-hero p {
          font-size: clamp(0.9rem, 2.2vw, 1.05rem);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Steps container */
        .hiw-steps {
          max-width: 720px;
          margin: 0 auto;
          padding: 2rem 2rem 3rem;
        }

        /* Each step */
        .hiw-step {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
          align-items: flex-start;
        }

        .step-left {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 4px;
        }

        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent);
          color: #FFFFFF;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-line {
          width: 2px;
          flex: 1;
          min-height: 40px;
          background: linear-gradient(to bottom, var(--accent), var(--border));
          margin-top: 8px;
        }

        .step-right {
          flex: 1;
          min-width: 0;
        }

        .step-right h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .step-right > p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        /* Step 1: Input example */
        .input-example {
          background: var(--code-bg);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.7;
          color: var(--code-text);
        }

        .input-prompt {
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .input-text {
          color: var(--code-keyword);
        }

        /* Step 2: Output cards grid */
        .output-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .output-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1rem 1.15rem;
        }

        .output-icon {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--accent);
          background: var(--accent-light);
          display: inline-block;
          padding: 3px 8px;
          border-radius: 5px;
          margin-bottom: 0.6rem;
        }

        .output-card h3 {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
        }

        .output-card p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .output-coming {
          font-size: 0.6rem;
          font-weight: 500;
          color: var(--text-tertiary);
          background: rgba(28, 25, 23, 0.05);
          padding: 1px 6px;
          border-radius: 3px;
          margin-left: 6px;
        }

        @media (prefers-color-scheme: dark) {
          .output-coming {
            background: rgba(245, 241, 235, 0.06);
          }
        }

        /* Step 3: Build result */
        .build-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .build-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.75rem 1rem;
        }

        .build-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(22, 163, 74, 0.1);
          color: #16A34A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          flex-shrink: 0;
        }

        .build-item span {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        /* Bottom CTA */
        .hiw-cta {
          text-align: center;
          padding: 2rem 2rem 4rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .hiw-cta h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .hiw-cta p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #FFFFFF;
          background: var(--accent);
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.75rem;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary:hover { background: var(--accent-hover); }

        .btn-secondary {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--accent);
          background: none;
          border: 1px solid var(--accent);
          border-radius: 8px;
          padding: 0.75rem 1.75rem;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s, color 0.2s;
        }

        .btn-secondary:hover {
          background: var(--accent);
          color: #FFFFFF;
        }

        /* Footer */
        .hiw-footer {
          text-align: center;
          padding: 1rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .hiw-step { gap: 1.25rem; }
          .output-grid { grid-template-columns: 1fr; }
          .hiw-hero { padding: 2rem 1.25rem 1.5rem; }
          .hiw-steps { padding: 1.5rem 1.25rem 2rem; }
          .hiw-nav { padding: 1rem 1.25rem; }
          .cta-buttons { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div className="hiw-root">
        {/* Navigation */}
        <nav className="hiw-nav">
          <Link href="/">
            <svg
              className="nav-logo"
              viewBox="0 0 440 56"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Fullmake"
            >
              <defs>
                <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--slash-top)" />
                  <stop offset="100%" stopColor="var(--slash-bottom)" />
                </linearGradient>
              </defs>
              <text x="0" y="42" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="44" fontWeight="700" className="logo-text" letterSpacing="-2">full</text>
              <line x1="140" y1="2" x2="128" y2="52" stroke="url(#sg2)" strokeWidth="3.5" strokeLinecap="round" />
              <text x="148" y="42" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="44" fontWeight="300" className="logo-text" letterSpacing="-2">make</text>
            </svg>
          </Link>
          <Link href="/" className="nav-back">← Back</Link>
        </nav>

        {/* Hero */}
        <div className="hiw-hero">
          <h1>From idea to build-ready project</h1>
          <p>
            Describe what you want to make. Fullmake generates everything
            you need — code, components, wiring, and more.
          </p>
        </div>

        {/* Steps */}
        <div className="hiw-steps">

          {/* Step 1: Describe */}
          <div className="hiw-step">
            <div className="step-left">
              <div className="step-num">1</div>
              <div className="step-line" />
            </div>
            <div className="step-right">
              <h2>Describe your project</h2>
              <p>
                Tell Fullmake what you want to build in plain language.
                No technical knowledge required — just describe the idea.
              </p>
              <div className="input-example">
                <div className="input-prompt">&gt; What do you want to build?</div>
                <div className="input-text">
                  &quot;Automatic cat feeder with WiFi control
                  <br />
                  &nbsp;&nbsp;and scheduled feeding times&quot;
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Generate */}
          <div className="hiw-step">
            <div className="step-left">
              <div className="step-num">2</div>
              <div className="step-line" />
            </div>
            <div className="step-right">
              <h2>Get your complete build package</h2>
              <p>
                Fullmake analyzes your description and generates
                a complete, buildable project — not just a rough guide.
              </p>
              <div className="output-grid">
                <div className="output-card">
                  <span className="output-icon">plan</span>
                  <h3>Project plan</h3>
                  <p>Platform recommendation, component list with prices, and step-by-step build guide.</p>
                </div>
                <div className="output-card">
                  <span className="output-icon">.ino</span>
                  <h3>Working code</h3>
                  <p>Complete program ready to upload. Arduino, ESP32, or Raspberry Pi — commented and tested.</p>
                </div>
                <div className="output-card">
                  <span className="output-icon">svg</span>
                  <h3>Wiring diagram</h3>
                  <p>Visual pin-by-pin connection diagram. Interactive — hover to highlight wires.</p>
                </div>
                <div className="output-card">
                  <span className="output-icon">.stl</span>
                  <h3>3D enclosure <span className="output-coming">coming soon</span></h3>
                  <p>Parametric enclosures and mounts generated as OpenSCAD files for 3D printing.</p>
                </div>
                <div className="output-card">
                  <span className="output-icon">.svg</span>
                  <h3>Laser designs <span className="output-coming">coming soon</span></h3>
                  <p>Vector files for laser cutting and engraving — faceplates, labels, decorative pieces.</p>
                </div>
                <div className="output-card">
                  <span className="output-icon">chat</span>
                  <h3>Refine with AI</h3>
                  <p>Not perfect? Chat with the planner to swap components, change platform, or add features.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Build */}
          <div className="hiw-step">
            <div className="step-left">
              <div className="step-num">3</div>
            </div>
            <div className="step-right">
              <h2>Build it</h2>
              <p>
                Everything is ready to use. No blank-page problem,
                no hours of googling. Just order parts and start making.
              </p>
              <div className="build-checklist">
                <div className="build-item">
                  <div className="build-check">✓</div>
                  <span>Copy the code → upload to your board</span>
                </div>
                <div className="build-item">
                  <div className="build-check">✓</div>
                  <span>Follow the wiring diagram → connect components</span>
                </div>
                <div className="build-item">
                  <div className="build-check">✓</div>
                  <span>Order parts from the component list → exact names and prices</span>
                </div>
                <div className="build-item">
                  <div className="build-check">✓</div>
                  <span>Print the enclosure → plug everything in</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="hiw-cta">
          <h2>Ready to build something?</h2>
          <p>Try the planner now or sign up for early access when we launch.</p>
          <div className="cta-buttons">
            <Link href="/app" className="btn-primary">Try the Planner</Link>
            <Link href="/" className="btn-secondary">Get early access</Link>
          </div>
        </div>

        <footer className="hiw-footer">
          © 2026 Fullmake
        </footer>
      </div>
    </>
  );
}
