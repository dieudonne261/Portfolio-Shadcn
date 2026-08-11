/**
 * Shared between the server layout and the client provider, so it must NOT live in a
 * "use client" module: exports of a client module reach a server component as module
 * references rather than plain values, which silently breaks cookie lookups.
 */
export type Language = "fr" | "en"

export const LANGUAGE_COOKIE = "portfolio-lang"

export function parseLanguage(value: string | undefined | null): Language {
  return value === "en" ? "en" : "fr"
}
