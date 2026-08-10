"use client"

import React, { useState } from "react"
import { Bot, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"
import { cn } from "@/lib/utils"

type ChatMessage = { role: "assistant" | "user"; text: string }
type Language = "fr" | "en"

function localAssistantReply(message: string, language: Language) {
  const query = message.toLowerCase()
  const french = language === "fr"
  if (/(project|projet|edusmart|careerflow|baiboly)/.test(query)) {
    return french
      ? "Ses projets récents sont EduSmart, une plateforme de gouvernance scolaire ; CareerFlow AI, une plateforme SaaS de création de CV ; et Ny Baiboly DIEM v1.2, une application de la Bible en malagasy."
      : "His recent projects are EduSmart, a school-governance platform; CareerFlow AI, a SaaS platform for CVs; and Ny Baiboly DIEM v1.2, a Malagasy Bible app."
  }
  if (/(skill|competenc|stack|technolog|technique)/.test(query)) {
    return french
      ? "Ses compétences couvrent Java, C++, C#, PHP, JavaScript ; le web avec React.js, Node.js, Laravel ; et les bases MySQL, PostgreSQL."
      : "His skills cover Java, C++, C#, PHP, JavaScript; web dev with React.js, Node.js, Laravel; and MySQL, PostgreSQL databases."
  }
  if (/(experience|expérien|strelitzia|nexus|netpro|changes)/.test(query)) {
    return french
      ? "Son parcours comprend du support HelpDesk à STRELITZIA SCHOOL, un stage web chez Nexus SARLU, de l’administration IT à ONG Changes Of Madagascar, et un stage web chez NetPro Web."
      : "His background includes HelpDesk support at STRELITZIA SCHOOL, a web internship at Nexus SARLU, IT admin at ONG Changes Of Madagascar, and a web internship at NetPro Web."
  }
  if (/(contact|email|e-mail|mail|phone|téléphone|linkedin|github)/.test(query)) {
    return french
      ? "Vous pouvez le joindre à ddieu0970@gmail.com ou au +261 34 12 722 76. Ses liens sociaux sont aussi dans la section Contact."
      : "You can reach him at ddieu0970@gmail.com or +261 34 12 722 76. His social links are also in the Contact section."
  }
  return siteContent[language].aiFallback
}

export function AiChat() {
  const { language } = useLanguage()
  const content = siteContent[language]
  
  const [chatOpen, setChatOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: content.aiGreeting }])

  const visibleMessages = messages.length === 1
    ? [{ role: "assistant" as const, text: content.aiGreeting }]
    : messages

  async function askAssistant(rawMessage: string) {
    const text = rawMessage.trim()
    if (!text || isThinking) return

    setDraft("")
    setIsThinking(true)
    setMessages((current) => current.length === 1
      ? [{ role: "assistant", text: content.aiGreeting }, { role: "user", text }]
      : [...current, { role: "user", text }]
    )

    if (process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === "true") {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, language }),
        })
        const data = (await response.json()) as { content?: string }
        setMessages((current) => [...current, { role: "assistant", text: data.content?.trim() || localAssistantReply(text, language) }])
      } catch {
        setMessages((current) => [...current, { role: "assistant", text: localAssistantReply(text, language) }])
      }
    } else {
      setTimeout(() => {
        setMessages((current) => [...current, { role: "assistant", text: localAssistantReply(text, language) }])
        setIsThinking(false)
      }, 600)
      return
    }

    setIsThinking(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {chatOpen && (
        <Card className="animate-in mb-4 flex w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden shadow-2xl">
          <div className="flex items-start justify-between border-b bg-muted/50 px-4 py-3.5">
            <div className="flex gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Bot className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">{content.aiTitle}</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{content.aiSubtitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} aria-label="Close assistant">
              <X className="size-4" />
            </Button>
          </div>
          
          <div className="max-h-72 min-h-[200px] space-y-4 overflow-y-auto p-4 bg-background">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6",
                  message.role === "assistant"
                    ? "rounded-tl-sm bg-muted text-foreground"
                    : "ml-auto rounded-tr-sm bg-primary text-primary-foreground"
                )}
              >
                {message.text}
              </div>
            ))}
            {isThinking && (
              <div className="w-fit rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-xs text-muted-foreground animate-pulse">
                ...
              </div>
            )}
          </div>
          
          <div className="border-t p-3 bg-background">
            <div className="mb-3 flex flex-wrap gap-2">
              {content.aiSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => askAssistant(suggestion)}
                  className="rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                askAssistant(draft)
              }}
              className="flex gap-2"
            >
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={content.aiPlaceholder}
                className="flex-1 bg-background"
              />
              <Button type="submit" size="icon" disabled={isThinking || !draft.trim()} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
      
      <Button
        onClick={() => setChatOpen((open) => !open)}
        className={cn(
          "rounded-full shadow-xl transition-all duration-300",
          chatOpen ? "bg-muted text-foreground hover:bg-muted/80 size-12" : "h-12 px-5"
        )}
        size={chatOpen ? "icon" : "default"}
        aria-label={content.aiTitle}
      >
        {chatOpen ? <X className="size-5" /> : (
          <>
            <Bot className="size-5 mr-2" />
            <span className="font-semibold tracking-wide">{content.aiTitle}</span>
          </>
        )}
      </Button>
    </div>
  )
}
