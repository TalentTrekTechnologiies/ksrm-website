import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "Gallery | K.S.R.M College of Engineering",
  description: "Photo gallery of K.S.R.M College",
}

export default function GalleryPage() {
  return (
    <main style={{ background: "#fff" }}>
      <section style={{
        background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
        padding: "80px 0",
        color: "#fff"
      }}>
        <Container>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>Gallery</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>Campus Photo Gallery</p>
        </Container>
      </section>
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <Container>
          <p>Gallery of campus facilities and events</p>
        </Container>
      </section>
    </main>
  )
}
