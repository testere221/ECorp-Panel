import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "E-Corp",
  description: "E-Corp - Canlı Ağ Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

