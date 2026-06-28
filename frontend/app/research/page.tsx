'use client'

import { motion } from 'framer-motion'
import PlacementsTabs from './PlacementsTabs'
import Container from '@/components/ui/Container'
import { Briefcase, Zap, Code, Users, Target, Lightbulb, Award, Rocket } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function PlacementsInternshipsTemplate() {
  const ecosystemItems = [
    { icon: Briefcase, title: 'Industry-Sponsored Internship Programs' },
    { icon: Zap, title: 'Virtual Internship Opportunities' },
    { icon: Code, title: 'Technology Partner Internship Programs' },
    { icon: Target, title: 'Project-Based Internships' },
    { icon: Award, title: 'Certification-Integrated Internships' },
    { icon: Users, title: 'Summer and Semester Internships' },
    { icon: Lightbulb, title: 'Innovation and Research Internships' },
    { icon: Rocket, title: 'Startup and Entrepreneurship Internships' },
  ]

  return (
    <main style={{ background: '#ffffff' }}>
      <style>{`
        .internships-intro-section {
          padding: 72px 0;
          background: #ffffff;
        }
        .internships-heading {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 24px;
        }
        .internships-text {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          text-align: justify;
          margin: 16px 0;
        }
        .internships-highlights-section {
          padding: 72px 0;
          background: #f4f3ef;
        }
        .internships-section-heading {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 48px;
          text-align: center;
        }
        .internships-list {
          list-style: none;
          padding: 0;
          margin: 32px 0;
        }
        .internships-list li {
          padding: 12px 0 12px 28px;
          position: relative;
          font-size: 15px;
          color: #555;
          line-height: 1.6;
        }
        .internships-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #FFE619;
          font-weight: 700;
          font-size: 16px;
        }
        .internships-ecosystem-section {
          padding: 72px 0;
          background: #ffffff;
        }
        .internships-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px;
          margin-top: 40px;
        }
        .internships-card {
          background: #ffffff;
          border: 1px solid #eef0f3;
          border-radius: 8px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .internships-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
          border-color: #FFE619;
        }
        .internships-icon-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #FFE619;
        }
        .internships-icon-circle svg {
          width: 28px;
          height: 28px;
        }
        .internships-card-text {
          font-size: 15px;
          color: #555;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }
        .internships-outcomes-section {
          padding: 72px 0;
          background: #f4f3ef;
        }
        .internships-closing-text {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          text-align: justify;
          margin: 32px 0 0;
          font-style: italic;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .internships-text {
            text-align: left;
          }
          .internships-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }
        }
      `}</style>

      <PlacementsTabs />

      {/* INTRO SECTION */}
      <section className="internships-intro-section">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <h2 className="internships-heading">Internships</h2>
              <p className="internships-text">
                At K.S.R.M. College of Engineering, internships are an integral component of the student development ecosystem, providing valuable opportunities to bridge the gap between classroom learning and industry practice. Through strategic partnerships and Memoranda of Understanding (MoUs) with leading organizations, technology providers, and industry partners, the institution facilitates meaningful internship experiences that enhance technical competencies, professional skills, and workplace readiness.
              </p>
              <p className="internships-text">
                The Training & Placement Cell actively collaborates with industry partners to identify and create internship opportunities across diverse domains, including Software Development, Artificial Intelligence & Machine Learning, Data Science, Cloud Computing, Cybersecurity, Networking, Enterprise Technologies, Core Engineering, and Emerging Technologies.
              </p>
              <p className="internships-text">
                As part of the k-ReATE Framework, students are encouraged to participate in internships that complement their academic learning and provide exposure to real-world challenges, industry tools, professional work environments, and project-based learning experiences.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* KEY HIGHLIGHTS SECTION */}
      <section className="internships-highlights-section">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <h2 className="internships-section-heading">Key Highlights</h2>
              <ul className="internships-list">
                <li>Industry internships facilitated through institutional MoUs and strategic partnerships.</li>
                <li>Virtual and onsite internship opportunities across technology and core engineering domains.</li>
                <li>Internship pathways integrated with certification programs offered by industry partners.</li>
                <li>Access to project-based learning experiences aligned with current industry requirements.</li>
                <li>Opportunities to work on real-world business problems, case studies, and live projects.</li>
                <li>Mentoring and guidance from industry professionals and domain experts.</li>
                <li>Internship opportunities through platforms and initiatives offered by leading organizations and technology ecosystems.</li>
              </ul>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* INDUSTRY COLLABORATIONS */}
      <section className="internships-ecosystem-section">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <h2 className="internships-section-heading">Industry Collaborations</h2>
              <p className="internships-text">
                KSRMCE has established collaborations with renowned organizations and learning ecosystems to provide students with exposure to industry practices, emerging technologies, and experiential learning opportunities. These partnerships enable students to participate in internships, industry projects, skill development programs, certifications, hackathons, and innovation initiatives that strengthen their professional competencies.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* INTERNSHIP ECOSYSTEM SECTION */}
      <section className="internships-ecosystem-section" style={{ background: '#f4f3ef' }}>
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <h2 className="internships-section-heading">Our Internship Ecosystem Includes</h2>
            <div className="internships-grid">
              {ecosystemItems.map((item, idx) => {
                const IconComponent = item.icon
                return (
                  <motion.div key={idx} variants={fadeUp} className="internships-card">
                    <div className="internships-icon-circle">
                      <IconComponent />
                    </div>
                    <p className="internships-card-text">{item.title}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* OUTCOMES SECTION */}
      <section className="internships-outcomes-section">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <h2 className="internships-section-heading">Outcomes</h2>
              <p className="internships-text" style={{ marginTop: '0' }}>
                Internships enable students to:
              </p>
              <ul className="internships-list">
                <li>Apply theoretical knowledge in practical environments.</li>
                <li>Develop problem-solving and critical-thinking abilities.</li>
                <li>Gain exposure to industry tools, technologies, and best practices.</li>
                <li>Build professional networks and workplace competencies.</li>
                <li>Enhance employability through hands-on experience and industry-recognized achievements.</li>
                <li>Improve readiness for campus recruitment and future career opportunities.</li>
              </ul>
              <p className="internships-closing-text">
                At KSRMCE, internships are not merely academic requirements; they are transformational learning experiences that prepare students to become confident, competent, and industry-ready professionals. This positioning emphasizes KSRM's strength in leveraging MoUs with organizations such as ServiceNow, Cisco Networking Academy, Oracle Academy, AWS Academy, Salesforce, IBM, Infosys Springboard, Snowflake Academy, and other industry partners to create structured internship pathways rather than relying solely on conventional internship drives.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
