"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"
import { cn } from "@/lib/utils"

export function Education() {
  const { language } = useLanguage()
  const content = siteContent[language]

  /**
   * Two cards need the full row: the first diploma and the certification card carrying
   * badges. Whatever is left has to be even, otherwise the grid ends on a half-empty
   * row — so the final regular card is promoted to full width when the count is odd.
   */
  const fullWidth = useMemo(() => {
    const flags = content.education.map(
      (item, index) => index === 0 || ("badges" in item && Boolean(item.badges))
    )
    const regulars = flags.filter((flag) => !flag).length
    if (regulars % 2 === 1) {
      const last = flags.lastIndexOf(false)
      if (last !== -1) flags[last] = true
    }
    return flags
  }, [content.education])

  return (
    <section className="section-padding-y border-b border-border" id="education">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <SectionHeading kicker={content.educationKicker} title={content.educationTitle} />

        <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {content.education.map((item, index) => {
            const badges = "badges" in item ? item.badges : undefined
            const url = "url" in item ? item.url : undefined
            const urlLabel = "urlLabel" in item ? item.urlLabel : undefined

            return (
              <Card
                key={item.title}
                className={cn("flex flex-col gap-4 p-5", fullWidth[index] && "sm:col-span-2")}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold tracking-tight">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.details}</p>
                </div>

                {badges && (
                  <div className="flex flex-wrap gap-3">
                    {badges.map((badge) => (
                      // Both files share a 480x160 canvas, so identical chips give the two
                      // badges the same visual weight despite different logo proportions.
                      // Official Google marks are drawn dark for light backgrounds, hence
                      // the permanent white chip.
                      <span
                        key={badge.src}
                        className="grid h-20 w-full max-w-[13rem] place-items-center rounded-lg border border-border bg-white p-2"
                      >
                        <Image
                          src={badge.src}
                          alt={badge.alt}
                          width={badge.width}
                          height={badge.height}
                          // A definite height keeps the box measurable before the bytes
                          // land; w-auto follows the intrinsic ratio.
                          className="h-14 w-auto object-contain"
                        />
                      </span>
                    ))}
                  </div>
                )}

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {urlLabel}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
