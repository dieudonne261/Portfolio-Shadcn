"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SectionHeading } from "@/components/section-heading"
import { TechnologyBadge } from "@/components/technology-badge"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"

export function About() {
  const { language } = useLanguage()
  const content = siteContent[language]

  return (
    <section className="section-padding-y border-b border-border" id="about-me">
      <div className="container-padding-x container mx-auto grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeading
            align="start"
            kicker={content.aboutKicker}
            title={content.aboutTitle}
          />
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {content.aboutText}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Français · Avancé</Badge>
            <Badge variant="secondary">English · Intermediate</Badge>
            <Badge variant="secondary">Support IT</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {content.skillsLabel}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.skills.map((skill) => {
              const Icon = skill.icon
              return (
                <Card key={skill.title} className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <h3 className="text-sm font-semibold tracking-tight">{skill.title}</h3>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {skill.values.map((value) => (
                      <TechnologyBadge key={value} value={value} />
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
