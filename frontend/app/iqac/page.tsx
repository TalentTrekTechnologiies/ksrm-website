import { Metadata } from "next"
import IQACTemplate from "@/components/iqac/IQACTemplate"

export const metadata: Metadata = {
  title: "IQAC | KSRM College of Engineering",
  description:
    "Internal Quality Assurance Cell (IQAC) at KSRM College - Committed to continuous quality improvement and institutional excellence.",
}

export default function IQACPage() {
  return <IQACTemplate />
}
