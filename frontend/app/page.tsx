import Hero from "@/components/home/Hero"
import StatsBar from "@/components/home/StatsBar"
import AboutPreview from "@/components/home/AboutPreview"
import CampusServices from "@/components/home/CampusServices"
import Departments from "@/components/home/Departments"
import LatestNews from "@/components/home/LatestNews"
import Placements from "@/components/home/Placements"
import Accreditation from "@/components/home/Accreditation"

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <AboutPreview />
      <CampusServices />
      <Departments />
      <LatestNews />
      <Placements />
      <Accreditation />
    </main>
  )
}
