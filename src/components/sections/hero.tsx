"use client"

import React from "react"
import Image from "next/image"
import { ArrowRight, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CvDownload } from "@/components/cv-download"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"

export function Hero() {
  const { language } = useLanguage()
  const content = siteContent[language]

  return (
    <section className="border-b border-border" aria-labelledby="hero-heading">
      <div className="container-padding-x container mx-auto grid items-center gap-6 py-10 md:py-16 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
            {content.availability}
          </Badge>

          <div className="flex flex-col gap-4">
            {/* Playwrite tops out at 400, so no bold utility here — it would be synthesised. */}
            <p className="font-signature text-base font-normal text-muted-foreground sm:text-lg">
              Randrianarison Dieu Donné
            </p>
            <h1 id="hero-heading" className="heading-xl">
              {content.heroHeading}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              {content.hero}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg">
              <a href="#contact">
                {content.contactMe}
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#projects">{content.exploreWork}</a>
            </Button>
            <CvDownload />
          </div>

          <dl className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6 lg:justify-start">
            <div className="flex items-center gap-2">
              <dt className="sr-only">{content.location}</dt>
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <dd>{content.location}</dd>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
            <div>
              <dt className="sr-only">Role</dt>
              <dd>{content.role}</dd>
            </div>
          </dl>
        </div>

        {/*
          The negative bottom margin cancels the section's own bottom padding so the
          portrait sits flush on the divider line instead of floating above it.
        */}
        {/*
          The width lives on this wrapper, not on the image: in an auto-sized grid column
          the image's own contribution follows its srcset pick, which drifts on resize.
        */}
        <div className="mx-auto -mb-10 flex w-full max-w-[12rem] justify-center self-end sm:max-w-[15rem] md:-mb-16 lg:w-[19rem] lg:max-w-none xl:w-[22rem]">
          {/*
            The portrait is 704x1195 (h = w x 1.7), so width alone drives the height.
            Widths are capped so the rendered height stays under ~520px and the hero
            fits a 768px-tall screen without scrolling.
          */}
          <Image
            src="/assets/images/hero-portrait.png"
            alt={content.heroPortraitAlt}
            // Read by the intro animation to know where the portrait must land.
            data-hero-portrait=""
            width={704}
            height={1195}
            priority
            sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 19rem, (min-width: 640px) 15rem, 12rem"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}
