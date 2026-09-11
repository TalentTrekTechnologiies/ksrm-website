"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Scrolls to the #fragment in the URL once the section it names exists.
 *
 * The browser resolves a fragment the moment the document loads. Most sections
 * here are CMS-driven and render nothing until their fetch lands -
 * GoverningBody returns null until it has members, PageResources until
 * documents arrive - so the element is not there yet. The browser finds
 * nothing, gives up, and the page sits at the top. /about#governing-body
 * therefore behaved exactly like a link to /about.
 *
 * Two things this has to get right, both learned by getting them wrong:
 *
 *  1. Read the hash EVERY time, never capture it. An earlier version read it
 *     once and then re-aligned to that value for eight seconds - so clicking
 *     "Leadership" jumped there and was immediately dragged back to Governing
 *     Body by the previous link's observer still running.
 *  2. React to hashchange, not just to a route change. Clicking an anchor
 *     while already on the page changes only the fragment; the router does not
 *     remount and an effect keyed on pathname alone never fires.
 */
export default function ScrollToHash() {
  const pathname = usePathname()

  useEffect(() => {
    let observer: MutationObserver | null = null
    let settle: ReturnType<typeof setTimeout> | undefined
    let giveUp: ReturnType<typeof setTimeout> | undefined

    /** Whichever fragment the URL names right now - never a remembered one. */
    const currentHash = () => decodeURIComponent(window.location.hash.replace(/^#/, ""))

    /** The fragment this run is chasing; cleared once it lands or is replaced. */
    let target = ""
    let landed = false

    function stop() {
      observer?.disconnect()
      observer = null
      clearTimeout(settle)
      clearTimeout(giveUp)
    }

    function align() {
      // If the URL moved on while we were waiting, this run is stale.
      if (currentHash() !== target) return stop()

      const el = document.getElementById(target)
      if (!el) return

      const top = el.getBoundingClientRect().top
      // Close enough once it has landed. Sections keep arriving above it for a
      // moment and each one shifts it, so it is re-checked rather than
      // scrolled once - but not nudged forever over a few pixels.
      if (landed && Math.abs(top) < 120) return

      el.scrollIntoView({ behavior: landed ? "auto" : "smooth", block: "start" })
      landed = true
    }

    function begin() {
      stop()
      target = currentHash()
      landed = false
      if (!target) return

      // Already resolved by the browser because the section was static. Near
      // the TOP is the test, not merely visible: the first section on a page
      // can sit 582px down and be in view without being scrolled to.
      const existing = document.getElementById(target)
      if (existing && Math.abs(existing.getBoundingClientRect().top) < 150) return

      observer = new MutationObserver(() => {
        // Debounced: a section mounting fires many mutations, and re-scrolling
        // on each fights the smooth scroll already in flight.
        clearTimeout(settle)
        settle = setTimeout(align, 120)
      })
      observer.observe(document.body, { childList: true, subtree: true })

      // A section whose content never arrives must not leave an observer
      // running for the life of the page.
      giveUp = setTimeout(stop, 8000)

      align()
    }

    // Arriving at a link and then being yanked elsewhere a second later is
    // worse than not scrolling, so the reader taking over ends it.
    const surrender = () => stop()
    window.addEventListener("wheel", surrender, { passive: true })
    window.addEventListener("touchmove", surrender, { passive: true })
    window.addEventListener("keydown", surrender)
    window.addEventListener("hashchange", begin)

    begin()

    return () => {
      stop()
      window.removeEventListener("wheel", surrender)
      window.removeEventListener("touchmove", surrender)
      window.removeEventListener("keydown", surrender)
      window.removeEventListener("hashchange", begin)
    }
  }, [pathname])

  return null
}
