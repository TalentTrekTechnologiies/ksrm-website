"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiError } from "./api-client"
import {
  getSectionAdmin,
  updateSection,
  getCreatorAndUpdater,
  SectionKey,
  SectionStatus,
  HomepageSectionRecord,
  HomepageSectionContentMap,
  AuditActor,
} from "./homepage-api"

/**
 * Shared fetch/save/optimistic-lock-retry/Created-Updated-By logic for
 * every singleton section editor (Vision/Mission/About/Admissions, and
 * Hero) - each editor page owns its own form state (shapes differ per
 * section) but all four+Hero share this exact data lifecycle.
 */
export function useSectionEditor<K extends SectionKey>(key: K) {
  const [section, setSection] = useState<HomepageSectionRecord<K> | null>(null)
  const [creator, setCreator] = useState<AuditActor | null>(null)
  const [updater, setUpdater] = useState<AuditActor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)

  const fetchCreatorUpdater = useCallback(async (targetId: number) => {
    try {
      const result = await getCreatorAndUpdater(`homepage_section_${key}`, targetId)
      setCreator(result.createdBy)
      setUpdater(result.updatedBy)
    } catch {
      // Non-critical - the meta line just shows "-" if this fails.
    }
  }, [key])

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const data = await getSectionAdmin(key)
        if (cancelled) return
        setSection(data)
        fetchCreatorUpdater(data.id)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load section")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [key, fetchCreatorUpdater])

  async function save(content: HomepageSectionContentMap[K], status: SectionStatus) {
    if (!section) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateSection(key, content, status, section.version)
      setSection(updated)
      fetchCreatorUpdater(updated.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError(`${err.message} Reloading the latest version - please re-apply your changes.`)
        try {
          const fresh = await getSectionAdmin(key)
          setSection(fresh)
        } catch {
          // Reload failed too - the error message above still stands.
        }
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to save section")
      }
    } finally {
      setSaving(false)
    }
  }

  return {
    section,
    creator,
    updater,
    loading,
    error,
    saving,
    success,
    save,
    auditOpen,
    openAudit: () => setAuditOpen(true),
    closeAudit: () => setAuditOpen(false),
  }
}
