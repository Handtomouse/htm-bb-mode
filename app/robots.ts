import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/icon-comparison", "/design-system", "/settings"],
    },
    sitemap: "https://htm-bb-mode.vercel.app/sitemap.xml",
  };
}
