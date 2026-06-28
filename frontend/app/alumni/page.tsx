import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "Alumni | K.S.R.M College of Engineering",
  description: "Alumni network and information",
}

export default function AlumniPage() {
  return (
    <main style={{ background: "#fff" }}>
      <section style={{
        background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
        padding: "80px 0",
        color: "#fff"
      }}>
        <Container>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>Alumni</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>Connect with Alumni Network</p>
        </Container>
      </section>
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <Container>
          <p>Alumni network and success stories</p>
        </Container>
      </section>
    </main>
  )
}
