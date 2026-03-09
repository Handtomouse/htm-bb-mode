import type { Metadata } from 'next'
import PortfolioContent from './PortfolioContent'

export const metadata: Metadata = {
  title: 'Work | HandToMouse BB Mode',
  description: 'Selected projects in brand identity, campaigns, content strategy, and digital design.',
  openGraph: {
    title: 'Work | HandToMouse BB Mode',
    description: 'Selected projects in brand identity, campaigns, content strategy, and digital design.',
    url: 'https://htm-bb-mode.vercel.app/portfolio',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function PortfolioPage() {
  return <PortfolioContent />
}
