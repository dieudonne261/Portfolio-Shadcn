"use client"

import React, { FormEvent } from "react"
import { Mail, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"

const CONTACT_EMAIL = "ddieu0970@gmail.com"
const CONTACT_PHONE = "+261 34 12 722 76"

export function Contact() {
  const { language } = useLanguage()
  const content = siteContent[language]

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") || "")
    const email = String(formData.get("email") || "")
    const message = String(formData.get("message") || "")
    const subject = language === "fr" ? `Portfolio - message de ${name}` : `Portfolio message from ${name}`
    const replyTo = language === "fr" ? "Répondre à" : "Reply to"
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\n${replyTo}: ${email}`)}`
  }

  return (
    <section className="section-padding-y border-b border-border" aria-labelledby="contact-heading" id="contact">
      <div className="container-padding-x container mx-auto grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading
            align="start"
            headingId="contact-heading"
            kicker={content.contactKicker}
            title={content.contactTitle}
            description={content.contactDescription}
          />

          <div className="flex flex-col gap-4">
            <a
              className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              <Mail className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{content.writeEmail}</span>
                <span className="text-sm text-muted-foreground">{CONTACT_EMAIL}</span>
              </span>
            </a>

            <a
              className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              href="tel:+261341272276"
            >
              <Phone className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{content.call}</span>
                <span className="text-sm text-muted-foreground">{CONTACT_PHONE}</span>
              </span>
            </a>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <h3 className="text-lg font-semibold tracking-tight">{content.contactForm}</h3>
          <form onSubmit={submitContact} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-sm font-medium">
                {content.name}
              </label>
              <Input id="contact-name" name="name" required placeholder={content.name} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-sm font-medium">
                {content.email}
              </label>
              <Input id="contact-email" type="email" name="email" required placeholder={content.email} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-sm font-medium">
                {content.message}
              </label>
              <Textarea id="contact-message" name="message" required placeholder={content.message} className="min-h-[130px]" />
            </div>
            <Button type="submit" className="w-full">
              {content.send}
              <Send className="size-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">{content.formHint}</p>
          </form>
        </Card>
      </div>
    </section>
  )
}
