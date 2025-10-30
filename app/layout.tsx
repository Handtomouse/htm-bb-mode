import { VT323, Pixelify_Sans, Handjet } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const pixelifySans = Pixelify_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const handjet = Handjet({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-handjet",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>HandToMouse — BB Mode</title>
        <meta
          name="description"
          content="Creative systems, content infrastructure, and brand work by HandToMouse."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${vt323.variable} ${pixelifySans.variable} ${handjet.variable} antialiased`} style={{ fontFamily: "var(--font-mono)" }}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
