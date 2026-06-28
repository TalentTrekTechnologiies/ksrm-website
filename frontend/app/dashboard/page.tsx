import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2B3490 0%, #1e2570 100%)', color: '#fff' }}>
      <style>{`
        .dashboard-stub {
          text-align: center;
          max-width: 500px;
          padding: 40px;
        }
        .dashboard-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px;
          font-family: 'Rajdhani', sans-serif;
        }
        .dashboard-text {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 0 0 32px;
        }
        .dashboard-link {
          display: inline-block;
          padding: 12px 28px;
          background: #D4A500;
          color: #1a1a2e;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .dashboard-link:hover {
          background: #e6b800;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="dashboard-stub">
        <div className="dashboard-icon">
          <Lock size={40} color="rgba(255,255,255,0.8)" />
        </div>
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-text">
          The admin dashboard is protected and requires authentication. This is a static demo version of the site.
        </p>
        <p className="dashboard-text" style={{ fontSize: 14 }}>
          For full admin functionality, deploy the backend API and access the login portal.
        </p>
        <Link href="/" className="dashboard-link">
          Return to Home
        </Link>
      </div>
    </main>
  )
}
