"use client"

import { ReactNode } from "react"

import { useLanguage } from "@/hooks/use-language"

export function LanguageTransition({ children }: { children: ReactNode }) {
  const { language } = useLanguage()

  return (
    <div key={language} className="language-enter">
      {children}
    </div>
  )
}
