import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "News & Events | K.S.R.M College of Engineering",
  description: "Information about News & Events at K.S.R.M College of Engineering",
}

export default function PageComponent() {
  return (
    <main style={{ background: "#fff" }}>
      <section style={{
        background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
        padding: "80px 20px",
        color: "#fff",
        textAlign: "center"
      }}>
        <Container>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>News & Events</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>Excellence at K.S.R.M</p>
        </Container>
      </section>
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <Container>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#555" }}>
            News & Events section content and information displayed here.
          </p>
        </Container>
      </section>
    </main>
  )
}
