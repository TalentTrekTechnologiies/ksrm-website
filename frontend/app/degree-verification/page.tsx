import { Metadata } from "next"
import DegreeVerificationTemplate from "@/components/degreeVerification/DegreeVerificationTemplate"

export const metadata: Metadata = {
  title: "Degree Verification | KSRM College of Engineering",
  description:
    "Verify the authenticity of degrees issued by KSRM College of Engineering through iCredify platform.",
}

export default function DegreeVerificationPage() {
  return <DegreeVerificationTemplate />
}
