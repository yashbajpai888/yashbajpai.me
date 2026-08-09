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
  title: "Yash Bajpai — Web Designer & UI/UX Creator",
  description:
    "Official portfolio website of Yash Bajpai, Web Designer & UI/UX Creator crafting stylish, user-focused web experiences with strategy and precision.",
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
    title: "Yash Bajpai — Web Designer & UI/UX Creator",
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
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${caveat.variable} dark`}>
      <body className="bg-[#060607] text-white antialiased selection:bg-rose-600 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
