import * as React from "react"

import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  kicker: string
  title: string
  description?: string
  align?: "center" | "start"
  headingId?: string
  className?: string
}

/**
 * Shared heading for every section, so the kicker, title and description keep
 * the same type scale and rhythm across the page.
 */
export function SectionHeading({
  kicker,
  title,
  description,
  align = "center",
  headingId,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start text-left",
        className
      )}
    >
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {kicker}
      </span>
      <h2 id={headingId} className="heading-lg">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
