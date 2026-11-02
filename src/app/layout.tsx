import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEENVERSE — One Universe. Infinite Islamic Knowledge.",
  description: "A calm, considered space for Quran reading and Islamic learning.",
  manifest: "/manifest.webmanifest",
  applicationName: "DEENVERSE",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DEENVERSE"
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#101b19",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
