"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsLoadingState from "@/components/admin/cms/CmsLoadingState"
import { ApiError } from "@/lib/api-client"
import { getDepartmentAdmin, Department } from "@/lib/departments-api"
import ProfileTab from "./ProfileTab"
import FacultyTab from "./FacultyTab"
import ProgrammesTab from "./ProgrammesTab"
import LabsTab from "./LabsTab"
import LearningOutcomesTab from "./LearningOutcomesTab"
import HighlightsTab from "./HighlightsTab"
import ResearchTab from "./ResearchTab"
import GalleryTab from "./GalleryTab"
import VideosTab from "./VideosTab"
import DownloadsTab from "./DownloadsTab"
import StudentChapterTab from "./StudentChapterTab"
import EventsTab from "./EventsTab"
import BoardOfStudiesTab from "./BoardOfStudiesTab"
import ContactTab from "./ContactTab"
import StatisticsTab from "./StatisticsTab"
import DisplaySettingsTab from "./DisplaySettingsTab"

const TABS: { key: string; label: string; permission: string }[] = [
  { key: "profile", label: "Overview", permission: "departments.view" },
  { key: "faculty", label: "Faculty & HOD", permission: "faculty.view" },
  { key: "programmes", label: "Programmes", permission: "department_programmes.view" },
  { key: "labs", label: "Laboratories", permission: "labs.view" },
  { key: "outcomes", label: "PEO / PO / PSO", permission: "learning_outcomes.view" },
  { key: "highlights", label: "Highlights & Achievements", permission: "department_highlights.view" },
  { key: "research", label: "Research", permission: "research.view" },
  { key: "gallery", label: "Gallery", permission: "gallery.view" },
  { key: "events", label: "Events", permission: "events.view" },
  { key: "videos", label: "Videos", permission: "homepage.view" },
  { key: "downloads", label: "Documents", permission: "downloads.view" },
  // Student Chapter and BoS both gate on downloads.view - their own content
  // (committee members, events, gallery) is edited on the screens that
  // already own those, linked from the tab rather than duplicated here.
  { key: "student-chapter", label: "Student Chapter", permission: "downloads.view" },
  { key: "board-of-studies", label: "Board of Studies", permission: "downloads.view" },
  { key: "contact", label: "Contact Information", permission: "contact.view" },
  { key: "statistics", label: "Statistics", permission: "homepage.view" },
  { key: "display-settings", label: "Display Settings", permission: "department_display_settings.view" },
]

function DepartmentWorkspaceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idParam = searchParams.get("id")
  const tab = searchParams.get("tab") ?? "profile"
  const id = idParam ? parseInt(idParam) : NaN

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)

  const load = useCallback(async () => {
    if (Number.isNaN(id)) {
      setError("No department id given.")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setDepartment(await getDepartmentAdmin(id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load department")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  function setTab(key: string) {
    router.push(`/admin/departments/workspace?id=${id}&tab=${key}`)
  }

  if (loading) {
    return <CmsLoadingState label="Loading department..." />
  }

  if (error || !department) {
    return (
      <div className="space-y-4">
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error ?? "Department not found"}
        </p>
        <a href="/admin/departments" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-admin-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Departments
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <a href="/admin/departments" className="mb-2 flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-admin-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Departments
        </a>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          {department.name}
        </h1>
        <p className="text-sm text-slate-500">
          /{department.slug} · {department.isActive ? "Active" : "Inactive"}
          {department.deletedAt && <span className="ml-2 font-semibold text-red-600">Deleted</span>}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-admin-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <PermissionGate permission={TABS.find((t) => t.key === tab)?.permission ?? "departments.view"}>
        {tab === "profile" && <ProfileTab department={department} onSaved={setDepartment} />}
        {tab === "faculty" && <FacultyTab departmentId={department.id} departmentName={department.name} />}
        {tab === "programmes" && <ProgrammesTab departmentId={department.id} />}
        {tab === "labs" && <LabsTab departmentId={department.id} />}
        {tab === "outcomes" && <LearningOutcomesTab departmentId={department.id} />}
        {tab === "highlights" && <HighlightsTab departmentId={department.id} />}
        {tab === "research" && <ResearchTab departmentId={department.id} />}
        {tab === "gallery" && <GalleryTab departmentId={department.id} />}
        {tab === "videos" && <VideosTab departmentId={department.id} />}
        {tab === "downloads" && <DownloadsTab departmentId={department.id} />}
        {tab === "events" && <EventsTab departmentId={department.id} />}
        {tab === "student-chapter" && <StudentChapterTab department={department} onSaved={setDepartment} />}
        {tab === "board-of-studies" && <BoardOfStudiesTab departmentId={department.id} />}
        {tab === "contact" && <ContactTab departmentId={department.id} />}
        {tab === "statistics" && <StatisticsTab departmentId={department.id} />}
        {tab === "display-settings" && <DisplaySettingsTab departmentId={department.id} />}
      </PermissionGate>
    </div>
  )
}

export default function DepartmentWorkspace() {
  return (
    <PermissionGate permission="departments.view">
      <DepartmentWorkspaceInner />
    </PermissionGate>
  )
}
