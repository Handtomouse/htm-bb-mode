import type { Metadata } from 'next'
import ContactContent from './ContactContent'

export const metadata: Metadata = {
  title: 'Contact | HandToMouse BB Mode',
  description: 'Start a project with HandToMouse Studio. Brand strategy, creative direction, and design from Sydney.',
  openGraph: {
    title: 'Contact | HandToMouse BB Mode',
    description: 'Start a project with HandToMouse Studio. Brand strategy, creative direction, and design from Sydney.',
    url: 'https://htm-bb-mode.vercel.app/contact',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactContent />
}
