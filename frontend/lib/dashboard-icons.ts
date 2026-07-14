import {
  Users,
  Newspaper,
  Image as ImageIcon,
  Briefcase,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  Radio,
  UserCog,
  Building2,
  FlaskConical,
  FileArchive,
  UsersRound,
  LayoutTemplate,
  Phone,
  Settings,
  ShieldCheck,
  ClipboardCheck,
  ClipboardList,
  HardDrive,
  Library,
  type LucideIcon,
} from "lucide-react"

/** One entry per RBAC module / DashboardWidget.key - shared between
 * AdminSidebar and DashboardCard so both stay visually consistent. */
export const WIDGET_ICONS: Record<string, LucideIcon> = {
  faculty: Users,
  departments: Building2,
  news: Newspaper,
  gallery: ImageIcon,
  placements: Briefcase,
  exam_notifications: CalendarClock,
  research: FlaskConical,
  downloads: FileArchive,
  committees: UsersRound,
  page_content: LayoutTemplate,
  contact: Phone,
  site_settings: Settings,
  admins: UserCog,
  roles: ShieldCheck,
  pending_approvals: ClipboardCheck,
  storage: HardDrive,
  media: Library,
  careers: BriefcaseBusiness,
  career_applications: ClipboardList,
  events: CalendarDays,
  announcements: Radio,
}

export function widgetIcon(key: string): LucideIcon {
  return WIDGET_ICONS[key] ?? Building2
}
