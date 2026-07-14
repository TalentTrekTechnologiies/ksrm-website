import Hero from "@/components/home/Hero"
import CampusStats from "@/components/home/CampusStats"
import VisionMissionTabs from "@/components/home/VisionMissionTabs"
import AboutPreview from "@/components/home/AboutPreview"
import WhyChooseKSRM from "@/components/home/WhyChooseKSRM"
import CampusServices from "@/components/home/CampusServices"
import Departments from "@/components/home/Departments"
import NewsAndEvents from "@/components/home/NewsAndEvents"
import Admissions from "@/components/home/Admissions"
import Placements from "@/components/home/Placements"
import Testimonials from "@/components/home/Testimonials"
import CampusGallery from "@/components/home/CampusGallery"
import CampusVideos from "@/components/home/CampusVideos"
import Accreditation from "@/components/home/Accreditation"

export default function Home() {
  return (
    <main>
      <Hero />
      <CampusStats />
      <VisionMissionTabs />
      <AboutPreview />
      <WhyChooseKSRM />
      <CampusServices />
      <Departments />
      <NewsAndEvents />
      <Admissions />
      <Placements />
      <Testimonials />
      <CampusGallery />
      <CampusVideos />
      <Accreditation />
    </main>
  )
}
