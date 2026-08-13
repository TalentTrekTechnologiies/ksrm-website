import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Training Programmes",
  description: "Placement training and skill development programmes for students at K.S.R.M. College of Engineering, Kadapa.",
  path: "/placements/trainings",
})

import PlacementsSubnav from "@/components/PlacementsSubnav";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export default function TrainingsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .trainings-hero {
          position: relative;
          background-image: url('/site-images/seminar.webp');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .trainings-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .trainings-hero > * { position: relative; z-index: 2; }
        .trainings-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .trainings-breadcrumb a { color: #D4A500; text-decoration: none; }
        .trainings-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .trainings-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 17px;
          margin-top: 12px;
          max-width: 600px;
        }

        .trainings-intro-section { padding: 72px 0; background: #ffffff; }
        .trainings-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .trainings-framework-title { font-size: 15px; font-weight: 700; color: #D4A500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: inline-block; }
        .trainings-text { font-size: 17px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .trainings-stages-section { padding: 72px 0; background: #f4f3ef; }
        .trainings-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .trainings-stage-card { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; padding: 32px; margin-bottom: 28px; display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: start; transition: all 0.3s; }
        .trainings-stage-card:hover { box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .trainings-letter-circle { width: 80px; height: 80px; background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #D4A500; font-family: 'Rajdhani', sans-serif; font-size: clamp(29px, 7.7vw, 48px); font-weight: 700; flex-shrink: 0; }
        .trainings-stage-content h3 { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .trainings-stage-desc { font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 16px; }
        .trainings-stage-subheading { font-weight: 700; color: #2B3490; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
        .trainings-activities { list-style: none; padding: 0; margin: 8px 0 16px; }
        .trainings-activities li { padding: 6px 0 6px 24px; position: relative; font-size: 15px; color: #555; line-height: 1.5; }
        .trainings-activities li::before { content: '→'; position: absolute; left: 0; color: #D4A500; font-weight: 700; }
        .trainings-outcome { background: rgba(255,230,25,0.1); padding: 12px; border-left: 3px solid #D4A500; border-radius: 4px; font-size: 15px; color: #2B3490; font-weight: 600; margin: 0; }
        .trainings-advantage-section { padding: 72px 0; background: #ffffff; }
        .trainings-advantage-box { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #ffffff; padding: 40px; border-radius: 12px; margin: 40px 0; }
        .trainings-advantage-heading { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 16px; color: #D4A500; }
        .trainings-journey { background: rgba(255,230,25,0.1); border: 2px solid #D4A500; padding: 24px; border-radius: 8px; text-align: center; font-family: 'Rajdhani', sans-serif; font-size: 15px; color: #2B3490; font-weight: 700; line-height: 1.8; }
        @media (max-width: 768px) { .trainings-stage-card { grid-template-columns: 1fr; gap: 16px; } .trainings-letter-circle { width: 60px; height: 60px; font-size: clamp(22px, 5.8vw, 36px); } .trainings-text { text-align: left; } }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="trainings-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="trainings-title"><CmsText section="placements.trainings" slot="trainings" /></h1>
              <p className="trainings-subtitle"><CmsText section="placements.trainings" slot="placements-career-development" /></p>
            </div>
          </div>
        </section>
        <PlacementsSubnav active="/placements/trainings" />
        <section className="trainings-intro-section">
          <div className="responsive-container">
            <h2 className="trainings-heading"><CmsText section="placements.trainings" slot="trainings-2" /></h2>
            <p className="trainings-text"><CmsText section="placements.trainings" slot="at-k-s-r-m" multiline /></p>
          </div>
        </section>
      
      <PageResources section="placements.trainings" />
      </main>
    </>
  );
}
