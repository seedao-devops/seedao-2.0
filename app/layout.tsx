import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/**
 * Fonts:
 * - Noto Sans SC / Noto Serif SC are loaded via Google Fonts CSS so the
 *   browser can lazily fetch only the CJK ranges actually used. We tried
 *   `next/font/google` for these but it self-hosts every weight at build
 *   time which adds ~30s per cold compile for full CJK families.
 * - Geist Mono stays on next/font because it's small and Latin-only.
 *
 * To swap families: change the Google Fonts URL below and the corresponding
 * `--font-sans` / `--font-serif` CSS variables in app/globals.css.
 */
const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeeDAO",
  description: "SeeDAO 数字游民社区平台",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SeeDAO",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f7f1e3",
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Noto+Sans+SC:wght@400;500;700",
    "family=Noto+Serif+SC:wght@500;700;900",
  ].join("&") +
  "&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${mono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
