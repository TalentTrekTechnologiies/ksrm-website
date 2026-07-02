export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "64px", marginBottom: "16px" }}>404</h1>
        <p>Page not found.</p>
      </div>
    </main>
  );
}