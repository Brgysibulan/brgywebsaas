import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRGYWEBSAAS",
  description: "Multi-tenant Barangay Website and Digital Services Platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
