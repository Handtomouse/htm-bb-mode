import { VT323, Handjet, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import LayoutWrapper from "@/components/LayoutWrapper";
import SettingsProvider from "@/components/SettingsProvider";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const handjet = Handjet({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-handjet",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://htm-bb-mode.vercel.app'),
  title: {
    default: "HandToMouse — BB Mode",
    template: "%s | HandToMouse BB Mode"
  },
  description: "Creative systems, content infrastructure, and brand work by HandToMouse. Everyone's chasing new — we chase different. Independent creative direction and cultural strategy from Sydney.",
  keywords: ["creative direction", "brand strategy", "cultural strategy", "design", "sydney", "portfolio", "branding", "web design"],
  authors: [{ name: "HandToMouse" }],
  creator: "HandToMouse",
  publisher: "HandToMouse",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://htm-bb-mode.vercel.app",
    siteName: "HandToMouse BB Mode",
    title: "HandToMouse — BB Mode",
    description: "Everyone's chasing new — we chase different. Independent creative direction and cultural strategy from Sydney.",
    images: [
      {
        url: "/logos/HTM-LOGO-ICON-01.svg",
        width: 1200,
        height: 630,
        alt: "HandToMouse Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "HandToMouse — BB Mode",
    description: "Everyone's chasing new — we chase different.",
    creator: "@handtomouse",
    images: ["/logos/HTM-LOGO-ICON-01.svg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logos/HTM-LOGO-ICON-01.svg"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Adobe Fonts - Argent Pixel CF */}
        <link rel="stylesheet" href="https://use.typekit.net/swi6eoo.css" />
        {/* Preload critical fonts for About page */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Handjet:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        {/* Prefetch About page data for instant load */}
        <link rel="prefetch" href="/data/about.json" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={`${vt323.variable} ${handjet.variable} ${robotoMono.variable} antialiased`} style={{ fontFamily: "var(--font-body)" }}>
        <SettingsProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}
