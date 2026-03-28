import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fullmake — Describe it. Make it.",
  description:
    "Turn your project ideas into build-ready code, models, and designs.",
  openGraph: {
    title: "Fullmake — Describe it. Make it.",
    description:
      "Turn your project ideas into build-ready code, models, and designs.",
    url: "https://fullmake.eu",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-dark.svg", type: "image/svg+xml" },
      {
        url: "/favicon-light.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — DM Sans + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-bg text-brand-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
