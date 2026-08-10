/* eslint-disable @next/next/no-page-custom-font -- The user explicitly requested the Google Fonts link. */
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/hooks/use-language";

export const metadata: Metadata = {
  title: "Dieu Donné Randrianarison | Portfolio",
  description: "Portfolio de Dieu Donné Randrianarison, développeur Full-Stack et Support IT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
