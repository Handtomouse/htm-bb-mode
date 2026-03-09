import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0b0b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Roboto Mono, monospace',
      color: '#EDECEC',
      padding: '24px',
      textAlign: 'center'
    }}>
      {/* Error code */}
      <div style={{
        fontFamily: 'VT323, monospace',
        fontSize: 'clamp(80px, 20vw, 140px)',
        color: '#ff9d23',
        lineHeight: 1,
        marginBottom: '8px'
      }}>
        404
      </div>

      {/* BB-style error message */}
      <div style={{
        fontFamily: 'Roboto Mono, monospace',
        fontSize: '11px',
        color: '#9A9A9A',
        letterSpacing: '0.15em',
        marginBottom: '4px'
      }}>
        ERROR :: PAGE_NOT_FOUND
      </div>

      <div style={{
        fontFamily: 'Roboto Mono, monospace',
        fontSize: '11px',
        color: '#4A4A4A',
        letterSpacing: '0.1em',
        marginBottom: '48px'
      }}>
        The page you requested does not exist on this device.
      </div>

      {/* Decorative grid */}
      <div style={{
        width: '120px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #ff9d23, transparent)',
        marginBottom: '48px',
        opacity: 0.5
      }} />

      {/* Back button */}
      <Link href="/" style={{
        display: 'inline-block',
        fontFamily: 'Roboto Mono, monospace',
        fontSize: '11px',
        letterSpacing: '0.15em',
        color: '#0b0b0b',
        background: '#ff9d23',
        padding: '10px 24px',
        textDecoration: 'none',
        transition: 'background 0.2s'
      }}>
        ← RETURN TO DEVICE
      </Link>

      {/* Bottom status bar */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        fontFamily: 'VT323, monospace',
        fontSize: '13px',
        color: '#2A2A2A',
        letterSpacing: '0.1em'
      }}>
        HANDTOMOUSE BB-MODE v1.0 :: SYS_ERROR
      </div>
    </div>
  )
}
