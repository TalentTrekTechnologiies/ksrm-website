"use client"

import { ReactNode, useId } from "react"
import type { LucideIcon } from "lucide-react"

function HelperRow({
  helperText,
  error,
  count,
  maxLength,
}: {
  helperText?: string
  error?: string
  count?: number
  maxLength?: number
}) {
  if (!error && !helperText && maxLength === undefined) return null
  return (
    <div className="mt-1 flex items-start justify-between gap-2">
      <p className={`text-xs ${error ? "text-red-600" : "text-slate-400"}`}>{error || helperText}</p>
      {maxLength !== undefined && (
        <span className={`shrink-0 text-xs tabular-nums ${(count ?? 0) > maxLength ? "text-red-500" : "text-slate-300"}`}>
          {count ?? 0}/{maxLength}
        </span>
      )}
    </div>
  )
}

const floatingInputClass =
  "peer w-full rounded-xl border bg-white px-3.5 pb-2 pt-4 text-[15px] text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/20 disabled:cursor-not-allowed disabled:bg-admin-bg disabled:text-slate-400"

function floatingBorderClass(error?: string) {
  return error ? "border-red-300 focus:border-red-500" : "border-admin-border focus:border-admin-primary"
}

const floatingLabelClass =
  "pointer-events-none absolute left-3.5 top-3.5 origin-[0] -translate-y-3 scale-75 transform text-xs font-medium text-slate-500 transition-all duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-xs peer-focus:text-admin-primary"

function RequiredMark({ required }: { required?: boolean }) {
  return required ? <span className="text-red-500"> *</span> : null
}

export function TextField({
  label,
  value,
  onChange,
  required,
  error,
  placeholder,
  maxLength,
  icon: Icon,
  helperText,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  placeholder?: string
  maxLength?: number
  icon?: LucideIcon
  helperText?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          maxLength={maxLength}
          disabled={disabled}
          className={`${floatingInputClass} ${floatingBorderClass(error)} ${Icon ? "pl-10" : ""}`}
        />
        <label htmlFor={id} className={`${floatingLabelClass} ${Icon ? "left-10" : ""}`}>
          {label}
          <RequiredMark required={required} />
        </label>
      </div>
      <HelperRow helperText={helperText} error={error} count={value.length} maxLength={maxLength} />
      {!error && !helperText && maxLength === undefined && placeholder && (
        <p className="mt-1 text-xs text-slate-400">{placeholder}</p>
      )}
    </div>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  required,
  error,
  rows = 3,
  maxLength,
  helperText,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  rows?: number
  maxLength?: number
  helperText?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`${floatingInputClass} ${floatingBorderClass(error)} resize-y`}
        />
        <label htmlFor={id} className={floatingLabelClass}>
          {label}
          <RequiredMark required={required} />
        </label>
      </div>
      <HelperRow helperText={helperText} error={error} count={value.length} maxLength={maxLength} />
    </div>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
  disabled,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
  error?: string
  helperText?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          placeholder=" "
          disabled={disabled}
          className={`${floatingInputClass} ${floatingBorderClass(error)}`}
        />
        <label htmlFor={id} className={floatingLabelClass}>
          {label}
          <RequiredMark required={required} />
        </label>
      </div>
      <HelperRow helperText={helperText} error={error} />
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  error,
  helperText,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  error?: string
  helperText?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        <RequiredMark required={required} />
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/20 ${floatingBorderClass(error)}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <HelperRow helperText={helperText} error={error} />
    </div>
  )
}

/** A real switch, not a checkbox - matches the Site Settings "Homepage
 * Sections" toggle pattern this was extracted from, now the one shared
 * implementation every boolean field in the admin should use. */
export function ToggleField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 text-[15px] font-medium text-slate-700 ${disabled ? "opacity-50" : "cursor-pointer"}`}
    >
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
          checked ? "bg-admin-primary" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  )
}

export function ImageUrlField({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  helperText?: string
}) {
  const id = useId()
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder=" "
            className={`${floatingInputClass} ${floatingBorderClass(error)}`}
          />
          <label htmlFor={id} className={floatingLabelClass}>
            {label}
            <RequiredMark required={required} />
          </label>
        </div>
        {value && (
          // Admin-entered arbitrary URL (relative path or any external host,
          // not known ahead of time), so next/image's static domain
          // allowlist doesn't fit this preview.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg border border-admin-border object-cover"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden"
            }}
          />
        )}
      </div>
      <HelperRow helperText={helperText ?? "Path or URL to an image, e.g. /posters/admissions.svg"} error={error} />
    </div>
  )
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-end gap-3 border-t border-admin-border pt-4">{children}</div>
}

interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: ReactNode
  type?: "button" | "submit"
}

export function PrimaryButton({ onClick, disabled, loading, children, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-xl bg-admin-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-admin-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ onClick, disabled, children }: Omit<ButtonProps, "type" | "loading">) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-admin-border bg-white px-4 py-2.5 text-[15px] font-semibold text-slate-700 transition-all hover:bg-admin-bg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    >
      {children}
    </button>
  )
}

export function DangerButton({ onClick, disabled, children }: Omit<ButtonProps, "type" | "loading">) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-[15px] font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    >
      {children}
    </button>
  )
}

/** The "Publish" action - gold accent, matching the requested Primary/Secondary/Danger/Publish color convention. */
export function PublishButton({ onClick, disabled, loading, children, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-xl px-4 py-2.5 text-[15px] font-semibold text-slate-900 shadow-sm transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      style={{ background: "var(--color-admin-gold)" }}
    >
      {children}
    </button>
  )
}
