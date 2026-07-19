"use client"

import Link from "next/link"
import { Film, BarChart3, LayoutGrid, ArrowRight, Sparkles, Flag, Landmark, GraduationCap } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"

const MODULES = [
  {
    href: "/admin/homepage/hero",
    icon: Film,
    title: "Hero Banner",
    description: "Full-screen video hero, rotating captions, news ticker, and CTA buttons.",
  },
  {
    href: "/admin/homepage/statistics",
    icon: BarChart3,
    title: "Statistics",
    description: "The stat cards on the homepage and the placements section.",
  },
  {
    href: "/admin/homepage/quick-links",
    icon: LayoutGrid,
    title: "Quick Links",
    description: "The Digital Campus Services grid (Admissions, Exams, Placements, etc.).",
  },
  {
    href: "/admin/homepage/sections/vision",
    icon: Sparkles,
    title: "Vision",
    description: "The Vision statement in the Vision & Mission section.",
  },
  {
    href: "/admin/homepage/sections/mission",
    icon: Flag,
    title: "Mission",
    description: "The Mission points (M1, M2, M3, ...) in the Vision & Mission section.",
  },
  {
    href: "/admin/homepage/sections/about",
    icon: Landmark,
    title: "About",
    description: "The Our Legacy section - story, highlights, statistics, image, and CTA.",
  },
  {
    href: "/admin/homepage/sections/admissions",
    icon: GraduationCap,
    title: "Admissions",
    description: "The Admissions banner, helpline, and B.Tech/Diploma program cards.",
  },
]

export default function HomepageLanding() {
  return (
    <PermissionGate permission="homepage.view">
      <div className="space-y-6">
        <div>
          <h1
            style={{ fontFamily: "var(--font-admin-heading)" }}
            className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent"
          >
            Homepage
          </h1>
          <p className="text-sm text-slate-500">
            Manage the content shown on the public homepage. Sprint 1A + 1B cover Hero, Statistics,
            Quick Links, Vision, Mission, About, and Admissions - more sections are on the way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              style={{ boxShadow: "var(--shadow-admin-card)" }}
              className="group flex flex-col rounded-2xl border border-admin-border bg-white p-5 transition-shadow hover:shadow-[var(--shadow-admin-card-hover)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-primary/10 text-admin-primary transition-colors group-hover:bg-admin-primary group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p
                style={{ fontFamily: "var(--font-admin-heading)" }}
                className="mt-3 text-base font-bold text-slate-900"
              >
                {title}
              </p>
              <p className="mt-1 flex-1 text-sm text-slate-500">{description}</p>
              <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-admin-primary">
                Manage <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </PermissionGate>
  )
}
