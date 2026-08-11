"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FileText,
  Gamepad2,
  GraduationCap,
  MonitorSmartphone,
  Palette,
  ServerCog,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"

const isVideo = (media: string) => /\.(mp4|webm)$/i.test(media)

const projectIcons = {
  education: GraduationCap,
  resume: FileText,
  mobile: BookOpen,
  desktop: MonitorSmartphone,
  analytics: BarChart3,
  api: ServerCog,
  game: Gamepad2,
  design: Palette,
  app: Smartphone,
}

export function Projects() {
  const { language } = useLanguage()
  const content = siteContent[language]
  const [showAll, setShowAll] = useState(false)
  const visibleProjects = showAll ? content.projects : content.projects.slice(0, 6)

  return (
    <section className="section-padding-y border-b border-border" id="projects">
      <div className="container-padding-x container mx-auto flex flex-col gap-10 md:gap-12">
        <SectionHeading
          kicker={content.projectKicker}
          title={content.projectTitle}
          description={content.projectDescription}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => {
            const ProjectIcon = projectIcons[project.icon]
            // Widened on purpose: `as const` narrows every entry to its literal path, which
            // would make the no-media fallback unreachable for TypeScript.
            const media: string = project.image
            return (
              <Card
                key={project.title}
                className="group flex flex-col overflow-hidden transition-colors hover:border-foreground/20"
              >
                <div className="relative grid min-h-[180px] place-items-center overflow-hidden border-b border-border bg-muted">
                  {isVideo(media) ? (
                    <video
                      src={media}
                      // Muted + playsInline are what let mobile browsers autoplay at all;
                      // the clip is decorative, so it loops without controls.
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      className="project-image absolute inset-0 size-full object-cover"
                    />
                  ) : media ? (
                    <Image
                      src={media}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      // Animated GIFs lose their frames if the optimiser rewrites them.
                      unoptimized={media.endsWith(".gif")}
                      className="project-image object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold tracking-tight text-muted-foreground/40">
                      {project.mark}
                    </span>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {project.label}
                    </span>
                    <ProjectIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

                  <div className="mt-auto pt-2">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {content.visitProject}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{content.noPublicLink}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {content.projects.length > 6 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowAll((current) => !current)}>
              {showAll ? content.showLess : content.showMore}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
