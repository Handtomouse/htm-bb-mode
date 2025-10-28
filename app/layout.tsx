import { VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
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
      <body className={`${vt323.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
