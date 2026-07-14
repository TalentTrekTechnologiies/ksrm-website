"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

/**
 * The one shared dialog/drawer shell for the admin panel (Premium UI
 * Redesign) - replaces the hand-rolled `fixed inset-0 bg-black/40` markup
 * that was independently duplicated across AdminsManager, AuditLogsManager,
 * ApplicationDetailModal, CmsAuditHistoryDrawer, MediaPicker, and
 * MediaLibraryManager. New dialogs should use this; existing ones migrate
 * over time, not all at once.
 *
 * Two variants: `center` for a standard modal (confirmations, compact
 * forms), `right` for a full-height slide-in drawer (record detail panels,
 * history views) - matches the two shapes already in use across the admin.
 */
export default function CmsDialog({
  open,
  onClose,
  title,
  description,
  variant = "center",
  size = "md",
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  variant?: "center" | "right"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" }

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-[2px] transition-opacity ${
        variant === "right" ? "items-stretch justify-end" : "items-center justify-center p-4"
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        style={{ boxShadow: "var(--shadow-admin-modal)" }}
        className={`flex flex-col bg-white ${
          variant === "right"
            ? "h-full w-full max-w-xl animate-[cms-dialog-slide-in_0.2s_ease-out]"
            : `w-full ${widths[size]} rounded-2xl animate-[cms-dialog-pop-in_0.15s_ease-out]`
        }`}
      >
        <style>{`
          @keyframes cms-dialog-slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes cms-dialog-pop-in { from { transform: scale(0.97) translateY(4px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        `}</style>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-admin-border px-6 py-4">
          <div>
            <h2 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-admin-bg hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-admin-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
