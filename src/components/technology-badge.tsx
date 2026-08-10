"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Code2, GitBranch, Globe, Layers, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BrandIcon = {
  src: string
  /**
   * Some official marks are solid black (GitHub, Express, Tux, cPanel) and score a 0.9
   * contrast ratio on the dark background — inverting flips them to white there.
   */
  invertOnDark?: boolean
}

const brandIcons: Record<string, BrandIcon> = {
  Java: { src: "/assets/svg/java.svg" },
  "C++": { src: "/assets/svg/cplusplus.svg" },
  "C#": { src: "/assets/svg/c-sharp-programming-language-icon.svg" },
  PHP: { src: "/assets/svg/php-programming-language-icon.svg" },
  JavaScript: { src: "/assets/images/javascript.png" },
  HTML: { src: "/assets/images/html5.png" },
  CSS: { src: "/assets/images/css3.png" },
  "React.js": { src: "/assets/svg/reactjs-icon.svg" },
  "Bootstrap 5": { src: "/assets/svg/bootstrap-5-logo-icon.svg" },
  "Tailwind CSS": { src: "/assets/svg/tailwindcss-icon.svg" },
  "Node.js": { src: "/assets/svg/nodejs-icon.svg" },
  "Express.js": { src: "/assets/svg/expressjs-icon.svg", invertOnDark: true },
  Laravel: { src: "/assets/svg/laravel-3.svg" },
  MySQL: { src: "/assets/svg/mysql.svg" },
  PostgreSQL: { src: "/assets/svg/postgresql.svg" },
  MongoDB: { src: "/assets/svg/mongodb.svg" },
  GitHub: { src: "/assets/svg/github-icon.svg", invertOnDark: true },
  cPanel: { src: "/assets/svg/cpanel.svg", invertOnDark: true },
  Windows: { src: "/assets/svg/windows-color-icon.svg" },
  Linux: { src: "/assets/svg/linux.svg", invertOnDark: true },
}

/**
 * LWS is a hosting provider absent from the icon sets, and MERISE / UML are modelling
 * methods with no logo at all, so these keep a glyph on purpose.
 */
const fallbackIcons: Record<string, LucideIcon> = {
  LWS: Globe,
  MERISE: GitBranch,
  UML: Layers,
}

export function TechnologyBadge({ value }: { value: string }) {
  const [failed, setFailed] = useState(false)
  const brand = brandIcons[value]
  const Icon = fallbackIcons[value] ?? Code2

  return (
    <Badge
      variant="outline"
      className="gap-1.5 px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-muted"
    >
      {brand && !failed ? (
        <Image
          src={brand.src}
          alt=""
          width={14}
          height={14}
          // Next refuses SVG through the image optimizer unless dangerouslyAllowSVG is on;
          // serving them as-is keeps them working without loosening that setting.
          unoptimized={brand.src.endsWith(".svg")}
          // 20 icons weighing 90kB in total: loading them eagerly avoids any dependency
          // on IntersectionObserver and the pop-in as the section scrolls into view.
          loading="eager"
          onError={() => setFailed(true)}
          className={cn("size-3.5 object-contain", brand.invertOnDark && "dark:invert")}
        />
      ) : (
        <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      )}
      {value}
    </Badge>
  )
}
