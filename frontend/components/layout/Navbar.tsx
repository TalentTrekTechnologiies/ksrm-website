'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About KSRMCE', href: '/about' },
      { label: 'Correspondent', href: '/about/correspondent' },
      { label: 'Managing Director', href: '/about/managing-director' },
      { label: 'Chairman', href: '/about/chairman' },
      { label: 'Principal', href: '/about/principal' },
      { label: 'Joint Board of Studies', href: '/about/joint-board-of-studies' },
      { label: 'Strategic Plan', href: '/about/strategic-plan' },
      { label: 'Magazines', href: '/about/magazines' },
    ]
  },
  {
    label: 'Academics',
    href: '/academics',
    children: [
      { label: 'Courses & Intake', href: '/academics/courses-intake' },
      { label: 'Fee Structure', href: '/academics/fee-structure' },
      { label: 'Academic Calendar', href: '/academics/academic-calendar' },
      { label: 'Syllabus', href: '/academics/syllabus' },
      { label: 'Regulations', href: '/academics/regulations' },
      { label: 'Faculty', href: '/academics/faculty' },
    ]
  },
  {
    label: 'Departments',
    href: '/departments',
    children: [
      { label: 'Civil Engineering', href: '/departments/civil' },
      { label: 'Computer Science & Engineering', href: '/departments/cse' },
      { label: 'Electrical & Electronics Engineering', href: '/departments/eee' },
      { label: 'Electronics & Communication Engineering', href: '/departments/ece' },
      { label: 'Mechanical Engineering', href: '/departments/mechanical' },
      { label: 'Humanities & Sciences', href: '/departments/hs' },
      { label: 'Management Studies', href: '/departments/mba' },
    ]
  },
  { label: 'Admissions', href: '/academics/admissions' },
  {
    label: 'Placements',
    href: '/placements',
    children: [
      { label: 'About T&P Cell', href: '/placements' },
      { label: 'Placement Record', href: '/placements#record' },
      { label: 'Placement Training', href: '/placements#training' },
      { label: 'Placement Partners', href: '/placements#partners' },
    ]
  },
  { label: 'Research', href: '/research' },
  {
    label: 'Campus Life',
    href: '/campus-life',
    children: [
      { label: 'Campus Facilities', href: '/campus-life/campus-facilities' },
      { label: 'Library', href: '/campus-life/library' },
      { label: 'Hostels', href: '/campus-life/hostels' },
      { label: 'Transport', href: '/campus-life/transport' },
      { label: 'Sports', href: '/campus-life/sports' },
      { label: 'NSS', href: '/campus-life/nss' },
      { label: 'EDC', href: '/campus-life/edc' },
      { label: 'Startup Cell', href: '/campus-life/startup-cell' },
      { label: 'Anti-Ragging', href: '/campus-life/anti-ragging' },
      { label: 'Grievance Redressal', href: '/campus-life/grievance' },
      { label: 'Cultural Club', href: '/campus-life/cultural' },
    ]
  },
  { label: 'Library', href: '/campus-life/library' },
  { label: 'News & Events', href: '/news' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Accreditation', href: '/accreditation' },
  { label: 'IQAC', href: '/iqac' },
  { label: 'Alumni', href: '/alumni' },
  { label: 'Careers', href: '/careers' },
  { label: 'Results', href: '/examinations' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openMobile, setOpenMobile] = useState<string | null>(null)

  return (
    <nav className="bg-[#2B3490] sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Desktop */}
        <div className="hidden lg:flex items-center overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative group flex-shrink-0"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-1 px-3 py-4 text-sm font-medium whitespace-nowrap transition-colors
                  ${pathname === item.href
                    ? 'text-[#FFE619] border-b-2 border-[#FFE619]'
                    : 'text-white hover:text-[#FFE619]'
                  }`}
              >
                {item.label}
                {item.children && <ChevronDown size={12} />}
              </Link>

              {/* Dropdown */}
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg min-w-[240px] z-50 border-t-2 border-[#FFE619]">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2B3490] hover:text-white transition-colors border-b border-gray-100 last:border-0"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center justify-between py-3">
          <span className="text-white font-semibold">Menu</span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className="flex-1 py-2.5 px-2 text-white text-sm hover:text-[#FFE619]"
                    onClick={() => !item.children && setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => setOpenMobile(openMobile === item.label ? null : item.label)}
                      className="px-3 py-2 text-white"
                    >
                      {openMobile === item.label ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                {item.children && openMobile === item.label && (
                  <div className="bg-[#1a2470] ml-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block py-2 px-4 text-sm text-white/80 hover:text-[#FFE619]"
                        onClick={() => setMobileOpen(false)}
                      >
                        → {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
