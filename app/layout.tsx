import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXORA — Think less. Do more.",
  description: "An intelligent command center that turns natural-language context into actionable plans.",
  keywords: ["command center", "executive assistant", "deep focus", "agentic planning", "productivity operating system"],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen selection:bg-brand-cyan/25 selection:text-brand-cyan">
        {children}
      </body>
    </html>
  );
}
