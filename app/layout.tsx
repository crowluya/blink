import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BestLinks - 外链批量查询工具",
  description: "使用 CapSolver 和 Ahrefs 批量获取域名外链信息",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
