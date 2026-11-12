"use client"

import CmsText, { usePageTextValue } from "@/components/CmsText"

/**
 * A phone or email link whose target is the same page text it displays.
 *
 * The Library's contact card showed the number from Page Content but dialled
 * one written into the code - after the number was changed in the CMS, the
 * page read 9515485695 and called 9441373732.
 */
export default function CmsContactLink({
  section,
  slot,
  kind,
  style,
}: {
  section: string
  slot: string
  kind: "tel" | "mailto"
  style?: React.CSSProperties
}) {
  const value = usePageTextValue(section, slot).trim()
  // A phone slot may hold more than one number ("95154 85695 / 08562 ...");
  // the link dials the first.
  const target =
    kind === "tel" ? (value.match(/\+?\d[\d\s-]{5,}\d/)?.[0] ?? value).replace(/[^\d+]/g, "") : value.split(/[\s,;/]+/)[0]
  if (!target) return <CmsText section={section} slot={slot} />
  return (
    <a href={`${kind}:${target}`} style={style}>
      <CmsText section={section} slot={slot} />
    </a>
  )
}
