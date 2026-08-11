"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Bot, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"
import { siteContent } from "@/lib/content"
import { localAnswer } from "@/lib/profile"
import { cn } from "@/lib/utils"

type ChatMessage = { role: "assistant" | "user"; text: string; isError?: boolean }
type Point = { x: number; y: number }
type Side = "left" | "right"

const BUBBLE_SIZE = 48
const EDGE_GAP = 16
const DRAG_THRESHOLD = 6
/** Enough turns for follow-up questions without inflating the prompt on every call. */
const HISTORY_TURNS = 6
const PANEL_GAP = 12
const PANEL_MAX_HEIGHT = 512
const PANEL_MIN_HEIGHT = 240

/**
 * The model answers in light markdown (**bold**, "- " bullets). Rather than pulling in a
 * markdown renderer for a few inline marks, the text is split into React nodes — no
 * dangerouslySetInnerHTML, so nothing the model returns can inject markup.
 */
function renderRichText(text: string) {
  return text.split("\n").map((line, lineIndex) => {
    const bullet = /^\s*[-*]\s+/.test(line)
    const body = bullet ? line.replace(/^\s*[-*]\s+/, "") : line
    const parts = body.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

    return (
      <span key={lineIndex} className={cn("block", bullet && "pl-3 -indent-3")}>
        {bullet && "• "}
        {parts.map((part, partIndex) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={partIndex} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <React.Fragment key={partIndex}>{part}</React.Fragment>
          )
        )}
      </span>
    )
  })
}

export function AiChat() {
  const { language } = useLanguage()
  const content = siteContent[language]

  const [chatOpen, setChatOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: content.aiGreeting }])
  const [position, setPosition] = useState<Point | null>(null)
  const [side, setSide] = useState<Side>("right")
  const [isDragging, setIsDragging] = useState(false)
  const [panel, setPanel] = useState<{ placement: "above" | "below" | "viewport"; maxHeight: number }>({
    placement: "above",
    maxHeight: PANEL_MAX_HEIGHT,
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)

  const visibleMessages = messages.length === 1
    ? [{ role: "assistant" as const, text: content.aiGreeting }]
    : messages

  // Follow the conversation as it grows. Smooth scrolling is a no-op in environments
  // where the compositor is idle, so a short follow-up check guarantees the newest
  // message is reachable even when the animation never runs.
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
    const settle = window.setTimeout(() => {
      const remaining = node.scrollHeight - node.clientHeight - node.scrollTop
      if (remaining > 4) node.scrollTop = node.scrollHeight
    }, 500)
    return () => window.clearTimeout(settle)
  }, [visibleMessages.length, isThinking, chatOpen])

  /**
   * The launcher is a circle when open but a wide pill when closed, so its real width has
   * to be measured: pinning it with the 48px constant pushed the expanded label off the
   * right edge of the screen.
   */
  const launcherWidth = useCallback(
    // offsetWidth, not getBoundingClientRect: the latter includes the scale applied while
    // dragging, which skewed the resting position by a few pixels.
    () => bubbleRef.current?.offsetWidth || BUBBLE_SIZE,
    []
  )

  const clampToViewport = useCallback(
    (point: Point): Point => {
      const maxX = window.innerWidth - launcherWidth() - EDGE_GAP
      const maxY = window.innerHeight - BUBBLE_SIZE - EDGE_GAP
      return {
        x: Math.min(Math.max(point.x, EDGE_GAP), Math.max(EDGE_GAP, maxX)),
        y: Math.min(Math.max(point.y, EDGE_GAP), Math.max(EDGE_GAP, maxY)),
      }
    },
    [launcherWidth]
  )

  /**
   * Magnetic release: the launcher never rests mid-screen. Whichever edge the bubble's
   * centre is closest to wins, and the vertical position is kept as dropped.
   */
  const snapToEdge = useCallback(
    (point: Point) => {
      const clamped = clampToViewport(point)
      const width = launcherWidth()
      const nextSide: Side = clamped.x + width / 2 < window.innerWidth / 2 ? "left" : "right"
      const restingX = nextSide === "left"
        ? EDGE_GAP
        : Math.max(EDGE_GAP, window.innerWidth - width - EDGE_GAP)
      return { point: { x: restingX, y: clamped.y }, side: nextSide }
    },
    [clampToViewport, launcherWidth]
  )

  // A resize can leave a dragged bubble off-screen, so re-attach it to the nearest edge.
  useEffect(() => {
    if (!position) return
    const onResize = () => {
      const snapped = snapToEdge(position)
      setPosition(snapped.point)
      setSide(snapped.side)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [position, snapToEdge])

  /**
   * The panel opens towards whichever side of the launcher has more room, and never taller
   * than that room. Opening upwards unconditionally pushed it off the top of the screen as
   * soon as the bubble was magnetised near the top edge.
   */
  useEffect(() => {
    if (!chatOpen) return
    const measure = () => {
      const launcherTop = position ? position.y : window.innerHeight - BUBBLE_SIZE - 24
      const roomAbove = launcherTop - EDGE_GAP - PANEL_GAP
      const roomBelow = window.innerHeight - (launcherTop + BUBBLE_SIZE) - EDGE_GAP - PANEL_GAP
      const room = Math.max(roomAbove, roomBelow)

      // Short viewports — landscape phones, mostly — can leave too little room on either
      // side of the launcher. Forcing the minimum height there pushed the panel off the
      // screen, so it detaches and spans the viewport instead.
      if (room < PANEL_MIN_HEIGHT) {
        setPanel({ placement: "viewport", maxHeight: window.innerHeight - EDGE_GAP * 2 })
        return
      }

      setPanel({
        placement: roomAbove >= roomBelow ? "above" : "below",
        maxHeight: Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_MAX_HEIGHT, room)),
      })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [chatOpen, position])

  /**
   * Opening and closing swaps the launcher between a circle and a labelled pill. Once the
   * width transition has settled, re-attach it so a right-anchored launcher stays flush
   * with the edge instead of hanging off it.
   */
  useEffect(() => {
    if (!position) return
    const settle = window.setTimeout(() => {
      const snapped = snapToEdge(position)
      setPosition(snapped.point)
      setSide(snapped.side)
    }, 350)
    return () => window.clearTimeout(settle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen])

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    if (!drag.moved) {
      drag.moved = true
      setIsDragging(true)
    }
    setPosition(clampToViewport({ x: drag.originX + dx, y: drag.originY + dy }))
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)

    // A press that never crossed the threshold is a tap, not a drag.
    if (drag && !drag.moved) {
      setChatOpen((open) => !open)
      return
    }

    // Released after a real drag: let it fly to the closest edge. The resting place is
    // derived from the event itself rather than from state, so no update is queued from
    // inside another updater.
    if (!drag) return
    const dropped = clampToViewport({
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    })
    const snapped = snapToEdge(dropped)
    setPosition(snapped.point)
    setSide(snapped.side)
  }

  async function askAssistant(rawMessage: string) {
    const text = rawMessage.trim()
    if (!text || isThinking) return

    // The prior turns travel with the question so follow-ups like "and the first one?"
    // still make sense to the model.
    const history = (messages.length === 1 ? [] : messages)
      .filter((message) => !message.isError)
      .slice(-HISTORY_TURNS)
      .map(({ role, text: messageText }) => ({ role, text: messageText }))

    setDraft("")
    setIsThinking(true)
    setMessages((current) => current.length === 1
      ? [{ role: "assistant", text: content.aiGreeting }, { role: "user", text }]
      : [...current, { role: "user", text }]
    )

    const reply = (message: ChatMessage) => {
      setMessages((current) => [...current, message])
      setIsThinking(false)
    }

    if (process.env.NEXT_PUBLIC_AI_CHAT_ENABLED !== "true") {
      // No service configured: answer from the site content, and say so when the
      // question falls outside what that content covers.
      window.setTimeout(() => {
        reply({ role: "assistant", text: localAnswer(text, language) ?? content.aiFallback })
      }, 400)
      return
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language, history }),
      })
      const data = (await response.json().catch(() => null)) as { content?: string } | null

      if (response.ok && data?.content?.trim()) {
        reply({ role: "assistant", text: data.content.trim() })
        return
      }

      if (response.status === 429) {
        reply({ role: "assistant", text: content.aiRateLimited, isError: true })
        return
      }
      if (response.status === 413) {
        reply({ role: "assistant", text: content.aiTooLong, isError: true })
        return
      }
      throw new Error("Assistant unavailable")
    } catch {
      // Never pass a canned answer off as the assistant's: fall back only when the
      // question maps to known content, and flag the outage otherwise.
      const offline = localAnswer(text, language)
      reply(
        offline
          ? { role: "assistant", text: offline }
          : { role: "assistant", text: content.aiError, isError: true }
      )
    }
  }

  // Until it is dragged the launcher keeps its CSS corner anchor; afterwards it is
  // driven by explicit coordinates.
  const anchorStyle = position
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : undefined

  return (
    <div
      className={cn(
        "fixed z-50",
        !position && "bottom-6 right-6",
        // No transition while dragging, so the bubble tracks the pointer exactly; the
        // easing only applies to the release, which is what makes the snap feel magnetic.
        !isDragging && "transition-[left,top] duration-300 ease-out"
      )}
      style={anchorStyle}
    >
      {chatOpen && (
        <Card
          style={{ maxHeight: panel.maxHeight }}
          className={cn(
            "animate-in flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden shadow-2xl",
            panel.placement === "viewport"
              // Detached from the launcher and pinned to the viewport itself.
              ? cn("fixed top-4 bottom-4", side === "left" ? "left-4" : "right-4")
              : cn(
                  "absolute",
                  // Open away from the edge the launcher is magnetised to, so the panel
                  // never spills off-screen sideways.
                  side === "left" ? "left-0" : "right-0",
                  panel.placement === "above"
                    ? "bottom-[calc(100%+0.75rem)]"
                    : "top-[calc(100%+0.75rem)]"
                )
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Bot className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">{content.aiTitle}</h2>
                <p className="text-[11px] text-muted-foreground">{content.aiSubtitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="-mr-2 shrink-0" onClick={() => setChatOpen(false)} aria-label="Close assistant">
              <X className="size-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6",
                  message.role === "user"
                    ? "ml-auto rounded-tr-sm bg-primary text-primary-foreground"
                    : message.isError
                      ? "rounded-tl-sm border border-destructive/30 bg-destructive/10 text-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                )}
              >
                {renderRichText(message.text)}
              </div>
            ))}
            {isThinking && (
              <div className="w-fit rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-xs text-muted-foreground">
                <span className="animate-pulse">•••</span>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {content.aiSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => askAssistant(suggestion)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
                // Mirrors the server-side cap so the limit is felt before the round trip.
                maxLength={500}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isThinking || !draft.trim()} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      <button
        ref={bubbleRef}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={content.aiTitle}
        aria-expanded={chatOpen}
        className={cn(
          "flex h-12 touch-none select-none items-center rounded-full px-3 shadow-lg transition-[background-color,box-shadow,transform] duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging ? "scale-105 cursor-grabbing shadow-xl" : "cursor-grab"
        )}
      >
        {/* The two glyphs are stacked so one rotates out as the other rotates in. */}
        <span className="relative grid size-6 shrink-0 place-items-center">
          <Bot
            className={cn(
              "absolute size-5 transition-all duration-300",
              chatOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <X
            className={cn(
              "absolute size-5 transition-all duration-300",
              chatOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )}
          />
        </span>
        {/*
          Collapsing max-width animates, where `width: auto` cannot. The label stays
          collapsed below sm so the launcher is icon-only on phones, and the button is a
          perfect circle whenever the label is closed (24px glyph + 12px padding each side).
        */}
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width,opacity,margin] duration-300 ease-out",
            chatOpen ? "ml-0 max-w-0 opacity-0" : "ml-0 max-w-0 opacity-0 sm:ml-2 sm:mr-1 sm:max-w-[10rem] sm:opacity-100"
          )}
        >
          {content.aiTitle}
        </span>
      </button>
    </div>
  )
}
