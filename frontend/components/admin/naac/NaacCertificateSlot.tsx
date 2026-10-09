"use client"

import { useEffect, useState } from "react"
import { Award, ExternalLink, Loader2 } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import { FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { ApiError } from "@/lib/api-client"
import { resolveFileUrl } from "@/lib/api-base"
import { createDownload, getDownloadsAdmin, updateDownload, Download } from "@/lib/downloads-api"
import {
  getNaacCertificate,
  NaacCertificate,
  NAAC_CERTIFICATE_SECTION,
  NAAC_CERTIFICATE_TITLE,
} from "@/lib/naac-certificate"

/**
 * The one certificate the A+ badge on /naac opens, and nothing else.
 *
 * Deliberately a single action - Replace - with no title, category, page or
 * "add another": the badge needs one file, and every extra field was a way to
 * break it (a title it no longer matched, a second certificate to choose
 * between). The server enforces the one-file rule on its own as well.
 *
 * Usage: <NaacCertificateSlot /> - rendered by Page Content when NAAC is open.
 */
export default function NaacCertificateSlot() {
  const { notifySaved } = useCmsConfirm()
  const [shown, setShown] = useState<NaacCertificate | null>(null)
  const [slotRow, setSlotRow] = useState<Download | null>(null)
  const [loading, setLoading] = useState(true)
  const [replacing, setReplacing] = useState(false)
  const [file, setFile] = useState<{ url: string; mediaId: number | null }>({ url: "", mediaId: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrent = () => Promise.all([getNaacCertificate(), getDownloadsAdmin(false)])

  function apply([current, all]: Awaited<ReturnType<typeof fetchCurrent>>) {
    setShown(current)
    setSlotRow(all.find((d) => d.pageSection === NAAC_CERTIFICATE_SECTION) ?? null)
    setLoading(false)
  }

  useEffect(() => {
    let alive = true
    fetchCurrent()
      .then((r) => alive && apply(r))
      .catch(() => {
        if (!alive) return
        setError("Could not load the certificate.")
        setLoading(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on open
  }, [])

  async function save() {
    if (!file.url) return
    setSaving(true)
    setError(null)
    try {
      if (slotRow) {
        await updateDownload(slotRow.id, {
          version: slotRow.version,
          fileUrl: file.url,
          mediaId: file.mediaId,
          isActive: true,
        })
      } else {
        await createDownload({
          title: NAAC_CERTIFICATE_TITLE,
          category: "OTHER",
          pageSection: NAAC_CERTIFICATE_SECTION,
          fileUrl: file.url,
          mediaId: file.mediaId,
          isActive: true,
        })
      }
      setReplacing(false)
      setFile({ url: "", mediaId: null })
      notifySaved("Certificate replaced.")
      apply(await fetchCurrent())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the certificate.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        <Award className="h-4 w-4" /> NAAC Certificate
      </h3>
      <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
        <p className="text-sm text-slate-600">
          Opens when visitors click the <strong>A+</strong> badge on the NAAC page. There is one
          certificate; uploading a new file replaces it.
        </p>

        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-admin-primary" />
        ) : shown ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-admin-border bg-admin-bg px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">{shown.doc.title}</span>
            <a
              href={resolveFileUrl(shown.doc.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-admin-primary hover:underline"
            >
              View <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-admin-border px-4 py-3 text-sm text-slate-500">
            No certificate yet. The badge is not clickable until one is uploaded.
          </p>
        )}

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

        {replacing ? (
          <div className="space-y-4">
            <MediaField
              label="Certificate (PDF)"
              url={file.url}
              mediaId={file.mediaId}
              onChange={(url, mediaId) => setFile({ url, mediaId })}
              accept={["DOCUMENT"]}
              required
            />
            <FormActions>
              <SecondaryButton onClick={() => { setReplacing(false); setFile({ url: "", mediaId: null }) }}>Cancel</SecondaryButton>
              <PrimaryButton onClick={save} disabled={saving || !file.url}>{saving ? "Saving…" : "Save"}</PrimaryButton>
            </FormActions>
          </div>
        ) : (
          !loading && (
            <PrimaryButton onClick={() => setReplacing(true)}>
              {shown ? "Replace certificate" : "Upload certificate"}
            </PrimaryButton>
          )
        )}
      </div>
    </section>
  )
}
