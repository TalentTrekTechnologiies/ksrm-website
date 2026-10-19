/**
 * Scrolls to a section so its heading lands just below whatever is pinned at
 * the top - the site menu and, where a page has one, its row of section
 * buttons.
 *
 * Those rows now wrap onto two lines instead of scrolling sideways, so their
 * height depends on the screen width and on how many buttons a page has. A
 * fixed scroll-margin could not know that; this measures both at the moment of
 * the click. A button row that is not pinned (on phones it scrolls away with
 * the page) adds nothing.
 *
 * Usage: mark the button row with data-section-tabs, then
 *   onClick={() => scrollToSection("dvv")}
 */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const menu = document.querySelector<HTMLElement>("[data-site-navbar]")
  const tabs = document.querySelector<HTMLElement>("[data-section-tabs]")
  const pinned = (node: HTMLElement | null) => !!node && getComputedStyle(node).position === "sticky"
  const offset = (pinned(menu) ? menu!.offsetHeight : 0) + (pinned(tabs) ? tabs!.offsetHeight : 0) + 12
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" })
}
