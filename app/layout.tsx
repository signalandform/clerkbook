import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/app/contexts/toast";

export const metadata: Metadata = {
  title: "Citestack",
  description: "Citation-first research library (save → summarize → search → cite)",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
