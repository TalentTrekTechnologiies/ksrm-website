import { Metadata } from "next"
import GalleryTemplate from "@/components/gallery/GalleryTemplate"

export const metadata: Metadata = {
  title: "Gallery | KSRM College of Engineering",
  description:
    "Photo gallery of KSRM College - campus events, infrastructure, sports, cultural activities and achievements.",
}

export default function GalleryPage() {
  return <GalleryTemplate />
}
