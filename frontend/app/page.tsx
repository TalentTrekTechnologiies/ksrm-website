import Hero from "@/components/home/Hero"
import CampusStats from "@/components/home/CampusStats"
import VisionMissionTabs from "@/components/home/VisionMissionTabs"
import AboutPreview from "@/components/home/AboutPreview"
import CampusServices from "@/components/home/CampusServices"
import Departments from "@/components/home/Departments"
import LatestNews from "@/components/home/LatestNews"
import Admissions from "@/components/home/Admissions"
import Placements from "@/components/home/Placements"
import Testimonials from "@/components/home/Testimonials"
import CampusVideos from "@/components/home/CampusVideos"
import Accreditation from "@/components/home/Accreditation"

export default function Home() {
  return (
    <main>
      <Hero />
      <CampusStats />
      <VisionMissionTabs />
      <AboutPreview />
      <CampusServices />
      <Departments />
      <LatestNews />
      <Admissions />
      <Placements />
      <Testimonials />
      <CampusVideos />
      <Accreditation />
    </main>
  )
}
