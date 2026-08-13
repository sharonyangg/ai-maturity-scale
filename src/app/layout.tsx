import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "企業成熟度診斷問卷",
  description: "身心障礙友善組織經營能力自我評估",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InAppBrowserBanner />
        {children}
      </body>
    </html>
  );
}
