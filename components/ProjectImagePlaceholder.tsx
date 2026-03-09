'use client'

interface Props {
  client: string
  year: string | number
  tags?: string[]
  className?: string
}

export default function ProjectImagePlaceholder({ client, year, tags = [], className = '' }: Props) {
  // Get initials from client name (first letter of each word, max 3)
  const initials = client.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: '#0d0d0d', border: '1px solid #2A2A2A' }}
    >
      {/* Grid lines decoration */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.15,
        backgroundImage: 'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />
      {/* Initials */}
      <span style={{
        fontFamily: 'VT323, monospace',
        fontSize: 'clamp(48px, 15%, 80px)',
        color: '#ff9d23',
        opacity: 0.9,
        position: 'relative',
        zIndex: 1,
        letterSpacing: '0.1em'
      }}>
        {initials}
      </span>
      {/* Client name */}
      <span style={{
        fontFamily: 'Roboto Mono, monospace',
        fontSize: '10px',
        color: '#9A9A9A',
        position: 'relative',
        zIndex: 1,
        marginTop: '8px',
        letterSpacing: '0.15em'
      }}>
        {client.toUpperCase()}
      </span>
      {/* Year */}
      <span style={{
        fontFamily: 'VT323, monospace',
        fontSize: '14px',
        color: '#4A4A4A',
        position: 'relative',
        zIndex: 1,
        marginTop: '4px'
      }}>
        {year}
      </span>
      {/* Tags — optional, show first 2 */}
      {tags.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, marginTop: '12px', display: 'flex', gap: '6px' }}>
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{
              fontFamily: 'Roboto Mono, monospace',
              fontSize: '8px',
              color: '#ff9d23',
              opacity: 0.5,
              letterSpacing: '0.1em'
            }}>
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      )}
      {/* Orange corner accents */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderTop: '1px solid #ff9d23', borderLeft: '1px solid #ff9d23', opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '24px', height: '24px', borderBottom: '1px solid #ff9d23', borderRight: '1px solid #ff9d23', opacity: 0.4 }} />
    </div>
  )
}
