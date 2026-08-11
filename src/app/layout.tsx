/* eslint-disable @next/next/no-page-custom-font -- The user explicitly requested the Google Fonts link. */
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { LANGUAGE_COOKIE, parseLanguage } from "@/lib/language"
import { contact, fullName } from "@/lib/profile"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dede-portfolio.vercel.app"
const title = "Dieu Donné Randrianarison | Développeur Full-Stack & Support IT"
const description =
  "Portfolio de Randrianarison Dieu Donné, développeur Full-Stack et Support IT à Toamasina, Madagascar. Projets web, applications et accompagnement technique."

export const metadata: Metadata = {
  // Required for the social image and canonical URL to resolve to absolute links.
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Dieu Donné Randrianarison",
  },
  description,
  applicationName: "Portfolio Dieu Donné",
  authors: [{ name: fullName, url: contact.linkedin }],
  creator: fullName,
  keywords: [
    "Randrianarison Dieu Donné",
    "développeur full-stack",
    "support IT",
    "Madagascar",
    "Toamasina",
    "Next.js",
    "React",
    "Laravel",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Portfolio Dieu Donné",
    title,
    description,
    locale: "fr_MG",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const language = parseLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value)

  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Playwrite+DK+Uloopet:wght@100..400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased transition-colors duration-500 ease-in-out">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider initialLanguage={language}>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
