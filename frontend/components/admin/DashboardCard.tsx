export default function DashboardCard({
  label,
  count,
  available,
}: {
  label: string
  count: number
  available: boolean
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-navy)" }}
        className="mt-1 text-3xl font-bold"
      >
        {count.toLocaleString()}
      </p>
      {!available && (
        <p className="mt-1 text-xs text-amber-600">
          Not available in this database yet
        </p>
      )}
    </div>
  )
}
