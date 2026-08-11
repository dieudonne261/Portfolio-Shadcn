"use client"

import React from "react"
import { Github, Linkedin, Mail, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"
import { contact } from "@/lib/profile"

const socials = [
  { label: "LinkedIn", href: contact.linkedin, Icon: Linkedin },
  { label: "GitHub", href: contact.github, Icon: Github },
]

export function Footer() {
  const { language } = useLanguage()
  const content = siteContent[language]

  return (
    <footer className="border-t border-border" role="contentinfo">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <a href="#" aria-label="Home" className="flex w-fit items-center">
              <span className="font-signature text-base font-normal">Dieu Donné</span>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{content.role}</p>
            <p className="text-sm text-muted-foreground">{content.location}</p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {content.footerNavLabel}
            </h2>
            {content.nav.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {content.contactKicker}
            </h2>
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              {contact.email}
            </a>
            <a
              href={contact.phoneHref}
              className="flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              {contact.phoneDisplay}
            </a>
            <div className="mt-1 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Randrianarison Dieu Donné</p>
        </div>
      </div>
    </footer>
  )
}
