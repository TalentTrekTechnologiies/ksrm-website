import Hero from "@/components/home/Hero"
import StatsBar from "@/components/home/StatsBar"
import VisionMissionTabs from "@/components/home/VisionMissionTabs"
import AboutPreview from "@/components/home/AboutPreview"
import CampusServices from "@/components/home/CampusServices"
import Departments from "@/components/home/Departments"
import LatestNews from "@/components/home/LatestNews"
import Admissions from "@/components/home/Admissions"
import Placements from "@/components/home/Placements"
import Recruiters from "@/components/home/Recruiters"
import Testimonials from "@/components/home/Testimonials"
import CampusVideos from "@/components/home/CampusVideos"
import Accreditation from "@/components/home/Accreditation"

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <VisionMissionTabs />
      <AboutPreview />
      <CampusServices />
      <Departments />
      <LatestNews />
      <Admissions />
      <Placements />
      <Recruiters />
      <Testimonials />
      <CampusVideos />
      <Accreditation />
    </main>
  )
}
