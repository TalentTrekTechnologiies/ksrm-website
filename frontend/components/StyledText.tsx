"use client"

import { ReactNode } from "react"
import { useContentStyleModule } from "@/lib/content-style-store"
import { styleKey } from "@/lib/content-styles-api"

/**
 * Renders a CMS record's text with whatever size and colour an admin set for
 * that exact field.
 *
 * The counterpart to <CmsText>, for content that lives in an ordinary module
 * rather than in Page Content. Where CmsText owns both the wording and its
 * appearance, this owns only the appearance - the wording is already whatever
 * the module fetched, and is passed in as children.
 *
 * A field nobody has styled renders as a bare text node, exactly as before,
 * producing no extra markup at all. That matters: this is meant to be
 * droppable into existing markup without changing how anything looks until
 * somebody deliberately changes it.
 *
 * Usage:
 *   <h3><StyledText module="news" recordId={n.id} field="title">{n.title}</StyledText></h3>
 */
export default function StyledText({
  module,
  recordId,
  field,
  children,
  /** Keeps the admin's line breaks, for body copy. */
  multiline = false,
}: {
  module: string
  recordId: number
  field: string
  children: ReactNode
  multiline?: boolean
}) {
  const styles = useContentStyleModule(module)
  const entry = styles.get(styleKey(recordId, field))

  const style: React.CSSProperties = {}
  if (entry?.fontSize) style.fontSize = entry.fontSize
  if (entry?.color) style.color = entry.color
  const styled = Object.keys(style).length > 0

  if (multiline) return <span style={{ whiteSpace: "pre-line", ...style }}>{children}</span>
  // Only wrapped in a span when there is something to apply, so an unstyled
  // field keeps inheriting from the page exactly as it did before.
  if (!styled) return <>{children}</>
  return <span style={style}>{children}</span>
}
