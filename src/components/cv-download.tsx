"use client"

import React, { useEffect, useState } from "react"
import { Download, FileText, Loader2, ScanLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"
import { resumeFileName, type ResumeVariant } from "@/lib/profile"
import { cn } from "@/lib/utils"

/** How long the confirmation stays up before the dialog closes on its own. */
const CLOSE_DELAY_MS = 1400

export function CvDownload() {
  const { language } = useLanguage()
  const content = siteContent[language]
  const [open, setOpen] = useState(false)
  const [available, setAvailable] = useState<Record<string, boolean>>({})
  const [downloading, setDownloading] = useState<ResumeVariant | null>(null)

  const variants: Array<{ id: ResumeVariant; label: string; description: string; Icon: typeof FileText }> = [
    { id: "pro", label: content.cvProLabel, description: content.cvProDescription, Icon: FileText },
    { id: "ats", label: content.cvAtsLabel, description: content.cvAtsDescription, Icon: ScanLine },
  ]

  // The file name carries spaces and an accent, so the path has to be encoded.
  const hrefFor = (variant: ResumeVariant) => encodeURI(`/assets/cv/${resumeFileName(variant, language)}`)

  // Probe on open so a variant that has not been produced yet is shown as unavailable
  // rather than handing the visitor a link to a 404.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    Promise.all(
      variants.map(async ({ id }) => {
        const href = hrefFor(id)
        try {
          const response = await fetch(href, { method: "HEAD" })
          return [href, response.ok] as const
        } catch {
          return [href, false] as const
        }
      })
    ).then((entries) => {
      if (!cancelled) setAvailable((current) => ({ ...current, ...Object.fromEntries(entries) }))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, language])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          <Download className="size-4" />
          {content.cvButton}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.cvDialogTitle}</DialogTitle>
          <DialogDescription>{content.cvDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {variants.map(({ id, label, description, Icon }) => {
            const href = hrefFor(id)
            const isAvailable = available[href]

            if (isAvailable === false) {
              return (
                <div
                  key={id}
                  className="flex items-start gap-4 rounded-lg border border-dashed border-border p-4 opacity-60"
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">{description}</span>
                    <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {content.cvUnavailable}
                    </span>
                  </span>
                </div>
              )
            }

            const isDownloading = downloading === id

            return (
              <a
                key={id}
                href={href}
                download={resumeFileName(id, language)}
                // The browser gives no event when a download finishes, so the state is
                // held just long enough to confirm the click, then the dialog closes.
                onClick={() => {
                  setDownloading(id)
                  window.setTimeout(() => {
                    setOpen(false)
                    setDownloading(null)
                  }, CLOSE_DELAY_MS)
                }}
                aria-busy={isDownloading}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isDownloading ? "border-primary/40 bg-muted" : "border-border hover:bg-muted"
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm text-muted-foreground">
                    {isDownloading ? content.cvDownloading : description}
                  </span>
                </span>
                {isDownloading ? (
                  <Loader2 className="ml-auto mt-0.5 size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
                ) : (
                  <Download className="ml-auto mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </a>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
