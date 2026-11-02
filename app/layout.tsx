import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Isiolocoin Network",
  description: "A user-first gateway to the Isiolocoin ecosystem.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
