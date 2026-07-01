import PlacementsSubnav from "@/components/PlacementsSubnav";

export default function TrainingsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        .trainings-section { padding: 72px 0; background: #ffffff; }
        .trainings-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .trainings-text { font-size: 16px; line-height: 1.8; color: #555; margin: 16px 0; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <PlacementsSubnav active="/placements/trainings" />
        <section className="trainings-section">
          <div className="responsive-container">
            <h2 className="trainings-heading">Trainings & k-ReATE Framework</h2>
            <p className="trainings-text">At K.S.R.M. College of Engineering, the k-ReATE Framework (Knowledge for Recruitment And Talent Enablement) provides a comprehensive roadmap for student development through assessment, skill development, practical application, certifications, industry exposure, and placement readiness.</p>
            <p className="trainings-text">The framework integrates training, practice, certification, and industry engagement to empower students with the competencies required for successful careers.</p>
          </div>
        </section>
      </main>
    </>
  );
}
