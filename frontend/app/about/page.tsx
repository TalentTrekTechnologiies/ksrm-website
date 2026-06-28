import { Metadata } from "next"
import Container from "@/components/ui/Container"

export const metadata: Metadata = {
  title: "About Us | K.S.R.M College of Engineering",
  description: "Learn about K.S.R.M College of Engineering - 40 years of engineering excellence",
}

export default function AboutPage() {
  return (
    <main style={{ background: "#fff" }}>
      <section style={{
        background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
        padding: "80px 20px",
        color: "#fff",
        textAlign: "center"
      }}>
        <Container>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 20px", fontWeight: 700 }}>About K.S.R.M College</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>40 Years of Engineering Excellence</p>
        </Container>
      </section>

      <section style={{ padding: "60px 20px", background: "#fff" }}>
        <Container>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#2B3490", marginBottom: "20px" }}>Our Story</h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#555", marginBottom: "30px" }}>
              K.S.R.M College of Engineering was established in 1984, offering quality engineering education with a focus on industry-relevant curriculum and student development. We have successfully graduated thousands of engineers who are contributing to various sectors globally.
            </p>
          </div>
        </Container>
      </section>

      <section style={{ padding: "60px 20px", background: "#f4f3ef" }}>
        <Container>
          <h2 style={{ fontSize: "1.8rem", color: "#2B3490", marginBottom: "40px", textAlign: "center" }}>Our Stats</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px" }}>
            {[
              { number: "40+", label: "Years of Excellence" },
              { number: "7", label: "Departments" },
              { number: "2500+", label: "Students" },
              { number: "150+", label: "Faculty" },
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#2B3490", marginBottom: "10px" }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666", fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  )
}
