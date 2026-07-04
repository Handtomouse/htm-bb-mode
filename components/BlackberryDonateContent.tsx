'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// UPDATE THIS URL when Nate confirms his Ko-fi/BMC link
const DONATE_URL = "https://buymeacoffee.com/handtomouse"

export default function BlackberryDonateContent() {
  const [now, setNow] = useState(new Date())
  const [cursorVisible, setCursorVisible] = useState(true)

  // Live clock
  useEffect(() => {
    const clockId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clockId)
  }, [])

  // Blinking cursor
  useEffect(() => {
    const cursorId = setInterval(() => setCursorVisible(v => !v), 500)
    return () => clearInterval(cursorId)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const day = pad(now.getDate())
  const month = pad(now.getMonth() + 1)
  const year = now.getFullYear()
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())
  const dateStr = `${day}/${month}/${year}`
  const timeStr = `${hours}:${minutes}:${seconds}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        fontFamily: '"Roboto Mono", monospace',
        color: '#EDECEC',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Heading */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ color: '#F7A835', fontSize: '10px' }}>●</span>
          <span style={{
            fontFamily: '"argent-pixel-cf", "VT323", monospace',
            fontSize: '16px',
            letterSpacing: '0.15em',
            color: '#EDECEC',
          }}>
            SUPPORT THE WORK
          </span>
        </div>
        <div style={{ height: '1px', background: '#2A2A2A', width: '100%' }} />
      </div>

      {/* Receipt Terminal Block */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: '14px',
            color: '#94b039',
            background: '#050505',
            border: '1px solid #2A2A2A',
            padding: '16px',
            lineHeight: '1.6',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Scanline overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div>HANDTOMOUSE STUDIO</div>
            <div>TRANSACTION TERMINAL v1.0</div>
            <div style={{ borderBottom: '1px solid #2A2A2A', margin: '6px 0', borderColor: '#94b03940' }}>
              {'─'.repeat(28)}
            </div>
            <div>DATE: {dateStr}</div>
            <div>TIME: {timeStr}</div>
            <div>STATUS: ACCEPTING PAYMENTS</div>
            <div style={{ borderBottom: '1px solid #2A2A2A', margin: '6px 0', borderColor: '#94b03940' }}>
              {'─'.repeat(28)}
            </div>
            <div>ITEM: Creative work</div>
            <div>PRICE: Pay what it&apos;s worth</div>
            <div style={{ marginTop: '10px' }}>
              {'> '}
              <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s' }}>_</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copy text */}
      <div
        style={{
          fontFamily: '"Roboto Mono", monospace',
          fontSize: '12px',
          color: '#9A9A9A',
          lineHeight: '1.8',
          borderLeft: '2px solid #2A2A2A',
          paddingLeft: '12px',
        }}
      >
        <div>&quot;The work is free to look at.</div>
        <div>If it moved something in you,</div>
        <div>buy me a coffee.&quot;</div>
      </div>

      {/* Big Button */}
      <motion.button
        onClick={() => window.open(DONATE_URL, '_blank')}
        whileHover={{ backgroundColor: '#ffae4a' }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: '#F7A835',
          color: '#0b0b0b',
          fontFamily: '"Roboto Mono", monospace',
          fontWeight: 700,
          letterSpacing: '0.1em',
          fontSize: '13px',
          width: '100%',
          height: '48px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span>☕</span>
        <span>BUY ME A COFFEE</span>
        <span>→</span>
      </motion.button>

      {/* Fine print */}
      <div
        style={{
          fontFamily: '"Roboto Mono", monospace',
          fontSize: '10px',
          color: '#4A4A4A',
          textAlign: 'center',
          lineHeight: '1.6',
        }}
      >
        No pressure. No algorithm. No subscription.
        <br />
        Just good work, honestly made.
      </div>
    </motion.div>
  )
}
