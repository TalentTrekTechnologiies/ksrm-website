"use client"

import { useState } from "react"
import DepartmentDragListManager from "@/components/admin/departments/DepartmentDragListManager"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import { TextField, TextAreaField, SelectField, ToggleField } from "@/components/admin/cms/CmsForm"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import {
  getContactChannelsAdmin,
  createContactChannel,
  updateContactChannel,
  deleteContactChannel,
  restoreContactChannel,
  reorderContactChannels,
  ContactChannel,
} from "@/lib/contact-channels-api"

/**
 * The Contact page's office directory: real add/edit/delete, not text edits
 * inside a fixed number of boxes.
 *
 * Both blocks on the public page - the Address/Phone/Email row at the top and
 * the Principal/Admissions/Exam/Placement card grid below it - used to be
 * hardcoded arrays. The page-text pass made their wording editable, but the
 * *cards themselves* still could not be added, removed or reassigned: blanking
 * a card's text left an empty box with just an icon, because nothing
 * controlled how many boxes there were. This page controls that.
 *
 * Two independent lists, matching the two visually different blocks on the
 * page. Both are ContactChannel rows with departmentId: null, distinguished
 * only by `group` - see the schema comment on ContactChannel.group.
 */

// -- Info row (Address / Phone / Email) --------------------------------

interface InfoFormState {
  kind: "address" | "phone" | "email"
  title: string
  value: string
  isActive: boolean
}

const emptyInfoForm: InfoFormState = { kind: "phone", title: "", value: "", isActive: true }

function kindOf(item: ContactChannel): InfoFormState["kind"] {
  if (item.address) return "address"
  if (item.emails.length > 0) return "email"
  return "phone"
}

function InfoRowManager() {
  // The public page also needs a kind to pick an icon, but that is derived
  // (address set -> map-pin, emails set -> mail, else phone) rather than
  // stored - one less thing that could disagree with which field is actually
  // filled in.
  return (
    <DepartmentDragListManager<ContactChannel, InfoFormState, number | null>
      title="Info Row"
      description="The Address / Phone / Email cards at the top of the Contact page. One fact per card."
      departmentId={null}
      emptyForm={emptyInfoForm}
      fetchAdmin={(_dep, includeDeleted) => getContactChannelsAdmin(null, includeDeleted, "info")}
      create={createContactChannel}
      update={updateContactChannel}
      del={deleteContactChannel}
      restore={restoreContactChannel}
      reorder={reorderContactChannels}
      addLabel="Add Card"
      mapToForm={(item) => ({
        kind: kindOf(item),
        title: item.name,
        value: item.address ?? item.phones[0] ?? item.emails[0] ?? "",
        isActive: item.isActive,
      })}
      buildCreateDto={(form) => ({
        group: "info" as const,
        name: form.title,
        address: form.kind === "address" ? form.value : undefined,
        phones: form.kind === "phone" ? [form.value] : [],
        emails: form.kind === "email" ? [form.value] : [],
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        name: form.title,
        address: form.kind === "address" ? form.value : null,
        phones: form.kind === "phone" ? [form.value] : [],
        emails: form.kind === "email" ? [form.value] : [],
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.title.trim() && !!form.value.trim()}
      getName={(item) => item.name}
      renderRow={(item) => (
        <div>
          <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
          <p className="truncate text-xs text-slate-500">{item.address ?? item.phones[0] ?? item.emails[0] ?? "—"}</p>
        </div>
      )}
      renderFields={(form, setForm) => (
        <>
          <SelectField
            label="Kind"
            value={form.kind}
            onChange={(v) => setForm({ ...form, kind: v as InfoFormState["kind"] })}
            options={[
              { value: "address", label: "Address" },
              { value: "phone", label: "Phone" },
              { value: "email", label: "Email" },
            ]}
          />
          <TextField label="Label" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required placeholder="Phone · Alternate · Email" />
          {form.kind === "address" ? (
            <TextAreaField label="Address" value={form.value} onChange={(v) => setForm({ ...form, value: v })} rows={2} />
          ) : (
            <TextField
              label={form.kind === "phone" ? "Phone number" : "Email address"}
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
              placeholder={form.kind === "phone" ? "+91 9000073434" : "office@ksrmce.ac.in"}
            />
          )}
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}

// -- Office directory (Principal / Admissions / Exam / Placement) ------

interface OfficeFormState {
  name: string
  phones: string[]
  emails: string[]
  address: string
  mapEmbedUrl: string
  isActive: boolean
}

const emptyOfficeForm: OfficeFormState = { name: "", phones: [], emails: [], address: "", mapEmbedUrl: "", isActive: true }

function OfficeDirectoryManager() {
  return (
    <DepartmentDragListManager<ContactChannel, OfficeFormState, number | null>
      title="Office Directory"
      description="The Principal / Admissions / Examination / Placement cards on the Contact page."
      departmentId={null}
      emptyForm={emptyOfficeForm}
      fetchAdmin={(_dep, includeDeleted) => getContactChannelsAdmin(null, includeDeleted, "directory")}
      create={createContactChannel}
      update={updateContactChannel}
      del={deleteContactChannel}
      restore={restoreContactChannel}
      reorder={reorderContactChannels}
      addLabel="Add Office"
      mapToForm={(item) => ({
        name: item.name,
        phones: item.phones,
        emails: item.emails,
        address: item.address ?? "",
        mapEmbedUrl: item.mapEmbedUrl ?? "",
        isActive: item.isActive,
      })}
      buildCreateDto={(form) => ({
        group: "directory" as const,
        name: form.name,
        phones: form.phones,
        emails: form.emails,
        address: form.address || undefined,
        mapEmbedUrl: form.mapEmbedUrl || undefined,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        name: form.name,
        phones: form.phones,
        emails: form.emails,
        address: form.address || undefined,
        mapEmbedUrl: form.mapEmbedUrl || undefined,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.name.trim()}
      getName={(item) => item.name}
      renderRow={(item) => (
        <div>
          <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
          <p className="truncate text-xs text-slate-500">{[...item.phones, ...item.emails].join(" · ") || "—"}</p>
        </div>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Office name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="Admissions Office" />
          <CmsChipList label="Phone numbers" items={form.phones} onChange={(phones) => setForm({ ...form, phones })} placeholder="Add a phone number..." />
          <CmsChipList label="Emails" items={form.emails} onChange={(emails) => setForm({ ...form, emails })} placeholder="Add an email..." />
          <TextAreaField label="Address (optional)" value={form.address} onChange={(v) => setForm({ ...form, address: v })} rows={2} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}

export default function ContactsManager() {
  const [tab, setTab] = useState<"info" | "directory">("directory")
  const tabClass = (on: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
      on ? "bg-admin-primary text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-admin-bg"
    }`

  return (
    <PermissionGate permission="contact.view">
      <div className="space-y-5">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            Contacts
          </h1>
          <p className="text-sm text-slate-500">
            The office directory shown on the public Contact page. Add, edit, delete and reorder cards here -
            they no longer need to be blanked out by hand.
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" className={tabClass(tab === "directory")} onClick={() => setTab("directory")}>
            Office Directory
          </button>
          <button type="button" className={tabClass(tab === "info")} onClick={() => setTab("info")}>
            Info Row
          </button>
        </div>

        {tab === "directory" ? <OfficeDirectoryManager /> : <InfoRowManager />}
      </div>
    </PermissionGate>
  )
}
