import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { TopNavbar } from "@/components/ui";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevRoast",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-sans antialiased">
        <TopNavbar.Root>
          <TopNavbar.Brand>
            <TopNavbar.Prompt />
            <TopNavbar.BrandText>devroast</TopNavbar.BrandText>
          </TopNavbar.Brand>

          <TopNavbar.Right>
            <TopNavbar.Item>leaderboard</TopNavbar.Item>
          </TopNavbar.Right>
        </TopNavbar.Root>

        {children}
      </body>
    </html>
  );
}
