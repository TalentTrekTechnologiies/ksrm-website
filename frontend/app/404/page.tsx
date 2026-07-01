export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '64px', fontWeight: 'bold', margin: '0 0 16px' }}>404</h1>
      <p style={{ fontSize: '20px', color: '#666', margin: '0 0 32px' }}>Page not found</p>
      <a href="/" style={{ padding: '12px 24px', background: '#2B3490', color: 'white', textDecoration: 'none', borderRadius: '6px' }}>Go Home</a>
    </div>
  )
}
