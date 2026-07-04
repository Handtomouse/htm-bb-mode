'use client'

interface Props {
  client: string
  year: string | number
  tags?: string[]
  description?: string
  className?: string
}

export default function ProjectImagePlaceholder({
  client,
  year,
  tags = [],
  description,
  className = '',
}: Props) {
  return (
    <div
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{
        background: '#0d0d0d',
        borderLeft: '3px solid #ff9d23',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Subtle grid bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage:
            'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Corner bracket — top right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20px',
          height: '20px',
          borderBottom: '1px solid #ff9d23',
          borderLeft: '1px solid #ff9d23',
          opacity: 0.35,
        }}
      />

      {/* Content block */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '20px 20px 16px 20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: client + year */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
            <span
              style={{
                fontFamily: 'VT323, monospace',
                fontSize: 'clamp(22px, 5vw, 32px)',
                color: '#f0f0f0',
                lineHeight: 1,
                letterSpacing: '0.04em',
              }}
            >
              {client.toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '11px',
                color: '#4A4A4A',
                letterSpacing: '0.08em',
              }}
            >
              {year}
            </span>
          </div>

          {/* Service tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: '9px',
                    color: '#ff9d23',
                    border: '1px solid rgba(255,157,35,0.35)',
                    padding: '2px 6px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* One-line description */}
          {description && (
            <p
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '10px',
                color: '#6A6A6A',
                lineHeight: 1.5,
                letterSpacing: '0.03em',
                margin: 0,
                maxHeight: '3em',
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Bottom: image pending indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontSize: '9px',
              color: '#2E2E2E',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            [image pending]
          </span>
        </div>
      </div>
    </div>
  )
}
