"use client"

import React, { useEffect, useState } from "react"
import { Menu, Moon, Sun, Languages, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const content = siteContent[language]

  const toggleLanguage = () => setLanguage(language === "fr" ? "en" : "fr")
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  // The bar stays transparent over the hero and gains its border and blur once the
  // page scrolls, so the transition reads as one continuous movement.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const themeButton = (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Sun className="size-[1.2rem] rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100" />
    </Button>
  )

  const languageButton = (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
      <Languages className="size-[1.2rem]" />
      <span className="sr-only">{language === "fr" ? "English" : "Français"}</span>
    </Button>
  )

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out",
        isScrolled
          ? "border-border bg-background/85 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/60 backdrop-blur-sm"
      )}
    >
      {/*
        The side groups share the leftover space equally (flex-1 on both), which is what
        keeps the links optically centred — justify-between would push them off-centre
        because the brand and the actions have very different widths.
      */}
      <nav className="container-padding-x container mx-auto flex h-16 items-center gap-4" aria-label="Main">
        <div className="flex min-w-0 flex-1 justify-start">
          <a href="#" aria-label="Home" className="flex shrink-0 items-center">
            <span className="font-signature text-sm font-normal sm:text-base">Dieu Donné</span>
          </a>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {content.nav.map(([label, id]) => (
            <Button key={id} asChild variant="ghost" size="sm">
              <a href={`#${id}`}>{label}</a>
            </Button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          {themeButton}
          {languageButton}
          <Button asChild size="sm" className="ml-1 hidden md:inline-flex">
            <a href="#contact">{content.contactMe}</a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="ml-1 md:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </nav>

      {/*
        The menu is mounted only while open and the animation is decorative: if it never
        runs, the panel is still laid out and usable. Driving the open state through an
        animated property instead would leave the menu collapsed whenever it fails.
      */}
      {isOpen && (
        <div id="mobile-menu" className="animate-dropdown border-t border-border md:hidden">
          <div className="container-padding-x container mx-auto flex flex-col gap-1 py-3">
            {content.nav.map(([label, id]) => (
              <Button
                key={id}
                asChild
                variant="ghost"
                className="justify-start"
                onClick={() => setIsOpen(false)}
              >
                <a href={`#${id}`}>{label}</a>
              </Button>
            ))}
            <Button asChild className="mt-2" onClick={() => setIsOpen(false)}>
              <a href="#contact">{content.contactMe}</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
