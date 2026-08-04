"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import { TextField, TextAreaField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getContactChannelsAdmin,
  createContactChannel,
  updateContactChannel,
  deleteContactChannel,
  restoreContactChannel,
  reorderContactChannels,
  ContactChannel,
} from "@/lib/contact-channels-api"

interface FormState {
  name: string
  phones: string[]
  emails: string[]
  address: string
  mapEmbedUrl: string
  isActive: boolean
}

const emptyForm: FormState = { name: "", phones: [], emails: [], address: "", mapEmbedUrl: "", isActive: true }

export default function ContactTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<ContactChannel, FormState>
      title="Contact Information"
      description="Phone numbers, emails and address shown on this department's Contact section."
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={getContactChannelsAdmin}
      create={createContactChannel}
      update={updateContactChannel}
      del={deleteContactChannel}
      restore={restoreContactChannel}
      reorder={reorderContactChannels}
      mapToForm={(item) => ({
        name: item.name,
        phones: item.phones,
        emails: item.emails,
        address: item.address ?? "",
        mapEmbedUrl: item.mapEmbedUrl ?? "",
        isActive: item.isActive,
      })}
      buildCreateDto={(form, departmentId) => ({
        departmentId,
        name: form.name,
        phones: form.phones,
        emails: form.emails,
        address: form.address || null,
        mapEmbedUrl: form.mapEmbedUrl || null,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        name: form.name,
        phones: form.phones,
        emails: form.emails,
        address: form.address || null,
        mapEmbedUrl: form.mapEmbedUrl || null,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.name}
      getName={(item) => item.name}
      renderRow={(item) => (
        <div>
          <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
          <p className="truncate text-xs text-slate-500">{[...item.phones, ...item.emails].join(" · ")}</p>
        </div>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Channel name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="HOD Office" />
          <CmsChipList label="Phone numbers" items={form.phones} onChange={(phones) => setForm({ ...form, phones })} placeholder="Add a phone number..." />
          <CmsChipList label="Emails" items={form.emails} onChange={(emails) => setForm({ ...form, emails })} placeholder="Add an email..." />
          <TextAreaField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} rows={2} />
          <TextField label="Map embed URL" value={form.mapEmbedUrl} onChange={(v) => setForm({ ...form, mapEmbedUrl: v })} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}
