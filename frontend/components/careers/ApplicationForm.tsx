"use client"

import { useState } from "react"
import { submitCareerApplication } from "@/lib/career-applications-api"
import { ApiError } from "@/lib/api-client"

interface FormState {
  fullName: string
  email: string
  mobile: string
  address: string
  dateOfBirth: string
  qualification: string
  specialization: string
  yearsOfExperience: string
  currentCompany: string
  currentCtc: string
  expectedCtc: string
  noticePeriod: string
  skills: string
  linkedinUrl: string
  portfolioUrl: string
  coverLetter: string
  additionalNotes: string
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  mobile: "",
  address: "",
  dateOfBirth: "",
  qualification: "",
  specialization: "",
  yearsOfExperience: "",
  currentCompany: "",
  currentCtc: "",
  expectedCtc: "",
  noticePeriod: "",
  skills: "",
  linkedinUrl: "",
  portfolioUrl: "",
  coverLetter: "",
  additionalNotes: "",
}

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_RESUME_SIZE = 10 * 1024 * 1024 // 10 MB - generous for a resume, well under the Media Library's 100MB document ceiling

export default function ApplicationForm({
  careerId,
  jobTitle,
  onClose,
}: {
  careerId?: number
  jobTitle?: string
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [resume, setResume] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setResume(null)
      return
    }
    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, resume: "Only PDF, DOC, or DOCX files are accepted." }))
      setResume(null)
      e.target.value = ""
      return
    }
    if (file.size > MAX_RESUME_SIZE) {
      setErrors((prev) => ({ ...prev, resume: "Resume must be smaller than 10 MB." }))
      setResume(null)
      e.target.value = ""
      return
    }
    setErrors((prev) => ({ ...prev, resume: "" }))
    setResume(file)
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.fullName.trim()) next.fullName = "Full name is required."
    if (!form.email.trim()) next.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email."
    if (!form.mobile.trim()) next.mobile = "Mobile number is required."
    else if (!/^[+]?[\d\s-]{10,15}$/.test(form.mobile)) next.mobile = "Enter a valid mobile number."
    if (!form.qualification.trim()) next.qualification = "Qualification is required."
    if (!resume) next.resume = "Please attach your resume (PDF, DOC, or DOCX)."
    if (form.linkedinUrl && !/^https?:\/\//.test(form.linkedinUrl)) next.linkedinUrl = "Include http:// or https://"
    if (form.portfolioUrl && !/^https?:\/\//.test(form.portfolioUrl)) next.portfolioUrl = "Include http:// or https://"

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !resume) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitCareerApplication({
        careerId,
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        address: form.address || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        qualification: form.qualification,
        specialization: form.specialization || undefined,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        currentCompany: form.currentCompany || undefined,
        currentCtc: form.currentCtc || undefined,
        expectedCtc: form.expectedCtc || undefined,
        noticePeriod: form.noticePeriod || undefined,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
        coverLetter: form.coverLetter || undefined,
        additionalNotes: form.additionalNotes || undefined,
        resume,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again in a moment.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="af-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{`
        .af-overlay { position: fixed; inset: 0; background: rgba(15,20,40,0.6); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 40px 20px; }
        .af-modal { background: #fff; border-radius: 16px; max-width: 720px; width: 100%; padding: 40px; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        @media (max-width: 640px) { .af-modal { padding: 24px 20px; border-radius: 12px; } }
        .af-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: #999; cursor: pointer; line-height: 1; }
        .af-close:hover { color: #2B3490; }
        .af-title { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .af-subtitle { color: #666; font-size: 15px; margin: 0 0 28px; }
        .af-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .af-grid { grid-template-columns: 1fr; } }
        .af-field { margin-bottom: 16px; }
        .af-field label { display: block; font-size: 14px; font-weight: 600; color: #2B3490; margin-bottom: 6px; }
        .af-field input, .af-field textarea { width: 100%; border: 1.5px solid #eef0f3; border-radius: 8px; padding: 10px 12px; font-size: 15px; font-family: inherit; color: #1a1a2e; box-sizing: border-box; }
        .af-field input:focus, .af-field textarea:focus { outline: none; border-color: #2B3490; }
        .af-field .af-error { color: #d32f2f; font-size: 13px; margin-top: 4px; }
        .af-field input.af-invalid, .af-field textarea.af-invalid { border-color: #d32f2f; }
        .af-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #999; margin: 24px 0 12px; }
        .af-section-label:first-child { margin-top: 0; }
        .af-file-input { border: 1.5px dashed #eef0f3; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; }
        .af-file-input.af-invalid { border-color: #d32f2f; }
        .af-submit { width: 100%; background: #D4A500; color: #1a1a2e; padding: 14px; border-radius: 8px; font-weight: 700; font-family: 'Rajdhani', sans-serif; font-size: 17px; border: none; cursor: pointer; margin-top: 8px; }
        .af-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .af-submit-error { background: #fdecea; color: #d32f2f; padding: 12px 16px; border-radius: 8px; font-size: 15px; margin-bottom: 16px; }
        .af-success { text-align: center; padding: 20px 0; }
        .af-success-icon { font-size: 48px; margin-bottom: 16px; }
      `}</style>
      <div className="af-modal">
        <button className="af-close" onClick={onClose} aria-label="Close">×</button>

        {submitted ? (
          <div className="af-success">
            <div className="af-success-icon">✅</div>
            <h2 className="af-title">Application Received</h2>
            <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7 }}>
              Thank you for applying to KSRM College of Engineering{jobTitle ? ` for ${jobTitle}` : ""}. We have
              received your application and our HR team will review it shortly. A confirmation email has been sent
              to your inbox.
            </p>
            <button className="af-submit" style={{ marginTop: 16 }} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="af-title">Apply Now</h2>
            <p className="af-subtitle">{jobTitle ? `Applying for: ${jobTitle}` : "General Application"}</p>

            {submitError && <p className="af-submit-error">{submitError}</p>}

            <div className="af-section-label">Personal Details</div>
            <div className="af-grid">
              <div className="af-field">
                <label>Full Name *</label>
                <input className={errors.fullName ? "af-invalid" : ""} value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} />
                {errors.fullName && <p className="af-error">{errors.fullName}</p>}
              </div>
              <div className="af-field">
                <label>Email *</label>
                <input type="email" className={errors.email ? "af-invalid" : ""} value={form.email} onChange={(e) => setField("email", e.target.value)} />
                {errors.email && <p className="af-error">{errors.email}</p>}
              </div>
              <div className="af-field">
                <label>Mobile Number *</label>
                <input className={errors.mobile ? "af-invalid" : ""} value={form.mobile} onChange={(e) => setField("mobile", e.target.value)} placeholder="+91 98765 43210" />
                {errors.mobile && <p className="af-error">{errors.mobile}</p>}
              </div>
              <div className="af-field">
                <label>Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
              </div>
            </div>
            <div className="af-field">
              <label>Address</label>
              <input value={form.address} onChange={(e) => setField("address", e.target.value)} />
            </div>

            <div className="af-section-label">Qualification & Experience</div>
            <div className="af-grid">
              <div className="af-field">
                <label>Qualification *</label>
                <input className={errors.qualification ? "af-invalid" : ""} value={form.qualification} onChange={(e) => setField("qualification", e.target.value)} placeholder="M.Tech, Ph.D., etc." />
                {errors.qualification && <p className="af-error">{errors.qualification}</p>}
              </div>
              <div className="af-field">
                <label>Specialization</label>
                <input value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} />
              </div>
              <div className="af-field">
                <label>Years of Experience</label>
                <input type="number" min="0" step="0.5" value={form.yearsOfExperience} onChange={(e) => setField("yearsOfExperience", e.target.value)} />
              </div>
              <div className="af-field">
                <label>Current Company</label>
                <input value={form.currentCompany} onChange={(e) => setField("currentCompany", e.target.value)} />
              </div>
              <div className="af-field">
                <label>Current CTC</label>
                <input value={form.currentCtc} onChange={(e) => setField("currentCtc", e.target.value)} placeholder="e.g. 6.5 LPA" />
              </div>
              <div className="af-field">
                <label>Expected CTC</label>
                <input value={form.expectedCtc} onChange={(e) => setField("expectedCtc", e.target.value)} placeholder="e.g. 9 LPA" />
              </div>
              <div className="af-field">
                <label>Notice Period</label>
                <input value={form.noticePeriod} onChange={(e) => setField("noticePeriod", e.target.value)} placeholder="e.g. 30 days" />
              </div>
              <div className="af-field">
                <label>Skills</label>
                <input value={form.skills} onChange={(e) => setField("skills", e.target.value)} placeholder="Comma-separated" />
              </div>
            </div>

            <div className="af-section-label">Links</div>
            <div className="af-grid">
              <div className="af-field">
                <label>LinkedIn</label>
                <input className={errors.linkedinUrl ? "af-invalid" : ""} value={form.linkedinUrl} onChange={(e) => setField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
                {errors.linkedinUrl && <p className="af-error">{errors.linkedinUrl}</p>}
              </div>
              <div className="af-field">
                <label>Portfolio</label>
                <input className={errors.portfolioUrl ? "af-invalid" : ""} value={form.portfolioUrl} onChange={(e) => setField("portfolioUrl", e.target.value)} placeholder="https://..." />
                {errors.portfolioUrl && <p className="af-error">{errors.portfolioUrl}</p>}
              </div>
            </div>

            <div className="af-section-label">Resume *</div>
            <div className="af-field">
              <label htmlFor="af-resume" className={`af-file-input ${errors.resume ? "af-invalid" : ""}`}>
                {resume ? `📄 ${resume.name}` : "Click to upload your resume (PDF, DOC, or DOCX, max 10MB)"}
              </label>
              <input
                id="af-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                style={{ display: "none" }}
              />
              {errors.resume && <p className="af-error">{errors.resume}</p>}
            </div>

            <div className="af-section-label">Additional Information</div>
            <div className="af-field">
              <label>Cover Letter</label>
              <textarea rows={4} value={form.coverLetter} onChange={(e) => setField("coverLetter", e.target.value)} />
            </div>
            <div className="af-field">
              <label>Additional Notes</label>
              <textarea rows={2} value={form.additionalNotes} onChange={(e) => setField("additionalNotes", e.target.value)} />
            </div>

            <button type="submit" className="af-submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
