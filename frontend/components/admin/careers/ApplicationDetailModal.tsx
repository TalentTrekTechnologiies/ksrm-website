"use client"

import { useEffect, useState } from "react"
import { X, Download, ExternalLink } from "lucide-react"
import { TextAreaField, PrimaryButton, SecondaryButton, SelectField } from "@/components/admin/cms/CmsForm"
import { CmsApplicationStatusBadge } from "@/components/admin/cms/CmsStatusBadge"
import { ApiError } from "@/lib/api-client"
import { getAdmins, Admin } from "@/lib/admins-api"
import {
  getCareerApplication,
  updateApplicationNotes,
  updateApplicationStatus,
  assignApplicationHr,
  downloadApplicationResume,
  CareerApplicationDetail,
  APPLICATION_STATUSES,
  ApplicationStatus,
} from "@/lib/career-applications-api"

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  )
}

export default function ApplicationDetailModal({
  id,
  onClose,
  onChanged,
}: {
  id: number
  onClose: () => void
  onChanged: () => void
}) {
  const [application, setApplication] = useState<CareerApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [statusDraft, setStatusDraft] = useState<ApplicationStatus>("APPLIED")
  const [statusNote, setStatusNote] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [assigningHr, setAssigningHr] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getCareerApplication(id)
      setApplication(data)
      setNotes(data.notes ?? "")
      setStatusDraft(data.status)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load application")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getAdmins({ status: "active", pageSize: 100 })
      .then((res) => setAdmins(res.items))
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSaveNotes() {
    setSavingNotes(true)
    setError(null)
    try {
      await updateApplicationNotes(id, notes)
      await load()
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save notes")
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleUpdateStatus() {
    setSavingStatus(true)
    setError(null)
    try {
      await updateApplicationStatus(id, statusDraft, statusNote || undefined)
      setStatusNote("")
      await load()
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status")
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleAssignHr(adminId: number) {
    setAssigningHr(true)
    setError(null)
    try {
      await assignApplicationHr(id, adminId)
      await load()
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to assign HR")
    } finally {
      setAssigningHr(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-admin-border bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Application Details</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
          )}

          {loading || !application ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <>
              <div className="rounded-xl border border-admin-border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900">{application.fullName}</h3>
                    <CmsApplicationStatusBadge status={application.status} />
                  </div>
                  <button
                    onClick={() => downloadApplicationResume(application.id, application.fullName)}
                    className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-primary-dark"
                  >
                    <Download className="h-3.5 w-3.5" /> Resume
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email" value={application.email} />
                  <Field label="Mobile" value={application.mobile} />
                  <Field label="Position" value={application.career?.title ?? "General Application"} />
                  <Field label="Source" value={application.source} />
                  <Field label="Address" value={application.address} />
                  <Field label="Date of Birth" value={application.dateOfBirth?.slice(0, 10)} />
                  <Field label="Qualification" value={application.qualification} />
                  <Field label="Specialization" value={application.specialization} />
                  <Field label="Experience" value={application.yearsOfExperience != null ? `${application.yearsOfExperience} years` : null} />
                  <Field label="Current Company" value={application.currentCompany} />
                  <Field label="Current CTC" value={application.currentCtc} />
                  <Field label="Expected CTC" value={application.expectedCtc} />
                  <Field label="Notice Period" value={application.noticePeriod} />
                  <Field label="Skills" value={application.skills.join(", ")} />
                  <Field label="Submitted" value={new Date(application.createdAt).toLocaleString()} />
                </div>
                {(application.linkedinUrl || application.portfolioUrl) && (
                  <div className="mt-3 flex gap-4 border-t border-admin-border pt-3">
                    {application.linkedinUrl && (
                      <a href={application.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
                        LinkedIn <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {application.portfolioUrl && (
                      <a href={application.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
                        Portfolio <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
                {application.coverLetter && (
                  <div className="mt-3 border-t border-admin-border pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cover Letter</p>
                    <p className="text-sm text-slate-700">{application.coverLetter}</p>
                  </div>
                )}
                {application.additionalNotes && (
                  <div className="mt-3 border-t border-admin-border pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Additional Notes (from applicant)</p>
                    <p className="text-sm text-slate-700">{application.additionalNotes}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-admin-border bg-white p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Status</h3>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[200px] flex-1">
                    <SelectField
                      label="Status"
                      value={statusDraft}
                      onChange={(v) => setStatusDraft(v as ApplicationStatus)}
                      options={APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                    />
                  </div>
                  <PrimaryButton onClick={handleUpdateStatus} disabled={savingStatus || statusDraft === application.status}>
                    {savingStatus ? "Updating..." : "Update Status"}
                  </PrimaryButton>
                </div>
                <div className="mt-2">
                  <TextAreaField label="Status note (optional)" value={statusNote} onChange={setStatusNote} rows={2} />
                </div>

                <div className="mt-4 border-t border-admin-border pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Timeline</p>
                  <ul className="space-y-2">
                    {application.statusHistory.map((h) => (
                      <li key={h.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-primary" />
                        <div>
                          <p className="font-semibold text-slate-700">
                            {APPLICATION_STATUSES.find((s) => s.value === h.status)?.label ?? h.status}
                            <span className="ml-2 font-normal text-slate-400">
                              {new Date(h.createdAt).toLocaleString()}
                              {h.changedByAdmin ? ` · ${h.changedByAdmin.name}` : ""}
                            </span>
                          </p>
                          {h.note && <p className="text-slate-500">{h.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-admin-border bg-white p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Assign HR</h3>
                <SelectField
                  label="Assigned to"
                  value={application.assignedHrId ? String(application.assignedHrId) : ""}
                  onChange={(v) => v && handleAssignHr(Number(v))}
                  options={[
                    { value: "", label: "Unassigned" },
                    ...admins.map((a) => ({ value: String(a.id), label: a.name })),
                  ]}
                />
                {assigningHr && <p className="mt-1 text-xs text-slate-400">Saving...</p>}
              </div>

              <div className="rounded-xl border border-admin-border bg-white p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Notes</h3>
                <TextAreaField label="Internal notes" value={notes} onChange={setNotes} rows={4} />
                <div className="mt-3 flex justify-end">
                  <SecondaryButton onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </SecondaryButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
