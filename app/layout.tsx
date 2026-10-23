import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXORA | Think less. Do more.",
  description: "Agentic personal command center that turns natural-language requests into intelligent plans and actionable workflows.",
  keywords: ["productivity", "executive assistant", "agentic workflows", "focus mode", "time management"],
};

export const viewport: Viewport = {
  themeColor: "#08090D",
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
