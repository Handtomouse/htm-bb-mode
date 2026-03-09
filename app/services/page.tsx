import type { Metadata } from 'next'
import ServicesContent from './ServicesContent'

export const metadata: Metadata = {
  title: 'Services | HandToMouse BB Mode',
  description: 'Brand strategy, creative direction, content, and design services from HandToMouse Studio.',
  openGraph: {
    title: 'Services | HandToMouse BB Mode',
    description: 'Brand strategy, creative direction, content, and design services from HandToMouse Studio.',
    url: 'https://htm-bb-mode.vercel.app/services',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function ServicesPage() {
  return <ServicesContent />
}
