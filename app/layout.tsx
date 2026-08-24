import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowMotion — Studio Manager",
  description: "Personal photoshoot booking, client directory, and financial ledger",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-bg text-studio-text antialiased selection:bg-amber-500 selection:text-slate-950 min-h-screen">
        {children}
      </body>
    </html>
  );
}