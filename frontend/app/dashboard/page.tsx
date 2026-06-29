import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "Page | K.S.R.M College of Engineering",
  description: "K.S.R.M College information",
}

export default function Page() {
  return (
    <main style={{ background: "#fff" }}>
      <section style={{
        background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
        padding: "80px 20px",
        color: "#fff",
        textAlign: "center"
      }}>
        <Container>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>Page</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>K.S.R.M College</p>
        </Container>
      </section>
    </main>
  )
}
