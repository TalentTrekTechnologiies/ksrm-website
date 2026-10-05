"use client"

import { useState } from "react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import DownloadsManager from "@/components/admin/DownloadsManager"
import NbaBranchesTab from "@/components/admin/nba/NbaBranchesTab"
import PageTableEditor from "@/components/admin/PageTableEditor"

/**
 * Everything the public NBA page renders, on one screen.
 *
 * The page pulls from two places, and before this they were managed from two
 * unrelated corners of the admin: the accredited branches came from programme
 * rows edited under Academics, and the documents from the general Documents
 * browser with the right page section chosen out of a forty-item dropdown. So
 * "put this year's NBA material up" meant knowing both, and getting either
 * wrong failed quietly - a document filed under the wrong section is uploaded
 * successfully and simply never appears.
 *
 * Neither tab owns its records. Branches are shared programme rows and
 * documents are ordinary downloads; this screen is a view onto them filtered
 * to what the NBA page shows, so nothing here is a second source of truth.
 */

const TABS: { key: string; label: string; permission: string }[] = [
  { key: "branches", label: "Accredited Branches", permission: "department_programmes.view" },
  { key: "certificates", label: "Accredited Certificates", permission: "downloads.view" },
  { key: "documents", label: "Documents", permission: "downloads.view" },
  { key: "sections", label: "More Sections", permission: "downloads.view" },
]

export default function NbaWorkspace() {
  const [tab, setTab] = useState("branches")

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">NBA</h1>
        <p className="text-sm text-slate-500">
          Accredited branches, certificates and documents for the public{" "}
          <span className="font-mono text-xs">/nba</span> page.
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

      <PermissionGate
        permission={TABS.find((t) => t.key === tab)?.permission ?? "downloads.view"}
      >
        {tab === "branches" && <NbaBranchesTab />}
        {/* Certificates are the opposite of the documents tab: published
            openly, to be seen and downloaded. Their own section, outside the
            protected `nba` one, so the viewer never touches them. */}
        {tab === "certificates" && (
          <div className="space-y-3">
            <p className="rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-sm text-slate-600">
              PDFs uploaded here appear on the public NBA page under <strong>Accredited Certificates</strong>,
              above the accredited programmes. Anyone can open and download them -{" "}
              <strong>no protection</strong>. For documents that must stay view-only, use the
              Documents tab.
            </p>
            <DownloadsManager lockedSection="nba-certificates" />
          </div>
        )}
        {/* Locked to the `nba` section: uploads here are pre-filed, and the
            page-section dropdown is hidden. Whether a document is protected
            depends on that section, so it is not left to be chosen. */}
        {tab === "documents" && <DownloadsManager lockedSection="nba" />}
        {/* Whatever the committee asks for under the documents - members, a
            committee, an address. Free-form tables, each with a heading and an
            optional note, shown in order below the documents on /nba. */}
        {tab === "sections" && (
          <div className="space-y-3">
            <p className="rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-sm text-slate-600">
              Blocks shown on the public NBA page <strong>below the documents</strong>. Add one
              per heading - e.g. <em>NBA Coordinators</em> (Name, Designation, Contact),{" "}
              <em>Programme Committee</em> (Name, Role), or <em>Address</em> (Field, Details).
              Use the note box for a line of text under a block. The eye icon hides a block
              without deleting it.
            </p>
            <PageTableEditor pageSection="nba" />
          </div>
        )}
      </PermissionGate>
    </div>
  )
}
