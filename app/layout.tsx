import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "剧情分析 & 稿件生成",
  description: "AI 驱动的剧情分析与多风格稿件生成工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
