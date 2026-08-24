import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudioLedger",
  description: "Personal booking & wage manager for freelance photographers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-bg text-studio-text antialiased">
        {children}
      </body>
    </html>
  );
}
