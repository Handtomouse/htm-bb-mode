import type { Metadata } from 'next'
import ClientsContent from './ClientsContent'

export const metadata: Metadata = {
  title: 'Clients | HandToMouse BB Mode',
  description: '35+ clients across fashion, wellness, finance, food, and culture. Sydney-based creative studio.',
  openGraph: {
    title: 'Clients | HandToMouse BB Mode',
    description: '35+ clients across fashion, wellness, finance, food, and culture. Sydney-based creative studio.',
    url: 'https://htm-bb-mode.vercel.app/clients',
    siteName: 'HandToMouse BB Mode',
    type: 'website',
  },
}

export default function ClientsPage() {
  return <ClientsContent />
}
