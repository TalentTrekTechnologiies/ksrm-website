import React from "react";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  imagePath: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  eyebrow?: string;
}

export function HeroBanner({
  title,
  subtitle,
  imagePath,
  breadcrumbs,
  eyebrow,
}: HeroBannerProps) {
  return (
    <>
      <style>{`
        .hero-banner {
          position: relative;
          background-image: url('${imagePath}');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }

        .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(0, 0, 0, 0.25) 100%
          );
          z-index: 1;
        }

        .hero-banner-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          padding: 0 40px;
          color: white;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 1024px) {
          .hero-banner-content {
            padding: 0 32px;
          }
        }

        @media (max-width: 768px) {
          .hero-banner-content {
            padding: 0 20px;
          }
        }

        .hero-eyebrow {
          display: inline-block;
          background: #D4A500;
          color: #2B3490;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 16px;
          text-shadow: none;
        }

        .hero-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          line-height: 1.08;
          margin: 0 0 16px;
        }

        .hero-subtitle {
          font-size: 19px;
          font-weight: 400;
          line-height: 1.6;
          margin: 0;
          max-width: 700px;
          opacity: 0.95;
        }

        .hero-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          margin-top: 24px;
          opacity: 0.85;
        }

        .hero-breadcrumb a {
          color: #D4A500;
          text-decoration: none;
          font-weight: 600;
        }

        .hero-breadcrumb a:hover {
          opacity: 0.7;
        }

        .hero-breadcrumb span {
          color: #D4A500;
        }
      `}</style>

      <section className="hero-banner">
        <div className="hero-banner-content">
          {eyebrow && <div className="hero-eyebrow">{eyebrow}</div>}
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hero-breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.href ? (
                    <a href={crumb.href}>{crumb.label}</a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default HeroBanner;
