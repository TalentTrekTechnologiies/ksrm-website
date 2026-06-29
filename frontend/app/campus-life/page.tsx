import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "Campus Life | K.S.R.M College of Engineering",
  description: "Campus Life information at K.S.R.M College",
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
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>
            Campus Life
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>K.S.R.M College</p>
        </Container>
      </section>
      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <Container>
          <p>Page content rendering...</p>
        </Container>
      </section>
    </main>
  )
}
