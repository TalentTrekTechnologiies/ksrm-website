import { Metadata } from "next"
import ExamNotificationsManager from "@/components/admin/ExamNotificationsManager"

export const metadata: Metadata = {
  title: "Exam Notifications | K.S.R.M. College of Engineering",
}

export default function ExamNotificationsPage() {
  return <ExamNotificationsManager />
}
