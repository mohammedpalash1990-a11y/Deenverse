import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEENVERSE — One Universe. Infinite Islamic Knowledge.",
  description: "A calm, considered space for Quran reading and Islamic learning.",
  manifest: "/manifest.webmanifest",
  applicationName: "DEENVERSE"
};

export const viewport: Viewport = {
  themeColor: "#101b19",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
