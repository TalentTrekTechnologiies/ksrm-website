import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "News & Events | K.S.R.M College of Engineering",
  description: "Latest news and events from K.S.R.M College",
}

export default function NewsPage() {
  return (
    <main style={{ background: "#fff" }}>
      <section style={{
        background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
        padding: "80px 0",
        color: "#fff"
      }}>
        <Container>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>News & Events</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>Latest Updates</p>
        </Container>
      </section>
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <Container>
          <p>Latest news and events from campus</p>
        </Container>
      </section>
    </main>
  )
}
