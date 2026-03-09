'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Message {
  from: 'me' | 'them'
  text: string
  time: string
}

interface Thread {
  id: string
  contact: string
  avatar: string
  preview: string
  time: string
  unread: boolean
  messages: Message[]
}

const threads: Thread[] = [
  {
    id: 'client',
    contact: 'Client',
    avatar: 'C',
    preview: 'can we make the logo bigger?',
    time: '9:47 AM',
    unread: true,
    messages: [
      { from: 'them', text: 'hey just had a look at the logo concepts', time: '9:32 AM' },
      { from: 'them', text: "they're great but can we make it bigger?", time: '9:33 AM' },
      { from: 'me', text: 'How much bigger?', time: '9:35 AM' },
      { from: 'them', text: 'like... all of it. can the logo just be the whole page', time: '9:41 AM' },
      { from: 'me', text: "I'll look into it", time: '9:47 AM' },
    ],
  },
  {
    id: 'mum',
    contact: 'Mum',
    avatar: 'M',
    preview: 'proud of you x',
    time: 'Yesterday',
    unread: true,
    messages: [
      { from: 'them', text: 'i saw your website on the computer', time: '3:12 PM' },
      { from: 'them', text: 'it looks like a phone from the olden days??', time: '3:13 PM' },
      { from: 'me', text: "That's the point Mum", time: '3:45 PM' },
      { from: 'them', text: 'well i think it\'s clever. proud of you x', time: '3:47 PM' },
    ],
  },
  {
    id: 'industry',
    contact: 'The Industry',
    avatar: '◈',
    preview: "let's circle back on this",
    time: 'Tuesday',
    unread: true,
    messages: [
      { from: 'them', text: 'we love the concept but the budget has... moved', time: '10:00 AM' },
      { from: 'me', text: 'Moved where?', time: '10:15 AM' },
      { from: 'them', text: 'downward. significantly. but the exposure will be incredible', time: '10:17 AM' },
      { from: 'me', text: "I'll have my people call your people", time: '10:18 AM' },
      { from: 'them', text: "great let's circle back on this", time: '10:19 AM' },
      { from: 'them', text: 'actually can you do it for free? great portfolio piece', time: '10:22 AM' },
    ],
  },
]

export default function BlackberryMessageContent() {
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [readThreads, setReadThreads] = useState<Set<string>>(new Set())

  const openThread = (id: string) => {
    setReadThreads(prev => new Set(prev).add(id))
    setActiveThread(id)
  }

  const closeThread = () => {
    setActiveThread(null)
  }

  const currentThread = threads.find(t => t.id === activeThread) ?? null
  const unreadCount = threads.filter(t => t.unread && !readThreads.has(t.id)).length

  return (
    <div
      style={{
        fontFamily: '"Roboto Mono", monospace',
        color: '#EDECEC',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <AnimatePresence mode="wait">
        {activeThread === null ? (
          /* ── Thread List View ── */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #2A2A2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: '"argent-pixel-cf", "VT323", monospace',
                    fontSize: '15px',
                    letterSpacing: '0.15em',
                    color: '#EDECEC',
                  }}
                >
                  MESSAGES
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#ff9d23',
                      color: '#0b0b0b',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontFamily: '"Roboto Mono", monospace',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <span style={{ color: '#4A4A4A', fontSize: '12px' }}>‹</span>
            </div>

            {/* Thread rows */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {threads.map((thread, i) => {
                const isUnread = thread.unread && !readThreads.has(thread.id)
                return (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    onClick={() => openThread(thread.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #1a1a1a',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    whileHover={{ backgroundColor: '#131313' }}
                  >
                    {/* Unread dot */}
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isUnread ? '#ff9d23' : 'transparent',
                        flexShrink: 0,
                      }}
                    />

                    {/* Avatar */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#1a1a1a',
                        border: '1px solid #2A2A2A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: '"VT323", monospace',
                        fontSize: '16px',
                        color: '#ff9d23',
                      }}
                    >
                      {thread.avatar}
                    </div>

                    {/* Text content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: isUnread ? 700 : 400,
                          fontSize: '12px',
                          color: '#EDECEC',
                          marginBottom: '2px',
                        }}
                      >
                        {thread.contact}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9A9A9A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {thread.preview}
                      </div>
                    </div>

                    {/* Time */}
                    <div
                      style={{
                        fontFamily: '"VT323", monospace',
                        fontSize: '12px',
                        color: '#9A9A9A',
                        flexShrink: 0,
                      }}
                    >
                      {thread.time}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ) : (
          /* ── Thread / Message View ── */
          <motion.div
            key={`thread-${activeThread}`}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #2A2A2A',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
              }}
            >
              <button
                onClick={closeThread}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff9d23',
                  cursor: 'pointer',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '14px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ←
              </button>
              <span
                style={{
                  fontFamily: '"argent-pixel-cf", "VT323", monospace',
                  fontSize: '15px',
                  letterSpacing: '0.12em',
                  color: '#EDECEC',
                }}
              >
                {currentThread?.contact.toUpperCase()}
              </span>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {currentThread?.messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.from === 'me' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 10px',
                      background: msg.from === 'me' ? '#1a3a1a' : '#131313',
                      border: `1px solid ${msg.from === 'me' ? '#94b039' : '#2A2A2A'}`,
                      fontSize: '12px',
                      fontFamily: '"Roboto Mono", monospace',
                      color: '#EDECEC',
                      lineHeight: '1.5',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: '11px',
                      color: '#4A4A4A',
                      marginTop: '2px',
                      paddingLeft: msg.from === 'me' ? '0' : '4px',
                      paddingRight: msg.from === 'me' ? '4px' : '0',
                    }}
                  >
                    {msg.time}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Fake input bar */}
            <div
              style={{
                borderTop: '1px solid #2A2A2A',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0b0b0b',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: '#131313',
                  border: '1px solid #2A2A2A',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontFamily: '"Roboto Mono", monospace',
                  color: '#4A4A4A',
                }}
              >
                Message...
              </div>
              <div style={{ color: '#4A4A4A', fontSize: '14px' }}>›</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
