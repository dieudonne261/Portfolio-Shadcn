import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dede-portfolio.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The assistant proxy has nothing to index and should not be crawled.
      disallow: "/api/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
