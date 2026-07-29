"use client"

import { FileText } from "lucide-react"

export const PUBLIC_DOCUMENT_LIST_STYLES = `
  .public-doc-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .public-doc-row { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; text-decoration: none; transition: all 0.2s ease; }
  .public-doc-row:hover { border-color: #D4A500; box-shadow: 0 8px 20px rgba(43,52,144,0.08); }
  .public-doc-icon { width: 40px; height: 40px; border-radius: 6px; background: #eef1ff; color: #2B3490; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .public-doc-title { display: block; font-size: 15px; font-weight: 600; color: #2B3490; line-height: 1.4; }
  .public-doc-desc { display: block; font-size: 13px; color: #999; margin-top: 2px; }
  .public-doc-meta { display: block; font-size: 12px; color: #999; margin-top: 2px; }
  .public-doc-pill { margin-left: auto; flex-shrink: 0; color: #fff; background: #2B3490; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 700; white-space: nowrap; }
  @media (max-width: 640px) {
    .public-doc-row { align-items: flex-start; padding: 14px 16px; }
    .public-doc-pill { display: none; }
  }
`

export interface PublicDocumentItem {
  id: string | number
  title: string
  description?: string | null
  meta?: string | null
  href?: string | null
  actionLabel?: string
}

export function PublicDocumentRow({ item }: { item: PublicDocumentItem }) {
  const content = (
    <>
      <span className="public-doc-icon"><FileText size={19} /></span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="public-doc-title">{item.title}</span>
        {item.description && <span className="public-doc-desc">{item.description}</span>}
        {item.meta && <span className="public-doc-meta">{item.meta}</span>}
      </span>
      {item.href && <span className="public-doc-pill">{item.actionLabel || "Download"} -&gt;</span>}
    </>
  )

  return item.href ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className="public-doc-row">
      {content}
    </a>
  ) : (
    <div className="public-doc-row">{content}</div>
  )
}

export default function PublicDocumentList({ items }: { items: PublicDocumentItem[] }) {
  return (
    <>
      <style>{PUBLIC_DOCUMENT_LIST_STYLES}</style>
      <div className="public-doc-list">
        {items.map((item) => (
          <PublicDocumentRow key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}
