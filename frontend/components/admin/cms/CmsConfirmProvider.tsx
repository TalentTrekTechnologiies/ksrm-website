"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import CmsDialog from "./CmsDialog"
import { PrimaryButton, SecondaryButton, DangerButton } from "./CmsForm"

/**
 * The admin panel's single source of "are you sure?" and "saved." - every
 * mutation in every manager goes through this, so the interaction is identical
 * everywhere instead of each manager inventing its own.
 *
 * Replaces two older habits:
 *   - `window.confirm(...)`, a native browser dialog that looks nothing like
 *     the rest of the admin and can't be styled.
 *   - a small inline "Saved" label that faded after 2.5s, which was easy to
 *     miss entirely.
 *
 * `confirm()` is promise-based so a handler reads top-to-bottom:
 *
 *   if (!(await confirm({ title: "Delete?", message: "...", destructive: true }))) return
 *   await deleteThing(id)
 *   notifySaved("Thing deleted.")
 */
export type ConfirmOptions = {
  title: string
  message: string
  /** Defaults to "Confirm". */
  confirmLabel?: string
  /** Renders the confirm action in red - use for deletes. */
  destructive?: boolean
}

type CmsConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  notifySaved: (message?: string) => void
}

const CmsConfirmContext = createContext<CmsConfirmContextValue | null>(null)

export function useCmsConfirm(): CmsConfirmContextValue {
  const ctx = useContext(CmsConfirmContext)
  if (!ctx) {
    throw new Error("useCmsConfirm must be used inside <CmsConfirmProvider> (mounted in app/admin/layout.tsx)")
  }
  return ctx
}

export default function CmsConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<ConfirmOptions | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const resolverRef = useRef<((ok: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    // If a confirm is somehow already open, decline it rather than orphan its
    // promise - an un-resolved awaiter would hang its handler forever.
    resolverRef.current?.(false)
    setPending(options)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const settle = useCallback((ok: boolean) => {
    resolverRef.current?.(ok)
    resolverRef.current = null
    setPending(null)
  }, [])

  const notifySaved = useCallback((message?: string) => {
    setSavedMessage(message ?? "Your changes have been saved.")
  }, [])

  const value = useMemo(() => ({ confirm, notifySaved }), [confirm, notifySaved])

  return (
    <CmsConfirmContext.Provider value={value}>
      {children}

      {/* Confirm - Escape/backdrop/Cancel all resolve false, so a dismissed
          dialog can never be mistaken for approval. */}
      <CmsDialog
        open={pending !== null}
        onClose={() => settle(false)}
        title={pending?.title ?? ""}
        size="sm"
        footer={
          <>
            <SecondaryButton onClick={() => settle(false)}>Cancel</SecondaryButton>
            {pending?.destructive ? (
              <DangerButton onClick={() => settle(true)}>{pending?.confirmLabel ?? "Delete"}</DangerButton>
            ) : (
              <PrimaryButton onClick={() => settle(true)}>{pending?.confirmLabel ?? "Confirm"}</PrimaryButton>
            )}
          </>
        }
      >
        <p className="text-sm text-slate-600">{pending?.message}</p>
      </CmsDialog>

      {/* Saved */}
      <CmsDialog
        open={savedMessage !== null}
        onClose={() => setSavedMessage(null)}
        title="Saved"
        size="sm"
        footer={<PrimaryButton onClick={() => setSavedMessage(null)}>OK</PrimaryButton>}
      >
        <p className="text-sm text-slate-600">{savedMessage}</p>
      </CmsDialog>
    </CmsConfirmContext.Provider>
  )
}
