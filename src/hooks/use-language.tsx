"use client"

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react"

import { LANGUAGE_COOKIE, type Language } from "@/lib/language"

export type { Language }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLanguage = "fr",
}: {
  children: ReactNode
  /**
   * Read from the cookie on the server so the first paint is already in the visitor's
   * language. Resolving it client-side instead showed a frame of French to everyone.
   */
  initialLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    document.documentElement.lang = lang
    // A cookie is what makes the choice visible to the server on the next request;
    // localStorage is kept so an existing preference is not lost.
    window.localStorage.setItem(LANGUAGE_COOKIE, lang)
    document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
  }, [])

  /**
   * Visitors from before the cookie existed only have the value in localStorage. Copying
   * it across without touching state keeps this render pure — their preference is then
   * served from the cookie on the next load, rather than flashing mid-visit.
   */
  useEffect(() => {
    if (document.cookie.includes(`${LANGUAGE_COOKIE}=`)) return
    const stored = window.localStorage.getItem(LANGUAGE_COOKIE)
    if (stored === "fr" || stored === "en") {
      document.cookie = `${LANGUAGE_COOKIE}=${stored}; path=/; max-age=31536000; samesite=lax`
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
