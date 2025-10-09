// Simple not-found page without importing custom components to avoid SSR issues
export default function NotFound() {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ marginBottom: '1rem', fontSize: '3rem' }}>404</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>This page could not be found.</p>
      <a
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        Go Home
      </a>
    </div>
  )
}
