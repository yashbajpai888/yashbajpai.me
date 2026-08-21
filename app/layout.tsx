import type { Metadata } from "next";
import { Inter, Oswald, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yashbajpai.me"),
  title: "Yash Bajpai — GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING ",
  description:
    "Official portfolio website of Yash Bajpai, GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING  crafting stylish, user-focused web experiences with strategy and precision.",
  keywords: [
    "Yash Bajpai",
    "Web Designer",
    "UI/UX Creator",
    "Portfolio",
    "Web Developer",
    "Figma",
    "Next.js"
  ],
  authors: [{ name: "Yash Bajpai" }],
  openGraph: {
    title: "Yash Bajpai — GTM ENGINEER SOFTWARE DEVELOPER & DIGITAL MARKETING ",
    description: "Turning ideas into powerful digital experiences.",
    images: ["/images/hero_portrait.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${oswald.variable} ${caveat.variable} dark`}>
      <body suppressHydrationWarning className="bg-[#060607] text-white antialiased selection:bg-rose-600 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
