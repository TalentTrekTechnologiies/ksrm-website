import Hero from "@/components/home/Hero"
import Achievements from "@/components/home/Achievements"
import VisionMissionTabs from "@/components/home/VisionMissionTabs"
import AboutPreview from "@/components/home/AboutPreview"
import CampusServices from "@/components/home/CampusServices"
import Departments from "@/components/home/Departments"
import LatestNews from "@/components/home/LatestNews"
import Accreditation from "@/components/home/Accreditation"

export default function Home() {
  return (
    <main>
      <Hero />
      <Achievements />
      <VisionMissionTabs />
      <AboutPreview />
      <CampusServices />
      <Departments />
      <LatestNews />
      <Accreditation />
    </main>
  )
}
