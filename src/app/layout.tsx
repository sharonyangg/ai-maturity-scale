import type { Metadata } from "next";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import "./globals.css";

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
    <html lang="zh-Hant" className="h-full antialiased">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <body className="min-h-full flex flex-col">
        <InAppBrowserBanner />
        {children}
      </body>
    </html>
  );
}
