"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Opening sequence: a blank screen, then the portrait rises from below to the centre,
 * then flies to the exact spot it occupies in the hero — on the right on desktop, under
 * the text on mobile. It reads the real image's box rather than hard-coding a
 * destination, so the layout stays the single source of truth at every breakpoint.
 *
 * Adjust BLANK_MS to lengthen the empty pause before the portrait appears.
 */
const BLANK_MS = 600
const RISE_MS = 900
const HOLD_MS = 420
const TRAVEL_MS = 850
const FADE_MS = 450

const SESSION_KEY = "portfolio-intro-played"

type Phase = "checking" | "blank" | "rise" | "travel" | "fading" | "done"

type Geometry = { left: number; top: number; width: number; height: number; dx: number; dy: number; scale: number }

export function HeroIntro() {
  const [phase, setPhase] = useState<Phase>("checking")
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const timers = useRef<number[]>([])

  const schedule = useCallback((fn: () => void, delay: number) => {
    timers.current.push(window.setTimeout(fn, delay))
  }, [])

  const measure = useCallback((): Geometry | null => {
    const target = document.querySelector<HTMLImageElement>("[data-hero-portrait]")
    if (!target) return null
    const rect = target.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    // Distance from the portrait's resting place to the middle of the screen, plus how
    // much bigger it should be while it sits there.
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2)
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2)
    const scale = Math.min(1.7, Math.max(1, (window.innerHeight * 0.62) / rect.height))

    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, dx, dy, scale }
  }, [])

  /**
   * The decision needs sessionStorage and matchMedia, neither of which exists on the
   * server, so it cannot move into a lazy initial state without a hydration mismatch:
   * both sides must first render the cover, then the client resolves it before paint.
   */
  useLayoutEffect(() => {
    const alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY) === "1"
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (alreadyPlayed || reducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only decision, see above
      setPhase("done")
      return
    }
    window.sessionStorage.setItem(SESSION_KEY, "1")
    setPhase("blank")
  }, [])

  useEffect(() => {
    if (phase !== "blank") return

    // The hero image must be laid out before its destination can be read.
    let frames = 0
    const waitForTarget = () => {
      const next = measure()
      if (next) {
        setGeometry(next)
        schedule(() => setPhase("rise"), BLANK_MS)
        schedule(() => setPhase("travel"), BLANK_MS + RISE_MS + HOLD_MS)
        schedule(() => setPhase("fading"), BLANK_MS + RISE_MS + HOLD_MS + TRAVEL_MS)
        schedule(() => setPhase("done"), BLANK_MS + RISE_MS + HOLD_MS + TRAVEL_MS + FADE_MS)
        return
      }
      // Give up rather than hold the page hostage if the hero never appears.
      if (frames++ > 120) {
        setPhase("done")
        return
      }
      requestAnimationFrame(waitForTarget)
    }
    requestAnimationFrame(waitForTarget)
  }, [phase, measure, schedule])

  // Keep the page still while the sequence plays.
  useEffect(() => {
    if (phase === "checking" || phase === "done") return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = previous
    }
  }, [phase])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  if (phase === "checking" || phase === "done" || !geometry) {
    // "checking" still paints the cover, otherwise the page would flash before the
    // sequence starts; only "done" lets the page through.
    return phase === "done" ? null : (
      <div className="fixed inset-0 z-[100] bg-background" aria-hidden="true" />
    )
  }

  const centred = `translate(${geometry.dx}px, ${geometry.dy}px) scale(${geometry.scale})`
  const transform =
    phase === "blank"
      ? `translate(${geometry.dx}px, ${geometry.dy + window.innerHeight * 0.45}px) scale(${geometry.scale})`
      : phase === "rise"
        ? centred
        : "none"

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] bg-background transition-opacity",
        phase === "fading" ? "opacity-0" : "opacity-100"
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden="true"
    >
      {/*
        Positioned on the destination from the start; the transform is what holds it
        away, so the last step is simply removing that transform.
      */}
      {/*
        A raw img on purpose: next/image adds a wrapper and sizing rules that fight the
        transform, and this exact file is already preloaded by the hero (priority), so it
        comes straight from cache — no extra request, no LCP cost.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element -- see comment above */}
      <img
        src="/assets/images/hero-portrait.png"
        alt=""
        className="absolute object-contain"
        style={{
          left: geometry.left,
          top: geometry.top,
          width: geometry.width,
          height: geometry.height,
          transform,
          opacity: phase === "blank" ? 0 : 1,
          transitionProperty: "transform, opacity",
          transitionDuration: `${phase === "travel" ? TRAVEL_MS : RISE_MS}ms`,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  )
}
