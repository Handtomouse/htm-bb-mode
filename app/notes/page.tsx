import type { Metadata } from 'next'
import NotesContent from './NotesContent'

export const metadata: Metadata = {
  title: 'Notes | HandToMouse BB Mode',
  description: 'Sharp takes on brand strategy, creative practice, and cultural work.',
  openGraph: {
    title: 'Notes | HandToMouse BB Mode',
    description: 'Sharp takes on brand strategy, creative practice, and cultural work.',
    url: 'https://htm-bb-mode.vercel.app/notes',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function NotesPage() {
  return <NotesContent />
}
