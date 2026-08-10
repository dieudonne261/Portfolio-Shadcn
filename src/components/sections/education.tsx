"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"

export function Education() {
  const { language } = useLanguage()
  const content = siteContent[language]

  return (
    <section className="section-padding-y border-b border-border" id="education">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <SectionHeading kicker={content.educationKicker} title={content.educationTitle} />

        <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {content.education.map(([title, details], index) => (
            <Card key={title} className={`flex flex-col gap-2 p-5 ${index === 0 ? "sm:col-span-2" : ""}`}>
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{details}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
