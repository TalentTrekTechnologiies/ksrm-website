import {
  Users,
  Newspaper,
  Image as ImageIcon,
  Briefcase,
  CalendarClock,
  Megaphone,
  GraduationCap,
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
  HardDrive,
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
  notifications: Megaphone,
  research: FlaskConical,
  degree_verification: GraduationCap,
  downloads: FileArchive,
  committees: UsersRound,
  page_content: LayoutTemplate,
  contact: Phone,
  site_settings: Settings,
  admins: UserCog,
  roles: ShieldCheck,
  pending_approvals: ClipboardCheck,
  storage: HardDrive,
}

export function widgetIcon(key: string): LucideIcon {
  return WIDGET_ICONS[key] ?? Building2
}
