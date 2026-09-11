"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Scrolls to the #fragment in the URL once the section it names actually
 * exists.
 *
 * The browser resolves a fragment the moment the document loads. Most sections
 * on this site are CMS-driven and render nothing until their fetch lands -
 * GoverningBody returns null until it has members, a department's Student
 * Chapter until it has content, PageResources until documents arrive - so the
 * element is simply not there yet. The browser finds nothing, gives up, and
 * the page sits at the top. Opening /about#governing-body therefore looked
 * exactly like a link to /about, which is what was reported.
 *
 * Nothing in the page markup changes; this waits for the element and then
 * scrolls. A MutationObserver rather than a timer, so it fires the instant the
 * section mounts rather than at a guessed delay - and it gives up after a few
 * seconds so it cannot sit watching the DOM forever on a page whose section
 * genuinely has no content.
 *
 * Stops immediately if the reader scrolls themselves: arriving at a link and
 * then being yanked somewhere else a second later is worse than not scrolling
 * at all.
 */
export default function ScrollToHash() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""))
    if (!hash) return

    // Already there: the browser resolved it because the section was static.
    //
    // "Within the viewport" is not the test - the first section on a page can
    // sit 582px down and still be visible, which is not the same as being
    // scrolled to. /examinations#notifications was left mid-page for exactly
    // that reason. Near the TOP is the test.
    const existing = document.getElementById(hash)
    if (existing && Math.abs(existing.getBoundingClientRect().top) < 150) return

    let done = false
    const finish = () => {
      if (done) return
      done = true
      observer.disconnect()
      clearTimeout(giveUp)
      clearTimeout(settle)
      window.removeEventListener("wheel", cancel)
      window.removeEventListener("touchmove", cancel)
      window.removeEventListener("keydown", cancel)
    }

    const cancel = () => finish()

    // Re-aligned, not scrolled once.
    //
    // Scrolling the first time the section appears is not enough: other
    // CMS-driven blocks ABOVE it are still arriving, and each one pushes the
    // target further down. Landing on #leadership and then watching it drift
    // 790px below the viewport is what that looked like. So it keeps
    // correcting while the page is still settling, and stops the moment the
    // reader takes over or the timeout expires.
    let aligned = 0
    const tryScroll = () => {
      const el = document.getElementById(hash)
      if (!el) return
      const top = el.getBoundingClientRect().top
      // Already where it should be - within a header's height of the top.
      if (aligned > 0 && Math.abs(top) < 120) return
      // scrollIntoView rather than a computed offset: the sections already
      // carry scroll-margin-top for the sticky header, and honouring that is
      // what keeps the heading clear of it.
      el.scrollIntoView({ behavior: aligned === 0 ? "smooth" : "auto", block: "start" })
      aligned++
    }

    const observer = new MutationObserver(() => {
      // Debounced: a section mounting fires many mutations, and re-scrolling
      // on each one fights the smooth scroll already in flight.
      clearTimeout(settle)
      settle = setTimeout(tryScroll, 120)
    })
    let settle: ReturnType<typeof setTimeout>
    observer.observe(document.body, { childList: true, subtree: true })

    // A section whose content never arrives should not leave an observer
    // running for the life of the page.
    const giveUp = setTimeout(finish, 8000)

    window.addEventListener("wheel", cancel, { passive: true })
    window.addEventListener("touchmove", cancel, { passive: true })
    window.addEventListener("keydown", cancel)

    tryScroll()
    return finish
  }, [pathname])

  return null
}
