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

export const metadata = {
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
        {/* Preload critical fonts for About page */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Handjet:wght@300;400;500;600;700&display=swap"
          as="style"
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
