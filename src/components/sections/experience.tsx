"use client"

import React from "react"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"

export function Experience() {
  const { language } = useLanguage()
  const content = siteContent[language]

  return (
    <section className="section-padding-y border-b border-border" id="experience">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <SectionHeading kicker={content.experienceKicker} title={content.experienceTitle} />

        <ol className="mx-auto flex w-full max-w-3xl flex-col">
          {content.experiences.map((experience, index) => (
            <li
              key={`${experience.company}-${index}`}
              className="grid gap-3 border-b border-border py-8 last:border-0 md:grid-cols-[1fr_auto] md:items-start md:gap-8"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold tracking-tight">{experience.role}</h3>
                <p className="text-sm text-muted-foreground">{experience.company}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {experience.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="order-first text-sm text-muted-foreground md:order-none md:whitespace-nowrap md:pt-0.5">
                {experience.duration}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
